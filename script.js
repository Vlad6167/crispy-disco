document.addEventListener('DOMContentLoaded', function() {
    // Переключение темы
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        themeToggle.textContent = '🌞 Светлая тема';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        themeToggle.textContent = isDark ? '🌞 Светлая тема' : '🌓 Тёмная тема';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Галерея изображений
    let currentIndex = 0;
    const images = document.querySelectorAll('.gallery-img');
    const totalImages = images.length;
    let galleryInterval;

    function showImage(index) {
        images.forEach(img => img.classList.remove('active'));
        images[index].classList.add('active');
        currentIndex = index;
        resetGalleryInterval();
    }

    function resetGalleryInterval() {
        clearInterval(galleryInterval);
        galleryInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalImages;
            showImage(currentIndex);
        }, 3000);
    }

    document.getElementById('nextBtn').addEventListener('click', () => {
        showImage((currentIndex + 1) % totalImages);
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        showImage((currentIndex - 1 + totalImages) % totalImages);
    });

    showImage(0);
    resetGalleryInterval();

    // Форма обратной связи
    const form = document.getElementById('feedbackForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = type;
        formMessage.classList.remove('hidden');
        
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }

    // Функция для проверки reCAPTCHA
    function verifyRecaptcha() {
        return new Promise((resolve) => {
            if (typeof grecaptcha === 'undefined' || !grecaptcha.getResponse()) {
                showMessage("Пожалуйста, подтвердите что вы не робот", "error");
                resolve(false);
            } else {
                resolve(true);
            }
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Валидация email
            const emailInput = form.querySelector('input[type="email"]');
            if (!validateEmail(emailInput.value)) {
                showMessage("Укажите правильный email", "error");
                return;
            }

            // Проверка reCAPTCHA
            const isRecaptchaValid = await verifyRecaptcha();
            if (!isRecaptchaValid) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showMessage("Сообщение отправлено! Скоро отвечу.", "success");
                form.reset();
                
                if (window.grecaptcha) {
                    grecaptcha.reset();
                }
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            showMessage("Ошибка отправки. Попробуйте позже.", "error");
            console.error('Ошибка:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    });

    // Проверка загрузки reCAPTCHA
    function checkRecaptchaLoad() {
        if (typeof grecaptcha === 'undefined') {
            console.error('reCAPTCHA не загрузилась');
            showMessage("Ошибка загрузки проверки безопасности", "error");
        }
    }

    // Проверяем через 5 секунд после загрузки
    setTimeout(checkRecaptchaLoad, 5000);
});