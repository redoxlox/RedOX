@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 Perplexity Pro - Backend Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت!
    echo.
    echo يرجى تثبيت Python من: https://www.python.org/downloads/
    echo تأكد من تفعيل "Add Python to PATH" أثناء التثبيت
    pause
    exit /b 1
)

echo ✓ Python مثبت
python --version
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 إنشاء بيئة افتراضية...
    python -m venv venv
    echo ✓ تم إنشاء بيئة افتراضية
    echo.
)

REM Activate virtual environment
echo 🔧 تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat
echo.

REM Install/upgrade requirements
echo 📦 تثبيت/تحديث المكتبات المطلوبة...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
echo ✓ تم تثبيت المكتبات
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  ملف .env غير موجود!
    echo.

    if exist ".env.example" (
        echo 📝 هل تريد نسخ .env.example إلى .env؟ (y/n)
        set /p response=
        if /i "%response%"=="y" (
            copy .env.example .env
            echo ✓ تم نسخ .env.example
            echo.
            echo ⚠️  يرجى تعديل ملف .env بإعداداتك:
            echo    - أدخل معلومات البريد الإلكتروني
            echo    - غيّر SECRET_KEY
            echo    - أدخل معلومات المدير
            echo.
            echo 💡 أو استخدم: python setup_helper.py
            echo.
            pause
            exit /b 1
        )
    )

    echo ❌ لا يمكن المتابعة بدون ملف .env
    echo.
    echo 💡 لإنشاء ملف .env بسهولة، شغّل:
    echo    python setup_helper.py
    echo.
    pause
    exit /b 1
)

echo ✓ ملف .env موجود
echo.

REM Check which app.py to use
if exist "app_fixed.py" (
    set APP_FILE=app_fixed.py
    echo 🎯 استخدام: app_fixed.py (النسخة المحسّنة)
) else (
    set APP_FILE=app.py
    echo 🎯 استخدام: app.py
)
echo.

REM Display startup information
echo ========================================
echo 📍 معلومات الخادم:
echo ========================================
echo 🌐 الصفحة الرئيسية: http://127.0.0.1:5000
echo 🔒 لوحة التحكم: http://127.0.0.1:5000/admin.html
echo 📝 السجلات: app.log
echo ⏹️  للإيقاف: اضغط Ctrl+C
echo ========================================
echo.

REM Start the server
echo ✅ بدء تشغيل Flask Backend...
echo.
python %APP_FILE%

REM If server exits, pause to see any errors
echo.
echo ⚠️  الخادم توقف عن العمل
pause
