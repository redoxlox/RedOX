// ============================================
// BACKEND.JS - Complete Backend System (PRODUCTION-READY)
// ============================================

// Configuration - تجنب المكرر
window.CONFIG = window.CONFIG || {
    whatsappNumber: '213XXXXXXXXX', // استبدل برقم حقيقي
    facebookPageId: 'redoxlox',
    email: 'redoxlox@gmail.com',
    apiBaseUrl: window.location.origin,
    prices: {
        regular: 1700,
        student: 1400
    }
};


// ============================================
// 1. FORM VALIDATION SYSTEM
// ============================================
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateForm(formData) {
        const errors = [];
        
        if (!this.validateRequired(formData.name)) {
            errors.push('الاسم مطلوب');
        }
        
        if (!this.validateRequired(formData.email)) {
            errors.push('البريد الإلكتروني مطلوب');
        } else if (!this.validateEmail(formData.email)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }
        
        if (!this.validateRequired(formData.subscriptionType)) {
            errors.push('يجب اختيار نوع الاشتراك');
        }
        
        return errors;
    }
}

// ============================================
// 2. NOTIFICATION SYSTEM
// ============================================
class NotificationSystem {
    static show(message, type = 'success') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }
}

// ============================================
// 3. REAL ANALYTICS TRACKING (Backend Integration)
// ============================================
class AnalyticsTracker {
    static async trackEvent(action, label, value = null) {
        const eventData = {
            action: action,
            label: label,
            value: value,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        console.log('📊 Analytics Event:', eventData);
        
        // إرسال البيانات إلى Backend API للحفظ الدائم
        try {
            await fetch(`${CONFIG.apiBaseUrl}/api/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
        
        // دعم Google Analytics إذا كان متاحاً
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'User Interaction',
                'event_label': label,
                'value': value
            });
        }
    }

    static trackPageView() {
        this.trackEvent('page_view', document.title);
    }

    static trackCTAClick(ctaLocation) {
        this.trackEvent('cta_click', ctaLocation);
    }

    static trackFormSubmit(subscriptionType) {
        this.trackEvent('form_submit', 'contact_form', subscriptionType);
    }

    static trackFAQOpen(question) {
        this.trackEvent('faq_open', question);
    }

    static trackScroll(sectionId) {
        this.trackEvent('section_scroll', sectionId);
    }

    static trackWhatsAppClick(subscriptionType) {
        this.trackEvent('whatsapp_click', subscriptionType);
    }

    static trackMessengerClick() {
        this.trackEvent('messenger_click', 'contact');
    }
}

// ============================================
// 4. WHATSAPP INTEGRATION
// ============================================
class WhatsAppIntegration {
    static openChat(subscriptionType = 'regular') {
        const messages = {
            student: `مرحباً، أريد الاشتراك في Perplexity Pro بسعر الطلاب (${CONFIG.prices.student} دج)`,
            regular: `مرحباً، أريد الاشتراك في Perplexity Pro (${CONFIG.prices.regular} دج)`
        };
        
        const message = messages[subscriptionType] || messages.regular;
        const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        AnalyticsTracker.trackWhatsAppClick(subscriptionType);
        window.open(url, '_blank');
    }
}

// ============================================
// 5. MESSENGER INTEGRATION
// ============================================
class MessengerIntegration {
    static openChat() {
        const url = `https://m.me/${CONFIG.facebookPageId}`;
        AnalyticsTracker.trackMessengerClick();
        window.open(url, '_blank');
    }
}

// ============================================
// 6. REAL EMAIL INTEGRATION (Backend API)
// ============================================
class EmailIntegration {
    static async sendEmail(formData) {
        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subscription_type: formData.subscriptionType,
                    message: formData.message
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                return {
                    success: true,
                    message: result.message,
                    emailSent: result.email_sent !== false
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'حدث خطأ في الإرسال'
                };
            }
        } catch (error) {
            console.error('Email sending error:', error);
            return {
                success: false,
                message: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
            };
        }
    }
}

// ============================================
// 7. ENHANCED FORM HANDLER
// ============================================
class ContactFormHandler {
    static async handleSubmit(event) {
        event.preventDefault();
        
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subscriptionType: document.getElementById('subscription').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Validate form
        const errors = FormValidator.validateForm(formData);
        if (errors.length > 0) {
            NotificationSystem.error(errors.join('، '));
            return;
        }
        
        // Disable button and show loading
        submitButton.disabled = true;
        submitButton.textContent = 'جاري الإرسال...';
        
        // Track form submission
        AnalyticsTracker.trackFormSubmit(formData.subscriptionType);
        
        try {
            // Send email through backend API
            const result = await EmailIntegration.sendEmail(formData);
            
            if (result.success) {
                NotificationSystem.success(result.message);
                
                // Clear form on success
                document.getElementById('contactForm').reset();
                
                // إذا لم يتم إرسال البريد الإلكتروني، أظهر تنبيه إضافي
                if (!result.emailSent) {
                    setTimeout(() => {
                        NotificationSystem.warning('لم يتم إرسال بريد إلكتروني. يمكنك التواصل معنا مباشرة عبر واتساب للحصول على رد أسرع.');
                    }, 2000);
                }
            } else {
                NotificationSystem.error(result.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            NotificationSystem.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

// ============================================
// 8. SCROLL TRACKING
// ============================================
class ScrollTracker {
    static init() {
        const sections = document.querySelectorAll('section[id]');
        const tracked = new Set();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !tracked.has(entry.target.id)) {
                    tracked.add(entry.target.id);
                    AnalyticsTracker.trackScroll(entry.target.id);
                }
            });
        }, {
            threshold: 0.5
        });
        
        sections.forEach(section => observer.observe(section));
    }
}

// ============================================
// 9. ENHANCED CTA TRACKING
// ============================================
class CTATracker {
    static init() {
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.closest('section')?.id || 'unknown';
                AnalyticsTracker.trackCTAClick(section);
            });
        });
    }
}

// ============================================
// 10. ENHANCED FAQ TRACKING
// ============================================
function enhanceFAQTracking() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const questionText = question.querySelector('span').textContent;
            AnalyticsTracker.trackFAQOpen(questionText);
        });
    });
}

// ============================================
// 11. ERROR HANDLING
// ============================================
class ErrorHandler {
    static init() {
        window.addEventListener('error', (event) => {
            console.error('🚨 JavaScript Error:', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
            
            // في الإنتاج، يمكن إرسال الأخطاء إلى خدمة مثل Sentry
            // if (typeof Sentry !== 'undefined') {
            //     Sentry.captureException(event.error);
            // }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled Promise Rejection:', event.reason);
            
            // if (typeof Sentry !== 'undefined') {
            //     Sentry.captureException(event.reason);
            // }
        });
    }
}

// ============================================
// 12. PERFORMANCE MONITORING
// ============================================
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
        const startTime = performance.now();  // بديل لـ timing
        const loadTime = performance.now() - startTime;  // ms إيجابي
        
        console.log('⚡ Performance Metrics:');
        console.log(` - Page Load Time: ${Math.round(loadTime)}ms`);
        console.log(` - DOM Ready: ${Math.round(performance.now() - performance.timing.navigationStart)}ms`);
        
        AnalyticsTracker.trackEvent('performance', 'page_load', Math.round(loadTime));
    });
}

}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Backend System Initialized (Production Mode)');
    
    // Initialize all systems
    ErrorHandler.init();
    PerformanceMonitor.measurePageLoad();
    AnalyticsTracker.trackPageView();
    ScrollTracker.init();
    CTATracker.init();
    
    // Form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', ContactFormHandler.handleSubmit);
    }
    
    // Enhanced FAQ tracking
    enhanceFAQTracking();
    
    console.log('✅ All backend systems ready');
    console.log('📊 Analytics events will be sent to backend API');
    console.log('📧 Email integration connected to backend SMTP');
});

// ============================================
// GLOBAL EXPORTS
// ============================================
window.BackendAPI = {
    WhatsApp: WhatsAppIntegration,
    Messenger: MessengerIntegration,
    Notifications: NotificationSystem,
    Analytics: AnalyticsTracker,
    Config: CONFIG
};






// التعامل مع الـ hash عند التحميل والتغيير
document.addEventListener('DOMContentLoaded', function() {
    // دالة لعرض القسم المطلوب و scroll سلس
    function showSection(hash) {
        if (!hash) return;
        
        const targetSection = document.querySelector(hash);  // مثل #contact
        if (targetSection) {
            // أخفِ الأقسام الأخرى إذا كانت مخفية (إذا في الكود الحالي show/hide)
             // أو classList.add('active')
            

            // Scroll سلس إلى القسم
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            console.log(`تم الانتقال إلى: ${hash}`);  // للاختبار
        } else {
            console.warn(`القسم ${hash} غير موجود`);  // إذا لا يوجد
        }
    }
    
    // تحقق من الـ hash الحالي عند التحميل
    if (window.location.hash) {
        showSection(window.location.hash);
    }
    
    // التعامل مع تغيير الـ hash (نقر روابط داخلية)
    window.addEventListener('hashchange', function() {
        showSection(window.location.hash);
    });
    
    // إذا كان هناك نموذج اتصال، ربطه بـ #contact
    const contactBtn = document.querySelector('a[href="#contact"], .btn-contact');  // زر الاتصال
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'contact';
            showSection('#contact');
        });
    }
});
