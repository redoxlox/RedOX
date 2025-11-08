#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "🚀 Perplexity Pro - Backend Server"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 غير مثبت!${NC}"
    echo ""
    echo "يرجى تثبيت Python3:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip python3-venv"
    echo "  macOS: brew install python3"
    exit 1
fi

echo -e "${GREEN}✓ Python مثبت${NC}"
python3 --version
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 إنشاء بيئة افتراضية...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ تم إنشاء بيئة افتراضية${NC}"
    echo ""
fi

# Activate virtual environment
echo -e "${BLUE}🔧 تفعيل البيئة الافتراضية...${NC}"
source venv/bin/activate
echo ""

# Install/upgrade requirements
echo -e "${BLUE}📦 تثبيت/تحديث المكتبات المطلوبة...${NC}"
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo -e "${GREEN}✓ تم تثبيت المكتبات${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  ملف .env غير موجود!${NC}"
    echo ""

    if [ -f ".env.example" ]; then
        read -p "📝 هل تريد نسخ .env.example إلى .env؟ (y/n): " response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env.example .env
            echo -e "${GREEN}✓ تم نسخ .env.example${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  يرجى تعديل ملف .env بإعداداتك:${NC}"
            echo "   - أدخل معلومات البريد الإلكتروني"
            echo "   - غيّر SECRET_KEY"
            echo "   - أدخل معلومات المدير"
            echo ""
            echo -e "${BLUE}💡 أو استخدم: python3 setup_helper.py${NC}"
            echo ""
            exit 1
        fi
    fi

    echo -e "${RED}❌ لا يمكن المتابعة بدون ملف .env${NC}"
    echo ""
    echo -e "${BLUE}💡 لإنشاء ملف .env بسهولة، شغّل:${NC}"
    echo "   python3 setup_helper.py"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ ملف .env موجود${NC}"
echo ""

# Check which app.py to use
if [ -f "app_fixed.py" ]; then
    APP_FILE="app_fixed.py"
    echo -e "${GREEN}🎯 استخدام: app_fixed.py (النسخة المحسّنة)${NC}"
else
    APP_FILE="app.py"
    echo -e "${BLUE}🎯 استخدام: app.py${NC}"
fi
echo ""

# Display startup information
echo "========================================"
echo "📍 معلومات الخادم:"
echo "========================================"
echo "🌐 الصفحة الرئيسية: http://127.0.0.1:5000"
echo "🔒 لوحة التحكم: http://127.0.0.1:5000/admin.html"
echo "📝 السجلات: app.log"
echo "⏹️  للإيقاف: اضغط Ctrl+C"
echo "========================================"
echo ""

# Start the server
echo -e "${GREEN}✅ بدء تشغيل Flask Backend...${NC}"
echo ""
python3 $APP_FILE
