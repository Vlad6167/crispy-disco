document.addEventListener('DOMContentLoaded', function() {
    // ========== Переключение темы ==========
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        themeToggle.textContent = '🌞 Светлая тема';
    }
    
    // Обработчик переключения темы
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        themeToggle.textContent = isDark ? '🌞 Светлая тема' : '🌓 Тёмная тема';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ========== Галерея изображений ==========
    let currentIndex = 0;
    const images = document.querySelectorAll('.gallery-img');
    const totalImages = images.length;
    let galleryInterval;

    // Показ текущего изображения
    function showImage(index) {
        images.forEach(img => img.classList.remove('active'));
        images[index].classList.add('active');
        currentIndex = index;
        resetGalleryInterval();
    }

    // Сброс интервала автопрокрутки
    function resetGalleryInterval() {
        clearInterval(galleryInterval);
        galleryInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalImages;
            showImage(currentIndex);
        }, 3000);
    }

    // Кнопки навигации
    document.getElementById('nextBtn').addEventListener('click', () => {
        showImage((currentIndex + 1) % totalImages);
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        showImage((currentIndex - 1 + totalImages) % totalImages);
    });

    // Инициализация галереи
    showImage(0);
    resetGalleryInterval();

    // ========== Форма обратной связи ==========
    const form = document.getElementById('feedbackForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Показать сообщение
    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = type;
        formMessage.classList.remove('hidden');
        
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }

    // Обработка отправки формы
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
            if (typeof grecaptcha === 'undefined' || !grecaptcha.getResponse()) {
                showMessage("Пожалуйста, подтвердите что вы не робот", "error");
                return;
            }

            // Блокируем кнопку во время отправки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            // Отправка данных
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                showMessage("Сообщение отправлено! Скоро отвечу.", "success");
                form.reset();
                
                // Сброс reCAPTCHA
                if (window.grecaptcha) {
                    grecaptcha.reset();
                    submitBtn.disabled = true;
                }
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage("Ошибка отправки. Попробуйте позже.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    });

    // ========== Проверка загрузки reCAPTCHA ==========
    function checkRecaptchaLoad() {
        if (typeof grecaptcha === 'undefined') {
            console.error('reCAPTCHA не загрузилась');
            showMessage("Ошибка загрузки проверки безопасности", "error");
        }
    }

    // ========== Социальная сеть ==========
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const postsContainer = document.getElementById('postsContainer');

    // Загрузка постов из localStorage
    function loadPosts() {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        postsContainer.innerHTML = '';
        
        posts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn" data-id="${index}">
                        ${post.liked ? '❤️' : '🤍'} ${post.likes}
                    </button>
                </div>
                <div class="post-date">${new Date(post.date).toLocaleString()}</div>
            `;
            postsContainer.prepend(postElement);
        });

        // Добавляем обработчики лайков
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                toggleLike(parseInt(this.dataset.id));
            });
        });
    }

    // Добавление нового поста
    function addPost() {
        const content = postContent.value.trim();
        if (!content) return;
        
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const newPost = {
            content: content,
            date: new Date().toISOString(),
            likes: 0,
            liked: false
        };
        
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        postContent.value = '';
        loadPosts();
    }

    // Обработка лайков
    function toggleLike(postId) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const post = posts[postId];
        
        if (post.liked) {
            post.likes--;
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }

    // Обработчики событий
    if (postButton && postContent && postsContainer) {
        postButton.addEventListener('click', addPost);
        postContent.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addPost();
            }
        });

        // Инициализация
        loadPosts();
    }

    // Проверяем через 5 секунд после загрузки
    setTimeout(checkRecaptchaLoad, 5000);
});

// Глобальная функция для reCAPTCHA
function onRecaptchaSuccess() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

// Firebase инициализация (если нужно)
// Должна быть в отдельном модуле или в начале файла
/*
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
    // Ваши настройки Firebase
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
*/