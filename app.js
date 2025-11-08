// Data
const features = [
    {
        title: "موثوقية مع مراجع مباشرة",
        icon: "fas fa-search",
        description: "كل إجابة مدعومة بمصادر حقيقية من الإنترنت مع روابط مباشرة للمراجع"
    },
    {
        title: "ذكاء بحث فوري",
        icon: "fas fa-bolt",
        description: "نتائج محدثة لحظياً من الويب المباشر مع تحليل متعمق للبيانات"
    },
    {
        title: "وصول غير محدود لنماذج الذكاء الاصطناعي",
        icon: "fas fa-brain",
        description: "GPT-5, Claude Sonnet 4.5, Gemini Pro, Grok 4 وأقوى النماذج المتاحة"
    },
    {
        title: "تحليل ملفات احترافي",
        icon: "fas fa-file-alt",
        description: "ارفع عدد غير محدود من PDF والمستندات للتحليل الفوري والاستخراج الذكي"
    },
    {
        title: "600 عملية بحث متقدمة يومياً",
        icon: "fas fa-chart-line",
        description: "إجابات متعمقة وشاملة تلبي جميع احتياجاتك البحثية"
    },
    {
        title: "سرعة وأولوية عالية",
        icon: "fas fa-rocket",
        description: "استجابة فورية دائماً مع معالجة أولوية لطلباتك"
    }
];

const details = [
    {
        title: "تفعيل فوري",
        icon: "fas fa-bolt",
        description: "تفعيل فوري خلال 1-24 ساعة بعد الشراء مباشرة على بريدك الإلكتروني"
    },
    {
        title: "ضمان الرضا",
        icon: "fas fa-shield-alt",
        description: "استرجاع 80% من المبلغ خلال 24 ساعة إذا لم تكن راضياً عن الخدمة"
    },
    {
        title: "خصوصية كاملة",
        icon: "fas fa-lock",
        description: "حساب خاص بك 100% - لا مشاركة مع أحد - بياناتك محمية بشكل كامل"
    },
    {
        title: "تفعيل رسمي",
        icon: "fas fa-check-circle",
        description: "تفعيل رسمي ومباشر من الموقع الرسمي على بريدك الإلكتروني الخاص"
    },
    {
        title: "دعم فني مستمر",
        icon: "fas fa-headset",
        description: "خدمة عملاء احترافية طوال مدة الاشتراك لحل أي مشكلة تواجهك"
    },
    {
        title: "وصول كامل",
        icon: "fas fa-infinity",
        description: "وصول كامل لجميع ميزات Perplexity Pro بلا قيود أو حدود"
    }
];

const steps = [
    {
        number: "1",
        title: "راسلنا الآن",
        description: "اتصل بنا عبر أي من منصات التواصل الاجتماعي أو البريد الإلكتروني المذكورة في أسفل الصفحة"
    },
    {
        number: "2",
        title: "أخبرنا إذا كنت طالباً",
        description: "للحصول على السعر المميز للطلاب، قدم لنا ما يثبت أنك طالب"
    },
    {
        number: "3",
        title: "استلم حسابك فوراً",
        description: "تفعيل فوري خلال 1-24 ساعة وابدأ تجربة Perplexity Pro الكاملة!"
    }
];

const audience = [
    {
        title: "الطلاب والباحثين",
        icon: "fas fa-graduation-cap",
        color: "#4A7AFF",
        description: "أبحاث أكاديمية بمصادر موثقة ومراجع مباشرة"
    },
    {
        title: "صنّاع المحتوى والكُتاب",
        icon: "fas fa-pen-fancy",
        color: "#00C2FF",
        description: "أفكار إبداعية ومعلومات دقيقة بمصادر موثوقة"
    },
    {
        title: "رواد الأعمال والمحللين",
        icon: "fas fa-chart-line",
        color: "#FF6B6B",
        description: "قرارات مبنية على بيانات حقيقية ومعلومات محدثة"
    },
    {
        title: "المطورين والمبرمجين",
        icon: "fas fa-code",
        color: "#6BCF7F",
        description: "حلول برمجية سريعة ودقيقة بشفرة مصدرية"
    }
];

const faqData = [
    {
        question: "ما هو Perplexity Pro؟",
        answer: "Perplexity Pro هو أداة بحث متقدمة تستخدم الذكاء الاصطناعي لتوفير إجابات دقيقة ومفصلة مع مراجع مباشرة. يتيح لك الوصول إلى أقوى نماذج الذكاء الاصطناعي مثل GPT-5 وClaude وGemini Pro."
    },
    {
        question: "كم يستغرق التفعيل؟",
        answer: "التفعيل يتم خلال 1-24 ساعة من تأكيد الدفع. في معظم الحالات، يتم التفعيل خلال ساعات قليلة فقط."
    },
    {
        question: "هل الاشتراك آمن وموثوق؟",
        answer: "نعم، الاشتراك آمن 100%. نحن نقدم تفعيلاً رسمياً مباشراً من الموقع الرسمي لـ Perplexity Pro على بريدك الإلكتروني الخاص."
    },
    {
        question: "ما هي سياسة الاسترجاع؟",
        answer: "نقدم ضمان استرجاع 80% من المبلغ خلال 24 ساعة من التفعيل إذا لم تكن راضياً عن الخدمة."
    },
    {
        question: "هل يمكنني استخدام الحساب على أجهزة متعددة؟",
        answer: "نعم، يمكنك استخدام حسابك على أي جهاز تختاره. الحساب خاص بك 100% ويمكن الوصول إليه من أي مكان."
    },
    {
        question: "كيف أحصل على خصم الطلاب؟",
        answer: "للحصول على خصم الطلاب (1400 دج بدلاً من 1700 دج)، يكفي تقديم ما يثبت أنك طالب (بطاقة طالب أو شهادة مدرسية)."
    },
    {
        question: "ما هي وسائل الدفع المتاحة؟",
        answer: "يمكنك الدفع عبر عدة وسائل: تحويل بنكي، Baridimob، CCP، أو نقداً عند التسليم (حسب المنطقة). تواصل معنا لمعرفة التفاصيل."
    },
    {
        question: "هل يوجد دعم فني بعد الشراء؟",
        answer: "نعم، نقدم دعماً فنياً مستمراً طوال فترة اشتراكك. يمكنك التواصل معنا في أي وقت لحل أي مشكلة قد تواجهك."
    }
];

// Render Features
function renderFeatures() {
    const grid = document.getElementById('featuresGrid');
    features.forEach((feature, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="card-icon"><i class="${feature.icon}"></i></div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        `;
        grid.appendChild(card);
    });
}

// Render Details
function renderDetails() {
    const grid = document.getElementById('detailsGrid');
    details.forEach((detail, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="card-icon"><i class="${detail.icon}"></i></div>
            <h3>${detail.title}</h3>
            <p>${detail.description}</p>
        `;
        grid.appendChild(card);
    });
}

// Render Steps
function renderSteps() {
    const container = document.getElementById('stepsContainer');
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        stepElement.style.animationDelay = `${index * 0.2}s`;
        stepElement.innerHTML = `
            <div class="step-number">${step.number}</div>
            <div class="step-content">
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        `;
        container.appendChild(stepElement);
    });
}

// Render Audience
function renderAudience() {
    const grid = document.getElementById('audienceGrid');
    audience.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'audience-card card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="audience-icon" style="color: ${item.color}"><i class="${item.icon}"></i></div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        grid.appendChild(card);
    });
}

// Render FAQ
function renderFAQ() {
    const container = document.getElementById('faqContainer');
    faqData.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML = `
            <button class="faq-question">
                <span>${faq.question}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
                <p>${faq.answer}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// FAQ Accordion Functionality
function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all
            questions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Open clicked if it wasn't active
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

// Navbar Scroll Effect
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = toggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = toggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Scroll Animation Observer
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.card, .step, .stat-card, .testimonial-card, .faq-item').forEach(el => {
        observer.observe(el);
    });
}

// Contact Form Handler
// يدير في backend.js بالكامل، هنا نعطل هذا الكود (تم نقله للباك)
function initContactForm() {
    // تم نقل المعالجة لbackend.js بالكامل
}

// WhatsApp ومسنجر من backend.js
function initWhatsAppAndMessengerIntegration() {
    // زر واتساب (في contact)
    const whatsappButtons = document.querySelectorAll('.btn-whatsapp');
    whatsappButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.dataset.type || 'regular';
            if (window.BackendAPI && window.BackendAPI.WhatsApp) {
                window.BackendAPI.WhatsApp.openChat(type);
            }
        });
    });
    // زر ماسنجر
    const messengerButtons = document.querySelectorAll('.btn-messenger');
    messengerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.BackendAPI && window.BackendAPI.Messenger) {
                window.BackendAPI.Messenger.openChat();
            }
        });
    });
}
// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    renderFeatures();
    renderDetails();
    renderSteps();
    renderAudience();
    renderFAQ();
    initFAQ();
    initNavbar();
    initMobileMenu();
    initScrollAnimation();
    initContactForm();
    initWhatsAppAndMessengerIntegration();
});