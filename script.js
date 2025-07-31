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

    // ========== Социальная сеть ==========
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const postsContainer = document.getElementById('postsContainer');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close');
    const authForm = document.getElementById('authForm');
    const registerBtn = document.getElementById('registerBtn');

    // Текущий пользователь
    let currentUser = null;

    // Показать/скрыть модальное окно
    function toggleAuthModal() {
        authModal.classList.toggle('hidden');
    }

    // Загрузка пользователей из localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // Регистрация нового пользователя
    function registerUser(username, password) {
        const users = getUsers();
        
        if (users.some(u => u.username === username)) {
            alert('Пользователь уже существует!');
            return false;
        }
        
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }

    // Авторизация пользователя
    function loginUser(username, password) {
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            return true;
        }
        
        return false;
    }

    // Выход пользователя
    function logoutUser() {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Проверка авторизации
    function checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            currentUser = user;
            return true;
        }
        return false;
    }

    // Загрузка постов из localStorage
    function loadPosts() {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        postsContainer.innerHTML = '';
        
        posts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-header">
                    <strong>${post.author || 'Аноним'}</strong>
                    ${currentUser === post.author ? 
                      `<button class="delete-post" data-id="${index}">Удалить</button>` : ''}
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn" data-id="${index}">
                        ${post.likes?.includes(currentUser) ? '❤️' : '🤍'} ${post.likes?.length || 0}
                    </button>
                </div>
                <div class="post-date">${new Date(post.date).toLocaleString()}</div>
            `;
            postsContainer.prepend(postElement);
        });

        // Добавляем обработчики лайков
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!currentUser) {
                    toggleAuthModal();
                    return;
                }
                toggleLike(parseInt(this.dataset.id));
            });
        });

        // Добавляем обработчики удаления
        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePost(parseInt(this.dataset.id));
            });
        });
    }

    // Добавление нового поста
    function addPost() {
        if (!currentUser) {
            toggleAuthModal();
            return;
        }
        
        const content = postContent.value.trim();
        if (!content) return;
        
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const newPost = {
            content: content,
            author: currentUser,
            date: new Date().toISOString(),
            likes: []
        };
        
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        postContent.value = '';
        loadPosts();
    }

    // Удаление поста
    function deletePost(postId) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        if (posts[postId]?.author === currentUser) {
            posts.splice(postId, 1);
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        }
    }

    // Обработка лайков
    function toggleLike(postId) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const post = posts[postId];
        
        if (!post.likes) post.likes = [];
        
        const userIndex = post.likes.indexOf(currentUser);
        if (userIndex === -1) {
            post.likes.push(currentUser);
        } else {
            post.likes.splice(userIndex, 1);
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
    }

    // Обработчики модального окна
    closeModal.addEventListener('click', toggleAuthModal);
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (loginUser(username, password)) {
            toggleAuthModal();
            loadPosts();
        } else {
            alert('Неверные данные!');
        }
    });
    
    registerBtn.addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (registerUser(username, password)) {
            alert('Регистрация успешна! Теперь войдите.');
        }
    });

    // Проверка авторизации при загрузке
    checkAuth();
    loadPosts();

    // ========== Проверка загрузки reCAPTCHA ==========
    function checkRecaptchaLoad() {
        if (typeof grecaptcha === 'undefined') {
            console.error('reCAPTCHA не загрузилась');
            showMessage("Ошибка загрузки проверки безопасности", "error");
        }
    }

    // Проверяем через 5 секунд после загрузки
    setTimeout(checkRecaptchaLoad, 5000);
});
registerBtn.addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (registerUser(username, password)) {
        loginUser(username, password); // Авторизуем после регистрации
        toggleAuthModal();
        loadPosts();
    }
});
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = user;
        return true;
    } else {
        toggleAuthModal(); // Показываем окно, если нет авторизации
        return false;
    }
}
if (!username || !password) {
    alert('Заполните все поля!');
    return;
}
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        toggleAuthModal();
    }
});
// Глобальная функция для reCAPTCHA
function onRecaptchaSuccess() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}