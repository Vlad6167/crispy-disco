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
        
        // Перезапускаем авто-прокрутку после ручного переключения
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

    // Запускаем галерею
    showImage(0);
    resetGalleryInterval();

    // Форма обратной связи
    const form = document.getElementById('feedbackForm');
    const formMessage = document.getElementById('formMessage');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = type; // 'success' или 'error'
        formMessage.classList.remove('hidden');
        
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
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

            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showMessage("Сообщение отправлено! Скоро отвечу.", "success");
                form.reset();
                
                // Сбрасываем reCAPTCHA, если используется
                if (window.grecaptcha) {
                    grecaptcha.reset();
                }
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            showMessage("Ошибка отправки. Попробуйте позже.", "error");
            console.error('Ошибка:', error);
        }
    });
});