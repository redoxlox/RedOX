from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
import logging
from logging.handlers import RotatingFileHandler
from functools import wraps
import sqlite3

# تحميل متغيرات البيئة
load_dotenv()

# إعداد التطبيق
app = Flask(__name__, static_folder='static', template_folder='templates')

# التأكد من وجود SECRET_KEY آمن
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY must be set in .env file and be at least 32 characters long")

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
app.config['SESSION_COOKIE_HTTPONLY'] = os.getenv('SESSION_COOKIE_HTTPONLY', 'True') == 'True'
app.config['SESSION_COOKIE_SAMESITE'] = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

# CORS configuration
CORS(app, supports_credentials=True)

# Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
)

# إعداد نظام السجلات (Logging)
if not os.path.exists('logs'):
    os.makedirs('logs')

log_level = os.getenv('LOG_LEVEL', 'INFO')
log_file = os.getenv('LOG_FILE', 'logs/app.log')

file_handler = RotatingFileHandler(log_file, maxBytes=10240000, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(getattr(logging, log_level))

app.logger.addHandler(file_handler)
app.logger.setLevel(getattr(logging, log_level))
app.logger.info('Perplexity Pro Application startup')

# إعدادات قاعدة البيانات
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///perplexity_pro.db')  # افتراضي إذا غير موجود
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env file")

# تحديد نوع قاعدة البيانات
USE_SQLITE = DATABASE_URL.startswith('sqlite:///')
app.logger.info(f"Using {'SQLite' if USE_SQLITE else 'PostgreSQL'} database")

# Admin credentials
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD_HASH = os.getenv('ADMIN_PASSWORD_HASH', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7')  # hash لـ Admin123 (من السابق)
if not ADMIN_PASSWORD_HASH:
    raise ValueError("ADMIN_PASSWORD_HASH must be set in .env file")

# معلومات SMTP
SMTP_ENABLED = os.getenv('EMAIL_ENABLED', 'false').lower() == 'true'
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL')

# ============================================
# Database Connection Management
# ============================================

def get_db_connection():
    """الاتصال بقاعدة البيانات (SQLite من .env)"""
    db_path = DATABASE_URL.replace('sqlite:///', '') if USE_SQLITE else 'perplexity_pro.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # dicts للنتائج
    app.logger.info(f"Connected to SQLite: {db_path}")
    return conn

def init_db():
    """إنشاء جدول messages إذا غير موجود"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subscription_type TEXT NOT NULL,
            message TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM messages")
    count = cur.fetchone()[0]
    app.logger.info(f"Database ready - Total messages: {count}")
    conn.close()

# ============================================
# Email Function with Real SMTP
# ============================================

def send_email_smtp(subject, body, to_email=None):
    """إرسال بريد إلكتروني حقيقي عبر SMTP"""
    
    # Debug logging
    app.logger.info(f"=== Email Debug Info ===")
    app.logger.info(f"SMTP_ENABLED: {SMTP_ENABLED} (type: {type(SMTP_ENABLED)})")
    app.logger.info(f"SMTP_USERNAME: {SMTP_USERNAME}")
    app.logger.info(f"SMTP_PASSWORD exists: {'Yes' if SMTP_PASSWORD else 'No'}")
    app.logger.info(f"RECIPIENT_EMAIL: {RECIPIENT_EMAIL}")
    app.logger.info(f"========================")
    
    if not SMTP_ENABLED:
        app.logger.warning("Email sending is disabled in configuration")
        return False
    
    if not all([SMTP_USERNAME, SMTP_PASSWORD, RECIPIENT_EMAIL]):
        app.logger.error(f"SMTP credentials not configured. Missing: {[x for x, v in [('USERNAME', SMTP_USERNAME), ('PASSWORD', SMTP_PASSWORD), ('RECIPIENT', RECIPIENT_EMAIL)] if not v]}")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email or RECIPIENT_EMAIL
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        app.logger.info(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        app.logger.info("Starting TLS...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        app.logger.info("Login successful, sending message...")
        server.send_message(msg)
        server.quit()
        
        app.logger.info(f"Email sent successfully to {to_email or RECIPIENT_EMAIL}")
        return True
    except Exception as e:
        app.logger.error(f"Email sending error: {str(e)}")
        return False

# ============================================
# Authentication Helpers
# ============================================

def hash_password(password):
    """تشفير كلمة المرور باستخدام SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    """Decorator للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return jsonify({'success': False, 'message': 'غير مصرح بالدخول'}), 401
        return f(*args, **kwargs)
    return decorated_function





# ============================================
# Routes لخدمة الملفات الثابتة من Root (لـ JS وصور)
# ============================================

@app.route('/app.js')
def serve_app_js():
    """خدمة app.js من root"""
    if os.path.exists('app.js'):
        return send_from_directory('.', 'app.js'), 200, {'Content-Type': 'application/javascript'}
    else:
        app.logger.error("app.js غير موجود في root")
        return jsonify({'error': 'app.js not found'}), 404

@app.route('/backend.js')
def serve_backend_js():
    """خدمة backend.js من root"""
    if os.path.exists('backend.js'):
        return send_from_directory('.', 'backend.js'), 200, {'Content-Type': 'application/javascript'}
    else:
        app.logger.error("backend.js غير موجود في root")
        return jsonify({'error': 'backend.js not found'}), 404

@app.route('/Logo.jpg')
def serve_logo():
    """خدمة Logo.jpg من root"""
    if os.path.exists('Logo.jpg'):
        return send_from_directory('.', 'Logo.jpg'), 200, {'Content-Type': 'image/jpeg'}
    else:
        app.logger.error("Logo.jpg غير موجود في root")
        return jsonify({'error': 'Logo not found'}), 404






# ============================================
# Routes - Public
# ============================================







@app.route('/')
def index():
    """خدمة الصفحة الرئيسية من root أو static"""
    try:
        if os.path.exists('index.html'):
            app.logger.info("Serving index.html from root directory")
            with open('index.html', 'r', encoding='utf-8') as f:
                return f.read()
        elif os.path.exists('static/index.html'):
            app.logger.info("Serving index.html from static directory")
            return send_from_directory('static', 'index.html')
        else:
            app.logger.error("index.html not found - place it in root or static folder")
            return jsonify({'error': 'Main page not found'}), 404
    except Exception as e:
        app.logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# ============================================
# API - Contact Form
# ============================================

@app.route('/api/contact', methods=['POST'])
@limiter.limit("5 per minute")
def contact():
    try:
        data = request.get_json()
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subscription_type = data.get('subscription_type', '').strip()
        message_text = data.get('message', '').strip()
        
        if not all([name, email, subscription_type, message_text]):
            return jsonify({
                'success': False,
                'message': 'جميع الحقول مطلوبة'
            }), 400
        
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO messages (name, email, subscription_type, message, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, email, subscription_type, message_text, ip_address, user_agent))
        message_id = cur.lastrowid
        
        conn.commit()
        cur.close()
        conn.close()
        
        app.logger.info(f"Message saved: ID={message_id}, Name={name}, Type={subscription_type}")
        
        email_sent = False
        if SMTP_ENABLED:
            email_subject = f'طلب اشتراك Perplexity Pro - {subscription_type}'
            email_body = f"""
طلب اشتراك جديد في Perplexity Pro

الاسم: {name}
البريد الإلكتروني: {email}
نوع الاشتراك: {subscription_type}

الرسالة:
{message_text}

التاريخ: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
عنوان IP: {ip_address}
            """
            email_sent = send_email_smtp(email_subject, email_body)
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'تم إرسال رسالتك بنجاح! سنتواصل معك خلال 24 ساعة ✓'
            }), 200
        else:
            app.logger.warning(f"Email not sent for message ID={message_id}")
            return jsonify({
                'success': True,
                'message': 'تم حفظ رسالتك بنجاح! سنراجعها ونتواصل معك قريباً. إذا كنت بحاجة لرد سريع، يرجى التواصل معنا عبر واتساب.',
                'email_sent': False
            }), 200
            
    except Exception as e:
        app.logger.error(f"Contact form error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
        }), 500

# ============================================
# Admin Authentication Routes
# ============================================

# مسار لوحة التحكم (Admin Panel) - عامة (مع نموذج login داخل الصفحة)
@app.route('/admin.html')
def admin_panel():
    """خدمة admin.html بدون حماية (الـ API محمية داخل الصفحة)"""
    try:
        # تحقق من موقع الملف
        if os.path.exists('admin.html'):
            app.logger.info("Serving admin.html from root directory")
            with open('admin.html', 'r', encoding='utf-8') as f:
                return f.read()
        elif os.path.exists('static/admin.html'):
            app.logger.info("Serving admin.html from static directory")
            return send_from_directory('static', 'admin.html')
        else:
            app.logger.error("admin.html غير موجود. تحقق من موقعه.")
            return '<html><body><h1>404 - Admin panel file not found</h1><p>Place admin.html in root or static folder.</p></body></html>', 404
    
    except FileNotFoundError:
        app.logger.error("admin.html not found.")
        return '<html><body><h1>404 - File not found</h1></body></html>', 404
    
    except Exception as e:
        app.logger.error(f"خطأ في خدمة admin.html: {str(e)}")
        return '<html><body><h1>500 - Server error</h1></body></html>', 500

# API تسجيل الدخول للمدير
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """تسجيل دخول المدير مع التحقق من الـ hash"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400
        
        # جلب البيانات من .env أو الافتراضي
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password_hash = os.getenv('ADMIN_PASSWORD_HASH', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7')  # hash لـ Admin123
        
        # حساب hash لكلمة المرور المُدخلة
        input_password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if username == admin_username and input_password_hash == admin_password_hash:
            session['admin_logged_in'] = True
            session['admin_username'] = username
            app.logger.info(f"Admin login successful: {username}")
            return jsonify({'success': True, 'message': 'تم تسجيل الدخول بنجاح'}), 200
        else:
            app.logger.warning(f"Admin login failed for: {username}")
            return jsonify({'success': False, 'message': 'اسم المستخدم أو كلمة المرور خاطئة'}), 401
    
    except Exception as e:
        app.logger.error(f"Admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'خطأ في الخادم'}), 500

# API تسجيل الخروج (اختياري)
@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """تسجيل خروج المدير"""
    session.clear()
    app.logger.info("Admin logged out")
    return jsonify({'success': True, 'message': 'تم تسجيل الخروج'}), 200

# API الرسائل والإحصائيات (محمية)
@app.route('/api/messages', methods=['GET'])
@login_required
def get_messages():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM messages ORDER BY created_at DESC LIMIT 50")
        messages = cur.fetchall()
        cur.close()
        conn.close()
        
        messages_list = [dict(msg) for msg in messages]
        
        app.logger.info(f"Messages fetched: {len(messages_list)}")
        return jsonify({
            'success': True,
            'messages': messages_list,
            'count': len(messages_list)
        }), 200
        
    except sqlite3.Error as e:
        app.logger.error(f"Database error in get_messages: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'خطأ في قاعدة البيانات: {str(e)}'
        }), 500
    except Exception as e:
        app.logger.error(f"Get messages error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطأ في الخادم'
        }), 500

@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # إجمالي الرسائل
        cur.execute("SELECT COUNT(*) as count FROM messages")
        total = cur.fetchone()['count']
        
        # رسائل اليوم
        cur.execute("SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = DATE('now')")
        today = cur.fetchone()['count']
        
        # اشتراكات عامة
        cur.execute("SELECT COUNT(*) as count FROM messages WHERE subscription_type LIKE '%عام%' OR subscription_type LIKE '%1700%'")
        regular = cur.fetchone()['count']
        
        # اشتراكات طلاب
        cur.execute("SELECT COUNT(*) as count FROM messages WHERE subscription_type LIKE '%طلاب%' OR subscription_type LIKE '%1400%'")
        student = cur.fetchone()['count']
        
        cur.close()
        conn.close()
        
        app.logger.info(f"Stats fetched: total={total}, today={today}, regular={regular}, student={student}")
        return jsonify({
            'success': True,
            'stats': {
                'total_messages': total,
                'today_messages': today,
                'regular_subscriptions': regular,
                'student_subscriptions': student
            }
        }), 200
        
    except sqlite3.Error as e:
        app.logger.error(f"Database error in get_stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'خطأ في قاعدة البيانات: {str(e)}'
        }), 500
    except Exception as e:
        app.logger.error(f"Get stats error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطأ في الخادم'
        }), 500

# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'المسار غير موجود'}), 404

@app.errorhandler(500)
def internal_error_handler(error):
    """رد JSON للأخطاء 500 في API"""
    app.logger.error(f"500 Error: {str(error)}")
    return jsonify({
        'success': False,
        'message': 'خطأ داخلي في الخادم - تحقق من السجلات'
    }), 500

# ============================================
# Application Entry Point
# ============================================

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    
    if debug_mode:
        app.logger.warning("Running in DEBUG mode - NOT suitable for production!")
    
    print("🚀 Starting Perplexity Pro Backend Server...")
    print(f"📍 Environment: {os.getenv('FLASK_ENV', 'production')}")
    print(f"📊 Database: {'SQLite' if USE_SQLITE else 'PostgreSQL'}")
    print(f"📊 Main page: http://127.0.0.1:5000")
    print(f"🔒 Admin login: http://127.0.0.1:5000/admin.html")
    print(f"📈 Logging to: {log_file}")
    
    init_db()  # إنشاء DB مرة واحدة

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)



    app.run(
        debug=debug_mode,
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )
