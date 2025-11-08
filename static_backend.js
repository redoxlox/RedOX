
// تحديث نموذج الاتصال للعمل مع Flask Backend

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // جمع البيانات من النموذج
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subscription_type: document.getElementById('subscription-type').value,
                message: document.getElementById('message').value
            };

            // تعطيل زر الإرسال
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

            try {
                // إرسال البيانات إلى Backend
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // إظهار رسالة نجاح
                    showNotification(result.message, 'success');

                    // إعادة تعيين النموذج
                    contactForm.reset();

                    // حفظ البيانات في Local Storage (للإحصائيات)
                    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
                    submissions.push({
                        ...formData,
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('submissions', JSON.stringify(submissions));
                } else {
                    // إظهار رسالة خطأ
                    showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', 'error');
            } finally {
                // إعادة تفعيل زر الإرسال
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

// دالة لإظهار الإشعارات
function showNotification(message, type = 'success') {
    // إزالة الإشعارات القديمة
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());

    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // إخفاء الإشعار بعد 5 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// CSS للإشعارات (أضف هذا في <style>)
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 1rem;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-right: 4px solid #4AFF6B;
}

.notification.success i {
    color: #4AFF6B;
    font-size: 1.5rem;
}

.notification.error {
    border-right: 4px solid #FF4A4A;
}

.notification.error i {
    color: #FF4A4A;
    font-size: 1.5rem;
}

.notification span {
    color: #333;
    font-size: 1rem;
    font-weight: 500;
}

@media (max-width: 768px) {
    .notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

// إضافة الـ styles للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
