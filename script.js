document.addEventListener('DOMContentLoaded', function() {
    // ========== Общие элементы ==========
    const body = document.body;
    let currentUser = localStorage.getItem('currentUser') || null;

    // ========== Переключение темы ==========
    const themeToggle = document.getElementById('themeToggle');
    
    // Проверяем сохраненную тему
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

    // ========== Галерея изображений ==========
    let currentIndex = 0;
    const images = document.querySelectorAll('.gallery-img');
    const totalImages = images.length;
    let galleryInterval;

    function showImage(index) {
        images.forEach(img => img.classList.remove('active'));
        images[index].classList.add('active');
        currentIndex = index;
    }

    function startGallery() {
        clearInterval(galleryInterval);
        galleryInterval = setInterval(() => {
            showImage((currentIndex + 1) % totalImages);
        }, 3000);
    }

    document.getElementById('nextBtn').addEventListener('click', () => {
        showImage((currentIndex + 1) % totalImages);
        startGallery();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        showImage((currentIndex - 1 + totalImages) % totalImages);
        startGallery();
    });

    showImage(0);
    startGallery();

    // ========== Модальное окно ==========
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const registerBtn = document.getElementById('registerBtn');

    function toggleAuthModal(show) {
        authModal.style.display = show ? 'flex' : 'none';
    }

    // Закрытие по клику вне окна
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) toggleAuthModal(false);
    });

    // Закрытие по крестику
    document.querySelector('.modal-content .close').addEventListener('click', () => {
        toggleAuthModal(false);
    });

    // ========== Социальная сеть ==========
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const postsContainer = document.getElementById('postsContainer');

    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function registerUser(username, password) {
        if (!username || !password) {
            alert('Заполните все поля!');
            return false;
        }
        
        const users = getUsers();
        if (users.some(u => u.username === username)) {
            alert('Пользователь уже существует!');
            return false;
        }
        
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }

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

    function loadPosts() {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        postsContainer.innerHTML = posts.map((post, index) => `
            <div class="post">
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
            </div>
        `).reverse().join('');

        // Добавляем обработчики для новых элементов
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!currentUser) {
                    toggleAuthModal(true);
                    return;
                }
                toggleLike(parseInt(this.dataset.id));
            });
        });

        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePost(parseInt(this.dataset.id));
            });
        });
    }

    function addPost() {
        if (!currentUser) {
            toggleAuthModal(true);
            return;
        }
        
        const content = postContent.value.trim();
        if (!content) return;
        
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.push({
            content: content,
            author: currentUser,
            date: new Date().toISOString(),
            likes: []
        });
        localStorage.setItem('posts', JSON.stringify(posts));
        postContent.value = '';
        loadPosts();
    }

    function deletePost(postId) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        if (posts[postId]?.author === currentUser) {
            posts.splice(postId, 1);
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        }
    }

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

    // ========== Форма обратной связи ==========
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const emailInput = form.querySelector('input[type="email"]');
            if (!validateEmail(emailInput.value)) {
                showMessage("Укажите правильный email", "error");
                return;
            }

            if (typeof grecaptcha === 'undefined' || !grecaptcha.getResponse()) {
                showMessage("Пожалуйста, подтвердите что вы не робот", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

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

    // ========== Инициализация ==========
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (loginUser(username, password)) {
            toggleAuthModal(false);
            loadPosts();
        } else {
            alert('Неверные данные!');
        }
    });
    
    registerBtn.addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (registerUser(username, password)) {
            loginUser(username, password);
            toggleAuthModal(false);
            loadPosts();
        }
    });

    // Проверка авторизации при загрузке
    if (!currentUser) {
        toggleAuthModal(true);
    } else {
        loadPosts();
    }

    // Проверка reCAPTCHA
    setTimeout(() => {
        if (typeof grecaptcha === 'undefined') {
            console.error('reCAPTCHA не загрузилась');
            showMessage("Ошибка загрузки проверки безопасности", "error");
        }
    }, 5000);
});

// Глобальная функция для reCAPTCHA
function onRecaptchaSuccess() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}