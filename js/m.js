// Перевірка на зменшення руху
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Утиліти
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// LAZY LOADING IMPLEMENTATION
class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        if (!this.images.length) return;

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });

            this.images.forEach(img => imageObserver.observe(img));
        } else {
            this.images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        const src = img.dataset.src || img.src;
        if (!src) return;

        const image = new Image();
        image.onload = () => {
            img.src = src;
            img.classList.add('lazy-loaded');
        };
        image.onerror = () => {
            console.warn('Failed to load image:', src);
        };
        image.src = src;
    }
}

// OPTIMIZED PARTICLE SYSTEM
class ParticleSystem {
    constructor() {
        if (isReducedMotion) return;
        
        this.numberOfParticles = window.innerWidth < 768 ? 15 : 30;
        this.canvas = null;
        this.ctx = null;
        this.particlesArray = [];
        this.animationFrameId = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        if (window.innerWidth < 768 && !this.isHighPerformanceDevice()) {
            return;
        }

        this.createCanvas();
        this.initParticles();
        this.animate();
        
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
        window.addEventListener('unload', () => this.cleanup());
    }

    isHighPerformanceDevice() {
        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        if (memory !== undefined) {
            return memory >= 4 && cores >= 4;
        } else {
            return cores >= 4;
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.15;
        `;
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
    }

    setCanvasSize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        this.setCanvasSize();
        this.initParticles();
    }

    initParticles() {
        this.particlesArray = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particlesArray.push(new Particle(this.canvas));
        }
    }

    animate() {
        if (!this.ctx || !this.canvas || document.hidden) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particlesArray.forEach(particle => {
            particle.update(this.canvas);
            particle.draw(this.ctx);
        });
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = ['#E63946', '#D4A574', '#FFFFFF'][Math.floor(Math.random() * 3)];
    }
    
    update(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// ACCESSIBLE MODAL MANAGER
class AccessibleModalManager {
    constructor() {
        this.modals = [];
        this.previousFocus = null;
        this.currentModal = null;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    registerModal(modalElement) {
        this.modals.push(modalElement);
    }

    openModal(modalElement) {
        this.previousFocus = document.activeElement;
        this.currentModal = modalElement;
        
        modalElement.setAttribute('aria-hidden', 'false');
        modalElement.classList.add('active');
        
        const focusableElements = this.getFocusableElements(modalElement);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        this.trapFocus(modalElement);
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalElement) {
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.classList.remove('active');
        this.currentModal = null;
        
        if (this.previousFocus) {
            this.previousFocus.focus();
        }

        document.body.style.overflow = '';
    }

    getFocusableElements(modalElement) {
        return modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }

    trapFocus(modalElement) {
        const focusableElements = this.getFocusableElements(modalElement);
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        modalElement.addEventListener('keydown', handleTabKey);
        
        modalElement._tabKeyHandler = handleTabKey;
    }

    removeTrapFocus(modalElement) {
        if (modalElement._tabKeyHandler) {
            modalElement.removeEventListener('keydown', modalElement._tabKeyHandler);
            delete modalElement._tabKeyHandler;
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape' && this.currentModal) {
            this.closeModal(this.currentModal);
            this.removeTrapFocus(this.currentModal);
        }
    }
}

class NavigationManager {
    constructor() {
        this.burger = document.querySelector('.burger');
        this.nav = document.querySelector('.nav');
        this.body = document.body;
        this.isActive = false;
        this.init();
    }

    init() {
        if (!this.burger || !this.nav) return;

        this.burger.setAttribute('aria-expanded', 'false');
        this.burger.setAttribute('aria-label', 'Відкрити меню');
        this.burger.setAttribute('aria-controls', 'main-navigation');
        this.nav.setAttribute('aria-hidden', 'true');
        this.nav.id = 'main-navigation';

        this.burger.addEventListener('click', () => this.toggleMenu());
        this.burger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMenu();
            }
        });

        const navLinks = this.nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isActive) {
                    this.toggleMenu();
                }
            });

            link.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isActive) {
                    this.toggleMenu();
                    this.burger.focus();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (this.isActive && 
                !this.nav.contains(e.target) && 
                !this.burger.contains(e.target)) {
                this.toggleMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        this.isActive = !this.isActive;
        this.nav.classList.toggle('active');
        this.burger.classList.toggle('active');
        
        this.burger.setAttribute('aria-expanded', this.isActive.toString());
        this.burger.setAttribute('aria-label', this.isActive ? 'Закрити меню' : 'Відкрити меню');
        this.nav.setAttribute('aria-hidden', (!this.isActive).toString());
        
        this.body.style.overflow = this.isActive ? 'hidden' : '';

        if (this.isActive) {
            const firstLink = this.nav.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }
}

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        if (isReducedMotion) {
            document.querySelectorAll('.fade-in, .fade-in-delay, .fade-in-delay-2, .reveal, .reveal-delay, .reveal-delay-2')
                .forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);

        const animatedElements = document.querySelectorAll(
            '.fade-in, .fade-in-delay, .fade-in-delay-2, ' +
            '.reveal, .reveal-delay, .reveal-delay-2'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }
}

class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        this.init();
    }

    init() {
        if (isReducedMotion) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    if (entry.target.classList.contains('performance-detailed')) {
                        this.animatePerformanceBlock(entry.target);
                    }
                    
                    if (entry.target.classList.contains('timeline-item')) {
                        this.animateTimelineItem(entry.target);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        const revealElements = document.querySelectorAll(
            '.reveal, .reveal-delay, .reveal-delay-2, ' +
            '.fade-in, .fade-in-delay, .fade-in-delay-2'
        );
        revealElements.forEach(el => observer.observe(el));
    }

    animatePerformanceBlock(block) {
        const overlay = block.querySelector('.performance-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 1.5s ease, filter 1.5s ease';
            setTimeout(() => {
                overlay.style.opacity = '0.12';
            }, 300);
        }
    }

    animateTimelineItem(item) {
        const timeElement = item.querySelector('.timeline-time');
        const contentElement = item.querySelector('.timeline-content');
        
        if (timeElement) {
            setTimeout(() => {
                timeElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    timeElement.style.transform = 'scale(1)';
                }, 300);
            }, 200);
        }
        
        if (contentElement) {
            const children = contentElement.children;
            Array.from(children).forEach((child, index) => {
                child.style.opacity = '0';
                child.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    child.style.opacity = '1';
                    child.style.transform = 'translateX(0)';
                }, 300 + (index * 100));
            });
        }
    }
}

class TypewriterEffect {
    constructor() {
        this.init();
    }

    init() {
        if (isReducedMotion) {
            document.querySelectorAll('.title-word').forEach(word => {
                word.style.opacity = '1';
            });
            return;
        }

        const titleWords = document.querySelectorAll('.title-word');
        
        titleWords.forEach((word, index) => {
            const text = word.textContent;
            word.textContent = '';
            let charIndex = 0;
            
            const type = () => {
                if (charIndex < text.length) {
                    word.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 100 + (index * 50));
                }
            };
            
            setTimeout(type, index * 200);
        });
    }
}

class FeedbackForm {
    constructor() {
        this.form = document.getElementById('feedbackForm');
        this.notification = document.getElementById('successNotification');
        this.init();
    }

    init() {
        if (!this.form || !this.notification) return;
        
        this.form.setAttribute('aria-label', 'Форма зворотного зв\'язку');
        this.notification.setAttribute('aria-live', 'polite');
        this.notification.setAttribute('aria-atomic', 'true');
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.form.blur();
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const submitBtn = this.form.querySelector('.submit-btn');
        if (!submitBtn) return;

        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.innerHTML = '<span>Відправка...</span>';

        setTimeout(() => {
            this.showSuccess();
            setTimeout(() => {
                this.resetForm();
                submitBtn.disabled = false;
                submitBtn.setAttribute('aria-disabled', 'false');
                submitBtn.innerHTML = '<span>Надіслати</span>';
            }, 5000);
        }, 1500);
    }

    showSuccess() {
        this.form.style.display = 'none';
        this.notification.classList.add('active');
        this.notification.textContent = 'Повідомлення успішно відправлено! Дякуємо за ваш відгук.';
        this.notification.focus();
    }

    resetForm() {
        this.form.reset();
        this.form.style.display = 'block';
        this.notification.classList.remove('active');
    }
}

class RegistrationModal {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.isModalOpen = false;
        this.registerBtn = document.getElementById('registerBtn1');
        this.modalOverlay = document.getElementById('modalOverlay1');
        this.modalClose = document.getElementById('modalClose1');
        this.modalContainer = document.getElementById('modalContainer1');
        this.registrationForm = document.getElementById('registrationForm1');
        this.successMessage = document.getElementById('successMessage1');
        this.init();
    }

    init() {
        if (!this.registerBtn || !this.modalOverlay) return;

        if (this.modalOverlay) {
            this.modalManager.registerModal(this.modalOverlay);
        }

        this.registerBtn.addEventListener('click', () => this.openModal());
        
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
            this.modalClose.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        }

        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });

        if (this.registrationForm) {
            this.registrationForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            this.registrationForm.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        }
    }

    openModal() {
        if (!this.modalOverlay || !this.modalContainer) return;
        
        this.isModalOpen = true;
        this.modalManager.openModal(this.modalOverlay);

        setTimeout(() => {
            this.modalContainer.style.transform = 'scale(1) rotateX(0)';
        }, 50);

        setTimeout(() => {
            const firstInput = this.modalContainer.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 500);
    }

    closeModal() {
        if (!this.modalOverlay || !this.modalContainer) return;
        
        this.isModalOpen = false;
        this.modalManager.closeModal(this.modalOverlay);
        this.modalContainer.style.transform = 'scale(0.7) rotateX(30deg)';
        
        setTimeout(() => {
            if (this.registrationForm) {
                this.registrationForm.style.display = 'flex';
                this.registrationForm.reset();
            }
            if (this.successMessage) {
                this.successMessage.classList.remove('active');
            }
        }, 300);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn1');

        if (!submitBtn) return;

        submitBtn.style.transform = 'scale(0.95)';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.innerHTML = '<span>ОБРОБКА...</span>';

        setTimeout(() => {
            form.style.display = 'none';
            if (this.successMessage) {
                this.successMessage.classList.add('active');
                this.successMessage.focus();
            }
            
            if (!isReducedMotion) {
                this.createConfetti();
            }
            
            setTimeout(() => {
                this.closeModal();
            }, 5000);
        }, 1500);
    }

    createConfetti() {
        const colors = ['#E63946', '#D4A574', '#FFFFFF'];
        const modalContent = document.querySelector('.modal-content1');
        
        if (!modalContent) return;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: 0;
                    opacity: 1;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                modalContent.appendChild(confetti);
                
                const animDuration = 1500 + Math.random() * 500;
                const moveX = (Math.random() - 0.5) * 150;
                
                confetti.animate([
                    { 
                        transform: 'translateY(0) translateX(0) rotate(0deg)', 
                        opacity: 1 
                    },
                    { 
                        transform: `translateY(${modalContent.offsetHeight}px) translateX(${moveX}px) rotate(${Math.random() * 360}deg)`, 
                        opacity: 0 
                    }
                ], {
                    duration: animDuration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                setTimeout(() => {
                    confetti.remove();
                }, animDuration);
            }, i * 50);
        }
    }
}

class Gallery {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.currentImageIndex = 0;
        this.modal = document.getElementById('galleryModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDescription = document.getElementById('modalDescription');
        this.modalFact = document.getElementById('modalFact');
        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.closeBtn = document.getElementById('galleryClose');
        
        this.galleryData = [
            {
                img: 'img/Slovo3.jpg',
                title: 'Будинок «Слово» з висоти пташиного польоту',
                description: 'Будинок був спроєктований Михайлом Дашкевичем у 1927-1928 роках. Його унікальна форма у вигляді літери "С" символізувала єднання творчих сил українського народу.',
                fact: 'У будинку мешкало понад 60 родин української творчої інтелігенції, серед яких були письменники, поети, актори та художники.'
            },
            {
                img: 'img/Slovo1.jpg',
                title: 'Меморіальна дошка мешканців',
                description: 'На меморіальній дошці увічнено імена всіх мешканців будинку, більшість з яких стали жертвами сталінських репресій у 1930-х роках.',
                fact: 'З 66 мешканців будинку 36 були репресовані, з них 25 розстріляні.'
            },
            {
                img: 'img/буд.jpeg',
                title: 'Фасад будинку «Слово»',
                description: 'Будинок побудований у стилі, що поєднує модерн і конструктивізм. Його архітектура відображала прагнення нової України до прогресу.',
                fact: 'Будинок мав усі сучасні зручності того часу: центральне опалення, ванни, електрику та навіть ліфт.'
            },
            {
                img: 'img/остап.jpeg',
                title: 'Остап Вишня (1889-1956)',
                description: 'Класик української гумористики, автор знаменитих "Усмішок" та "Мандрівок в країну електрифікації". Був репресований у 1933 році.',
                fact: 'Остап Вишня провів 16 років у таборах, але вижив і після звільнення продовжив творчу діяльність.'
            },
            {
                img: 'img/хви.jpeg',
                title: 'Микола Хвильовий (1893-1933)',
                description: 'Український прозаїк, поет та публіцист. Автор знаменитих "Камо грядеші" та памфлетів проти русифікації української культури.',
                fact: 'Хвильовий покінчив життя самогубством 13 травня 1933 року, передбачаючи наближення масових репресій.'
            },
            {
                img: 'img/ку.jpeg',
                title: 'Микола Куліш (1892-1937)',
                description: 'Видатний український драматург, автор п\'єс "Народний Малахій", "Мина Мазайло", "Патетична соната". Розстріляний у 1937 році.',
                fact: 'П\'єси Куліша ставилися в театрах по всій Україні, але після арешту були заборонені на 50 років.'
            },
            {
                img: 'img/стус.jpeg',
                title: 'Василь Стус (1938-1985)',
                description: 'Український поет-дисидент, перекладач, літературознавець. Представник покоління шістдесятників, який продовжив справу розстріляного відродження.',
                fact: 'Стус тричі заарештовував КГБ і загинув у таборі за 6 місяців до початку перебудови.'
            },
            {
                img: 'img/дзюба.jpeg',
                title: 'Іван Дзюба (нар. 1931)',
                description: 'Літературознавець, критик, дисидент. Автор книги "Інтернаціоналізм чи русифікація?", яка стала маніфестом українського національного руху.',
                fact: 'Дзюба був репресований у 1972 році за участь у правозахисному русі, але вижив і після незалежності став міністром культури України.'
            },
            {
                img: 'img/книга.jpeg',
                title: 'Книга «Слово про будинок "Слово"»',
                description: 'Документальна книга про історію будинку та його мешканців, написана Юрієм Шаповалом. Містить унікальні фотографії та спогади.',
                fact: 'Книга була видана лише у 1988 році, після 55 років замовчування історії будинку.'
            },
            {
                img: 'img/док.jpeg',
                title: 'Документи репресій 1930-х',
                description: 'Архівні матеріали про арешти мешканців будинку "Слово" та інших представників української інтелігенції.',
                fact: 'Багато документів були розсекречені лише після здобуття Україною незалежності у 1991 році.'
            },
            {
                img: 'img/мем.jpeg',
                title: 'Меморіал розстріляного відродження',
                description: 'Пам\'ятник жертвам сталінських репресій',
                fact: 'Меморіал був відкритий у 1990 році на честь всіх репресованих митців'
            },
            {
                img: 'img/могили.jpeg',
                title: 'Могили репресованих письменників',
                description: 'Місця поховань жертв політичних репресій',
                fact: 'Багато могил досі невідомі, родини не отримували інформацію про місця поховань'
            },
            {
                img: 'img/музей.jpeg',
                title: 'Музей українських письменників',
                description: 'Експозиція присвячена розстріляному відродженню',
                fact: 'Музей містить унікальні експонати, документи та особисті речі письменників'
            }
        ];

        this.init();
    }

    init() {
        if (!this.modal) return;
        
        this.modalManager.registerModal(this.modal);
        this.initFilters();
        this.initGalleryItems();
        this.initModalControls();

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    initModalControls() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevImage());
            this.prevBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.prevImage();
                }
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextImage());
            this.nextBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.nextImage();
                }
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
            this.closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.closeModal();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextImage();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevImage();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.showImage(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.showImage(this.galleryData.length - 1);
                        break;
                }
            }
        });
    }

    initGalleryItems() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(index);
            });
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(index);
                }
            });
            
            const buttons = item.querySelectorAll('button, [onclick]');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openModal(index);
                });
                
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        this.openModal(index);
                    }
                });
            });
        });
    }

    initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (filterBtns.length === 0 || galleryItems.length === 0) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                galleryItems.forEach((item, index) => {
                    setTimeout(() => {
                        if (filter === 'all' || item.dataset.category === filter) {
                            item.classList.remove('hide');
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            item.classList.add('hide');
                        }
                    }, index * 50);
                });
            });

            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    openModal(index) {
        if (!this.isValidIndex(index)) return;
        this.currentImageIndex = index;
        this.showImage(index);
        this.modalManager.openModal(this.modal);
    }

    closeModal() {
        this.modalManager.closeModal(this.modal);
    }

    showImage(index) {
        if (!this.isValidIndex(index)) return;
        const data = this.galleryData[index];
        
        const highQualityImg = new Image();
        highQualityImg.onload = () => {
            this.modalImage.src = data.img;
        };
        highQualityImg.src = data.img;
        
        this.modalImage.alt = data.title;
        this.modalTitle.textContent = data.title;
        this.modalDescription.textContent = data.description;
        this.modalFact.textContent = data.fact;

        if (this.modalImage) {
            this.modalImage.setAttribute('aria-label', `Зображення: ${data.title}`);
        }
        
        this.updateNavigationState();
    }

    updateNavigationState() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentImageIndex === 0;
            this.prevBtn.setAttribute('aria-disabled', this.currentImageIndex === 0);
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentImageIndex === this.galleryData.length - 1;
            this.nextBtn.setAttribute('aria-disabled', this.currentImageIndex === this.galleryData.length - 1);
        }

        const indicator = this.modal.querySelector('.gallery-indicator');
        if (indicator) {
            indicator.textContent = `${this.currentImageIndex + 1} / ${this.galleryData.length}`;
        }
    }

    nextImage() {
        if (this.currentImageIndex < this.galleryData.length - 1) {
            this.currentImageIndex++;
            this.showImage(this.currentImageIndex);
        }
    }

    prevImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.showImage(this.currentImageIndex);
        }
    }

    isValidIndex(index) {
        return index >= 0 && index < this.galleryData.length;
    }
}

class QuizManager {
    constructor() {
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.matchingAnswers = {};
        
        this.quizIntro = document.getElementById('quizIntro');
        this.quizSection = document.getElementById('quizSection');
        this.quizResults = document.getElementById('quizResults');
        this.answersReview = document.getElementById('answersReview');

        this.quizData = this.getQuizData();
        this.init();
    }

    getQuizData() {
        return [
            {
                type: 'single',
                question: 'В якому році був побудований будинок "Слово"?',
                options: ['1925-1926', '1927-1928', '1930-1931', '1933-1934'],
                correct: 1,
                fact: 'Будинок "Слово" був побудований у 1927-1928 роках за проєктом архітектора Михайла Дашкевича.'
            },
            {
                type: 'single',
                question: 'Яку форму має будинок "Слово" у плані?',
                options: ['Літери "У"', 'Літери "С"', 'Круга', 'Квадрата'],
                correct: 1,
                fact: 'Будинок має форму літери "С" - першої літери слова "Слово", що символізувало єдність української культури.'
            },
            {
                type: 'single',
                question: 'Скільки родин мешкало в будинку "Слово"?',
                options: ['Близько 30', 'Близько 50', 'Більше 60', 'Близько 100'],
                correct: 2,
                fact: 'У будинку мешкало понад 66 родин української творчої інтелігенції.'
            },
            {
                type: 'single',
                question: 'Хто автор гасла "Геть від Москви"?',
                options: ['Павло Тичина', 'Микола Хвильовий', 'Остап Вишня', 'Микола Куліш'],
                correct: 1,
                fact: 'Це гасло висунув Микола Хвильовий у своїх памфлетах, закликаючи українську культуру орієнтуватися на Європу.'
            },
            {
                type: 'single',
                question: 'В якому році почалися масові репресії проти мешканців будинку?',
                options: ['1929', '1933', '1935', '1937'],
                correct: 1,
                fact: 'Перша хвиля репресій розпочалася у травні 1933 року з арешту Михайла Ялового.'
            },
            {
                type: 'single',
                question: 'Як Іван Багряний назвав будинок "Слово"?',
                options: ['Дім терору', 'Крематорій', 'Чорна могила', 'Темниця'],
                correct: 1,
                fact: 'Іван Багряний у своїх творах називав будинок "Крематорієм" через масові репресії його мешканців.'
            },
            {
                type: 'single',
                question: 'Скільки мешканців будинку було репресовано?',
                options: ['Близько 20', '36', 'Близько 50', 'Всі мешканці'],
                correct: 1,
                fact: 'З 66 мешканців будинку 36 були репресовані, з них 25 розстріляні.'
            },
            {
                type: 'single',
                question: 'Коли Микола Хвильовий покінчив життя самогубством?',
                options: ['1932', '13 травня 1933', '1934', '1937'],
                correct: 1,
                fact: 'Хвильовий застрелився 13 травня 1933 року, передбачаючи масові репресії.'
            },
            {
                type: 'single',
                question: 'Яку збірку НЕ написав Павло Тичина?',
                options: ['Сонячні кларнети', 'Камо грядеші', 'Плуг', 'Вітер з України'],
                correct: 1,
                fact: '"Камо грядеші" написав Микола Хвильовий, а не Павло Тичина.'
            },
            {
                type: 'single',
                question: 'Хто був засновником українського футуризму?',
                options: ['Микола Бажан', 'Михайль Семенко', 'Павло Тичина', 'Остап Вишня'],
                correct: 1,
                fact: 'Михайль Семенко заснував український футуризм і створив літературні об\'єднання "Кверофутуризм" та "Аспанфут".'
            },
            {
                type: 'single',
                question: 'Який драматург написав п\'єсу "Мина Мазайло"?',
                options: ['Микола Куліш', 'Іван Кочерга', 'Олександр Корнійчук', 'Володимир Винниченко'],
                correct: 0,
                fact: 'Микола Куліш написав знамениту п\'єсу "Мина Мазайло", яка була заборонена після його арешту.'
            },
            {
                type: 'single',
                question: 'Який архітектурний стиль поєднує будинок "Слово"?',
                options: ['Бароко і класицизм', 'Модерн і конструктивізм', 'Ренесанс і готика', 'Ампір і рококо'],
                correct: 1,
                fact: 'Будинок побудований у стилі, що поєднує модерн і конструктивізм, відображаючи прагнення до прогресу.'
            },
            {
                type: 'single',
                question: 'Скільки років Остап Вишня провів у таборах?',
                options: ['5 років', '10 років', '16 років', '20 років'],
                correct: 2,
                fact: 'Остап Вишня провів 16 років у таборах, але вижив і після звільнення продовжив творчу діяльність.'
            },
            {
                type: 'single',
                question: 'Хто написав книгу "Інтернаціоналізм чи русифікація?"',
                options: ['Василь Стус', 'Іван Дзюба', 'В\'ячеслав Чорновіл', 'Іван Світличний'],
                correct: 1,
                fact: 'Іван Дзюба написав цю книгу у 1965 році, вона стала маніфестом українського національного руху.'
            },
            {
                type: 'single',
                question: 'В якому році був заарештований Василь Стус востаннє?',
                options: ['1965', '1972', '1980', '1985'],
                correct: 2,
                fact: 'Василь Стус був заарештований втретє у 1980 році і загинув у таборі у 1985 році.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть письменників з їх творами:',
                pairs: [
                    { left: 'Микола Хвильовий', right: 'Камо грядеші' },
                    { left: 'Остап Вишня', right: 'Усмішки' },
                    { left: 'Микола Куліш', right: 'Народний Малахій' },
                    { left: 'Павло Тичина', right: 'Сонячні кларнети' }
                ],
                fact: 'Кожен з цих письменників створив унікальні твори, що стали класикою української літератури.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть шістдесятників з їх діяльністю:',
                pairs: [
                    { left: 'Василь Стус', right: 'Поет-дисидент' },
                    { left: 'Іван Дзюба', right: 'Літературознавець' },
                    { left: 'В\'ячеслав Чорновіл', right: 'Політичний діяч' },
                    { left: 'Іван Світличний', right: 'Перекладач' }
                ],
                fact: 'Шістдесятники продовжили справу розстріляного відродження, борючись за права українського народу.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть письменників з їх роками життя:',
                pairs: [
                    { left: 'Микола Хвильовий', right: '1893-1933' },
                    { left: 'Остап Вишня', right: '1889-1956' },
                    { left: 'Павло Тичина', right: '1891-1967' },
                    { left: 'Василь Стус', right: '1938-1985' }
                ],
                fact: 'Ці дати відображають трагічну долю українських митців у XX столітті.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть терміни з його значенням:',
                pairs: [
                    { left: 'Розстріляне відродження', right: 'Покоління 1920-30-х років' },
                    { left: 'Шістдесятники', right: 'Покоління 1960-х років' },
                    { left: 'Футуризм', right: 'Літературний напрямок' },
                    { left: 'Репресії', right: 'Політичні переслідування' }
                ],
                fact: 'Ці терміни є ключовими для розуміння української історії XX століття.'
            },
            {
                type: 'single',
                question: 'Який поет переклав твори Шекспіра українською?',
                options: ['Григорій Епік', 'Павло Тичина', 'Остап Вишня', 'Микола Бажан'],
                correct: 0,
                fact: 'Григорій Епік був визначним перекладачем, який переклав твори Шекспіра та інших класиків.'
            },
            {
                type: 'single',
                question: 'В якому місті знаходиться будинок "Слово"?',
                options: ['Києві', 'Львові', 'Харкові', 'Одесі'],
                correct: 2,
                fact: 'Будинок "Слово" розташований у Харкові, який був столицею України до 1934 року.'
            },
            {
                type: 'single',
                question: 'Коли була видана книга "Слово про будинок \'Слово\'"?',
                options: ['1960', '1972', '1988', '1991'],
                correct: 2,
                fact: 'Книга була видана лише у 1988 році, після 55 років замовчування історії будинку.'
            },
            {
                type: 'single',
                question: 'Яке літературне об\'єднання створив Михайль Семенко?',
                options: ['Пролеткульт', 'Кверофутуризм', 'Плуг', 'Молодняк'],
                correct: 1,
                fact: 'Семенко створив авангардне об\'єднання "Кверофутуризм", яке експериментувало з формою та мовою.'
            },
            {
                type: 'single',
                question: 'Скільки літературних організацій існувало в Україні у 1920-ті роки?',
                options: ['Близько 5', 'Близько 10', 'Понад 20', 'Понад 50'],
                correct: 2,
                fact: 'У 1920-ті роки в Україні існувало понад 20 літературних організацій різних напрямків.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть п\'єси Миколи Куліша:',
                pairs: [
                    { left: 'Народний Малахій', right: 'Сатира на бюрократію' },
                    { left: 'Мина Мазайло', right: 'Про національне питання' },
                    { left: 'Патетична соната', right: 'Про революцію' },
                    { left: '97', right: 'Про репресії' }
                ],
                fact: 'П\'єси Куліша були заборонені після його арешту і не ставилися протягом 50 років.'
            },
            {
                type: 'single',
                question: 'Коли Харків був столицею України?',
                options: ['1917-1934', '1919-1939', '1920-1932', '1922-1934'],
                correct: 0,
                fact: 'Харків був столицею УРСР з 1917 по 1934 рік, коли столицю перенесли до Києва.'
            },
            {
                type: 'single',
                question: 'Який відсоток мешканців будинку "Слово" було репресовано?',
                options: ['Близько 30%', 'Близько 50%', 'Більше 54%', 'Близько 75%'],
                correct: 2,
                fact: 'Більше 54% (36 з 66) мешканців будинку були репресовані, що свідчить про масштаби терору.'
            },
            {
                type: 'single',
                question: 'Що означає термін "розстріляне відродження"?',
                options: ['Відродження після війни', 'Покоління репресованих митців', 'Літературний напрямок', 'Назва організації'],
                correct: 1,
                fact: 'Термін "розстріляне відродження" означає покоління українських митців 1920-30-х років, знищених репресіями.'
            },
            {
                type: 'single',
                question: 'Хто з письменників вижив під час репресій, але змушений був співпрацювати з режимом?',
                options: ['Остап Вишня', 'Павло Тичина', 'Микола Бажан', 'Всі вищеперелічені'],
                correct: 3,
                fact: 'Багато письменників, які вижили, були змушені співпрацювати з радянським режимом для виживання.'
            },
            {
                type: 'matching',
                question: 'Співвіднесіть події з роками:',
                pairs: [
                    { left: 'Побудова будинку', right: '1927-1928' },
                    { left: 'Початок репресій', right: '1933' },
                    { left: 'Смерть Хвильового', right: '1933' },
                    { left: 'Видання книги про будинок', right: '1988' }
                ],
                fact: 'Ці події маркують ключові моменти в історії будинку "Слово" та його мешканців.'
            }
        ];
    }

    init() {
        if (!this.quizIntro || !this.quizSection) return;
        
        this.quizIntro.setAttribute('aria-label', 'Вступ до квізу');
        this.quizSection.setAttribute('aria-label', 'Область квізу');
        this.quizResults.setAttribute('aria-live', 'polite');

        document.addEventListener('keydown', (e) => {
            if (this.quizSection.style.display === 'block') {
                switch(e.key) {
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevQuestion();
                        break;
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextQuestion();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        if (this.answersReview.style.display === 'block') {
                            this.backToResults();
                        }
                        break;
                }
            }
        });
    }

    startQuiz() {
        this.quizIntro.style.display = 'none';
        this.quizSection.style.display = 'block';
        this.quizSection.setAttribute('aria-hidden', 'false');
        this.showQuestion(0);
        
        setTimeout(() => {
            const firstOption = document.querySelector('.option');
            if (firstOption) firstOption.focus();
        }, 100);
    }

    showQuestion(index) {
        if (index < 0 || index >= this.quizData.length) return;

        this.currentQuestion = index;
        const question = this.quizData[index];
        const container = document.getElementById('quizContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const funFact = document.getElementById('funFact');

        if (!container || !progressFill || !progressText || !prevBtn || !nextBtn || !funFact) return;

        const progress = ((index + 1) / this.quizData.length) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Питання ${index + 1} з ${this.quizData.length}`;

        funFact.style.display = 'none';

        let html = `
            <div class="question-number" aria-label="Питання ${index + 1}">Питання ${index + 1}</div>
            <div class="question-text">${question.question}</div>
        `;

        if (question.type === 'single') {
            html += '<div class="options-container" role="radiogroup" aria-label="Варіанти відповідей">';
            question.options.forEach((option, i) => {
                const isSelected = this.userAnswers[index] === i;
                html += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         onclick="App.quiz.selectOption(${i})"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.quiz.selectOption(${i})}"
                         role="radio"
                         aria-checked="${isSelected}"
                         tabindex="0">
                        <span>${option}</span>
                    </div>
                `;
            });
            html += '</div>';
        } else if (question.type === 'matching') {
            html += '<div class="matching-container">';
            html += '<div class="matching-column">';
            html += '<h4>Питання</h4>';
            question.pairs.forEach((pair, i) => {
                const isSelected = this.matchingAnswers.leftSelected === i;
                html += `
                    <div class="matching-item ${isSelected ? 'selected' : ''}" 
                         onclick="App.quiz.selectLeft(${i})"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.quiz.selectLeft(${i})}"
                         tabindex="0">
                        ${pair.left}
                    </div>
                `;
            });
            html += '</div>';

            html += '<div class="matching-column">';
            html += '<h4>Відповіді</h4>';
            const shuffledRights = [...question.pairs].sort(() => Math.random() - 0.5);
            shuffledRights.forEach((pair, i) => {
                const isSelected = this.matchingAnswers.rightSelected === i;
                const safeRight = pair.right.replace(/'/g, "\\'").replace(/"/g, '\\"');
                html += `
                    <div class="matching-item ${isSelected ? 'selected' : ''}" 
                         onclick="App.quiz.selectRight(${i}, '${safeRight}')"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.quiz.selectRight(${i}, '${safeRight}')}"
                         tabindex="0">
                        ${pair.right}
                    </div>
                `;
            });
            html += '</div>';
            html += '</div>';

            if (!this.userAnswers[index]) {
                this.userAnswers[index] = [];
            }
        }

        container.innerHTML = html;
        prevBtn.disabled = index === 0;
        prevBtn.setAttribute('aria-disabled', index === 0);
        nextBtn.textContent = index === this.quizData.length - 1 ? 'Завершити' : 'Далі';
        
        container.setAttribute('aria-label', `Питання ${index + 1}: ${question.question}`);

        container.focus();
    }

    selectOption(optionIndex) {
        this.userAnswers[this.currentQuestion] = optionIndex;
        this.showQuestion(this.currentQuestion);

        const question = this.quizData[this.currentQuestion];
        const factText = document.getElementById('factText');
        const funFact = document.getElementById('funFact');

        if (factText && funFact) {
            factText.textContent = question.fact;
            funFact.style.display = 'block';
        }
    }

    selectLeft(index) {
        const question = this.quizData[this.currentQuestion];
        const userPairs = this.userAnswers[this.currentQuestion] || [];

        if (userPairs.find(p => p.left === question.pairs[index].left)) {
            return; // already matched
        }

        if (this.matchingAnswers.leftSelected === index) {
            this.matchingAnswers.leftSelected = null;
        } else {
            this.matchingAnswers.leftSelected = index;

            if (this.matchingAnswers.rightSelected !== null && this.matchingAnswers.rightSelected !== undefined) {
                if (!this.userAnswers[this.currentQuestion]) {
                    this.userAnswers[this.currentQuestion] = [];
                }
                if (question && question.pairs[index]) {
                    this.userAnswers[this.currentQuestion].push({
                        left: question.pairs[index].left,
                        right: this.matchingAnswers.rightValue
                    });
                }

                this.matchingAnswers = {};
                this.showQuestion(this.currentQuestion);

                if (question && this.userAnswers[this.currentQuestion].length === question.pairs.length) {
                    const factText = document.getElementById('factText');
                    const funFact = document.getElementById('funFact');
                    if (factText && funFact) {
                        factText.textContent = question.fact;
                        funFact.style.display = 'block';
                    }
                }
            }
        }
        this.showQuestion(this.currentQuestion);
    }

    selectRight(index, value) {
        const question = this.quizData[this.currentQuestion];
        const userPairs = this.userAnswers[this.currentQuestion] || [];

        if (userPairs.find(p => p.right === value)) {
            return; // already matched
        }

        if (this.matchingAnswers.rightSelected === index) {
            this.matchingAnswers.rightSelected = null;
            this.matchingAnswers.rightValue = null;
        } else {
            this.matchingAnswers.rightSelected = index;
            this.matchingAnswers.rightValue = value;

            if (this.matchingAnswers.leftSelected !== null && this.matchingAnswers.leftSelected !== undefined) {
                if (!this.userAnswers[this.currentQuestion]) {
                    this.userAnswers[this.currentQuestion] = [];
                }
                if (question && question.pairs[this.matchingAnswers.leftSelected]) {
                    this.userAnswers[this.currentQuestion].push({
                        left: question.pairs[this.matchingAnswers.leftSelected].left,
                        right: value
                    });
                }

                this.matchingAnswers = {};
                this.showQuestion(this.currentQuestion);

                if (question && this.userAnswers[this.currentQuestion].length === question.pairs.length) {
                    const factText = document.getElementById('factText');
                    const funFact = document.getElementById('funFact');
                    if (factText && funFact) {
                        factText.textContent = question.fact;
                        funFact.style.display = 'block';
                    }
                }
            }
        }
        this.showQuestion(this.currentQuestion);
    }

    nextQuestion() {
        if (this.currentQuestion < this.quizData.length - 1) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.finishQuiz();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    finishQuiz() {
        if (!this.quizSection || !this.quizResults) return;

        let correctCount = 0;

        this.quizData.forEach((question, index) => {
            if (question.type === 'single') {
                if (this.userAnswers[index] === question.correct) {
                    correctCount++;
                }
            } else if (question.type === 'matching') {
                let allCorrect = true;
                const userPairs = this.userAnswers[index] || [];

                if (userPairs.length !== question.pairs.length) {
                    allCorrect = false;
                } else {
                    question.pairs.forEach(pair => {
                        const found = userPairs.find(up =>
                            up.left === pair.left && up.right === pair.right
                        );
                        if (!found) allCorrect = false;
                    });
                }

                if (allCorrect) correctCount++;
            }
        });

        const percentage = Math.round((correctCount / this.quizData.length) * 100);
        const incorrectCount = this.quizData.length - correctCount;

        let grade;
        if (percentage >= 90) grade = '12';
        else if (percentage >= 82) grade = '11';
        else if (percentage >= 74) grade = '10';
        else if (percentage >= 64) grade = '9';
        else if (percentage >= 54) grade = '8';
        else if (percentage >= 44) grade = '7';
        else if (percentage >= 34) grade = '6';
        else grade = 'Незадовільно';

        this.quizSection.style.display = 'none';
        this.quizResults.style.display = 'block';

        const resultsIcon = document.getElementById('resultsIcon');
        const resultsTitle = document.getElementById('resultsTitle');
        const circle = document.getElementById('scoreCircle');
        const scorePercentEl = document.getElementById('scorePercent');
        const correctCountEl = document.getElementById('correctCount');
        const incorrectCountEl = document.getElementById('incorrectCount');
        const gradeValueEl = document.getElementById('gradeValue');
        const resultsMessage = document.getElementById('resultsMessage');

        if (!resultsIcon || !resultsTitle || !circle || !scorePercentEl || !correctCountEl || !incorrectCountEl || !gradeValueEl || !resultsMessage) return;

        if (percentage >= 90) {
            resultsIcon.textContent = '🏆';
            resultsTitle.textContent = 'Відмінний результат!';
            resultsMessage.textContent = 'Ви чудово знаєте історію розстріляного відродження! Ваші знання вражають.';
        } else if (percentage >= 70) {
            resultsIcon.textContent = '⭐';
            resultsTitle.textContent = 'Чудова робота!';
            resultsMessage.textContent = 'Ви маєте хороші знання про розстріляне відродження. Продовжуйте вивчати цю важливу тему!';
        } else if (percentage >= 50) {
            resultsIcon.textContent = '👍';
            resultsTitle.textContent = 'Гарний результат!';
            resultsMessage.textContent = 'У вас є базові знання про розстріляне відродження. Рекомендуємо поглибити свої знання.';
        } else {
            resultsIcon.textContent = '📚';
            resultsTitle.textContent = 'Потрібно попрацювати більше';
            resultsMessage.textContent = 'Вам потрібно більше дізнатися про розстріляне відродження. Рекомендуємо відвідати нашу галерею та прочитати більше матеріалів.';
        }

        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (percentage / 100) * circumference;

        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 2s ease';
            circle.style.strokeDashoffset = offset;
        }, 100);

        let currentPercent = 0;
        const interval = setInterval(() => {
            currentPercent++;
            scorePercentEl.textContent = currentPercent + '%';
            if (currentPercent >= percentage) {
                clearInterval(interval);
            }
        }, 20);

        correctCountEl.textContent = correctCount;
        incorrectCountEl.textContent = incorrectCount;
        gradeValueEl.textContent = grade;
    }

    showAnswers() {
        if (!this.quizResults || !this.answersReview) return;

        this.quizResults.style.display = 'none';
        this.answersReview.style.display = 'block';

        const container = document.getElementById('answersContainer');
        if (!container) return;

        let html = '';

        this.quizData.forEach((question, index) => {
            const isCorrect = this.checkAnswer(question, this.userAnswers[index]);

            html += `
                <div class="answer-review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-question">Питання ${index + 1}: ${question.question}</div>
            `;

            if (question.type === 'single') {
                html += `
                    <div class="review-answer">
                        <span class="review-label">Ваша відповідь:</span>
                        <span class="review-value ${isCorrect ? '' : 'user-incorrect'}">
                            ${this.userAnswers[index] !== undefined && question.options[this.userAnswers[index]] ? question.options[this.userAnswers[index]] : 'Не відповіли'}
                        </span>
                    </div>
                `;

                if (!isCorrect) {
                    html += `
                        <div class="review-answer">
                            <span class="review-label">Правильна відповідь:</span>
                            <span class="review-value correct-answer">${question.options[question.correct]}</span>
                        </div>
                    `;
                }
            } else if (question.type === 'matching') {
                html += '<div class="review-answer">';
                html += '<span class="review-label">Ваші відповіді:</span>';
                const userPairs = this.userAnswers[index] || [];
                userPairs.forEach(pair => {
                    const correct = question.pairs.find(p => p.left === pair.left && p.right === pair.right);
                    html += `<div class="review-value ${correct ? '' : 'user-incorrect'}">${pair.left} → ${pair.right}</div>`;
                });
                html += '</div>';

                if (!isCorrect) {
                    html += '<div class="review-answer">';
                    html += '<span class="review-label">Правильні відповіді:</span>';
                    question.pairs.forEach(pair => {
                        html += `<div class="review-value correct-answer">${pair.left} → ${pair.right}</div>`;
                    });
                    html += '</div>';
                }
            }

            html += `
                    <div class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
                        ${isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        window.scrollTo(0, 0);
    }

    checkAnswer(question, userAnswer) {
        if (question.type === 'single') {
            return userAnswer === question.correct;
        } else if (question.type === 'matching') {
            const userPairs = userAnswer || [];

            if (userPairs.length !== question.pairs.length) {
                return false;
            }

            let allCorrect = true;
            question.pairs.forEach(pair => {
                const found = userPairs.find(up =>
                    up.left === pair.left && up.right === pair.right
                );
                if (!found) allCorrect = false;
            });

            return allCorrect;
        }
        return false;
    }

    backToResults() {
        if (this.answersReview && this.quizResults) {
            this.answersReview.style.display = 'none';
            this.quizResults.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }

    restartQuiz() {
        if (this.quizResults && this.quizIntro) {
            this.currentQuestion = 0;
            this.userAnswers = [];
            this.matchingAnswers = {};

            this.quizResults.style.display = 'none';
            this.quizIntro.style.display = 'block';

            const circle = document.getElementById('scoreCircle');
            if (circle) {
                circle.style.transition = 'none';
                circle.style.strokeDashoffset = '565.48';
            }

            window.scrollTo(0, 0);
        }
    }
}

class TooltipManager {
    constructor() {
        this.murName = document.getElementById('murName');
        this.murTooltip = document.getElementById('murTooltip');
        this.tooltipTimeout = null;
        this.init();
    }

    init() {
        if (!this.murName || !this.murTooltip) return;
        
        this.murName.addEventListener('mouseenter', () => this.showTooltip());
        this.murName.addEventListener('mouseleave', () => this.scheduleHide());
        this.murTooltip.addEventListener('mouseenter', () => this.cancelHide());
        this.murTooltip.addEventListener('mouseleave', () => this.hideTooltip());
        
        this.murName.addEventListener('focus', () => this.showTooltip());
        this.murName.addEventListener('blur', () => this.hideTooltip());
    }

    showTooltip() {
        clearTimeout(this.tooltipTimeout);
        this.murTooltip.style.opacity = '1';
        this.murTooltip.style.visibility = 'visible';
        this.murTooltip.style.transform = 'translate(-50%, -50%) scale(1)';

        const tooltipContent = this.murTooltip.querySelector('.tooltip-content');
        if (tooltipContent) {
            const children = tooltipContent.children;
            Array.from(children).forEach((child, index) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    child.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, 100 + (index * 50));
            });
        }
    }

    scheduleHide() {
        this.tooltipTimeout = setTimeout(() => {
            this.hideTooltip();
        }, 300);
    }

    cancelHide() {
        clearTimeout(this.tooltipTimeout);
    }

    hideTooltip() {
        this.murTooltip.style.opacity = '0';
        this.murTooltip.style.visibility = 'hidden';
        this.murTooltip.style.transform = 'translate(-50%, -50%) scale(0.8)';

        const tooltipContent = this.murTooltip.querySelector('.tooltip-content');
        if (tooltipContent) {
            const children = tooltipContent.children;
            Array.from(children).forEach(child => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(10px)';
                child.style.transition = 'none';
            });
        }
    }
}

class ParallaxManager {
    constructor() {
        this.animationFrameId = null;
        this.init();
    }

    init() {
        if (isReducedMotion) return;

        const handleParallax = throttle(() => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-contacts, .hero-gallery, .hero-quiz, .hero');

            parallaxElements.forEach(el => {
                if (el) {
                    const speed = 0.3;
                    el.style.transform = `translateY(${scrolled * speed}px)`;
                }
            });

            const elements = document.querySelectorAll(
                '.hero, .about-section, .program-section, ' +
                '.mur-section, .quote-section, .registration-section1'
            );
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
                
                if (isInViewport) {
                    const scrollY = window.scrollY;
                    const offset = rect.top + scrollY;
                    const speed = 0.2;
                    element.style.backgroundPositionY = `${(scrollY - offset) * speed}px`;
                }
            });
        }, 16);

        window.addEventListener('scroll', handleParallax, { passive: true });

        window.addEventListener('unload', () => {
            this.cleanup();
        });
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

class ScrollEffects {
    constructor() {
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        if (isReducedMotion) return;

        const handleScroll = throttle(() => {
            const currentScrollY = window.scrollY;

            const leftBorder = document.querySelector('.ornament-border.left');
            const rightBorder = document.querySelector('.ornament-border.right');
            
            if (leftBorder && rightBorder) {
                const offset = currentScrollY * 0.1;
                leftBorder.style.transform = `translateY(${offset}px)`;
                rightBorder.style.transform = `translateY(${offset}px)`;

                const maxScroll = document.body.scrollHeight - window.innerHeight;
                const opacity = 0.3 - (currentScrollY / maxScroll) * 0.2;
                leftBorder.style.opacity = opacity;
                rightBorder.style.opacity = opacity;
            }
            
            this.lastScrollY = currentScrollY;
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

// MAIN APP CONTROLLER
const App = {
    gallery: null,
    quiz: null,
    modalManager: null,
    
    init() {
        this.modalManager = new AccessibleModalManager();
        
        new NavigationManager();
        new ScrollAnimations();
        new AnimationManager();
        new FeedbackForm();
        new RegistrationModal(this.modalManager);
        this.gallery = new Gallery(this.modalManager);
        this.quiz = new QuizManager();
        new ParallaxManager();
        new TypewriterEffect();
        new ParticleSystem();
        new ScrollEffects();
        new TooltipManager();
        new LazyImageLoader();
        
        this.setupEventListeners();
        this.initializeAnimations();
    },
    
    setupEventListeners() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && document.querySelector(href)) {
                    e.preventDefault();
                    document.querySelector(href).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        document.querySelectorAll('.contact-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!isReducedMotion) {
                    this.style.transform = 'translateY(-15px) scale(1.03)';
                }
            });

            card.addEventListener('mouseleave', function() {
                if (!isReducedMotion) {
                    this.style.transform = 'translateY(-10px) scale(1)';
                }
            });
        });

        document.querySelectorAll('.social-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!isReducedMotion) {
                    const icon = this.querySelector('.social-icon svg');
                    if (icon) {
                        icon.style.transform = 'scale(1.3) rotate(360deg)';
                    }
                }
            });

            card.addEventListener('mouseleave', function() {
                if (!isReducedMotion) {
                    const icon = this.querySelector('.social-icon svg');
                    if (icon) {
                        icon.style.transform = 'scale(1) rotate(0deg)';
                    }
                }
            });
        });
    },
    
    initializeAnimations() {
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
        }, 100);

        setTimeout(() => {
            document.querySelectorAll('.fade-in-delay').forEach(el => {
                el.classList.add('visible');
            });
        }, 400);

        setTimeout(() => {
            document.querySelectorAll('.fade-in-delay-2').forEach(el => {
                el.classList.add('visible');
            });
        }, 700);
    },
    
    openModal(index) {
        this.gallery?.openModal(index);
    },
    
    closeModal() {
        this.gallery?.closeModal();
    },
    
    nextImage() {
        this.gallery?.nextImage();
    },
    
    prevImage() {
        this.gallery?.prevImage();
    },
    
    startQuiz() {
        this.quiz?.startQuiz();
    },
    
    nextQuestion() {
        this.quiz?.nextQuestion();
    },
    
    prevQuestion() {
        this.quiz?.prevQuestion();
    },
    
    showAnswers() {
        this.quiz?.showAnswers();
    },
    
    backToResults() {
        this.quiz?.backToResults();
    },
    
    restartQuiz() {
        this.quiz?.restartQuiz();
    },
    
    selectOption(optionIndex) {
        this.quiz?.selectOption(optionIndex);
    },
    
    selectLeft(index) {
        this.quiz?.selectLeft(index);
    },
    
    selectRight(index, value) {
        this.quiz?.selectRight(index, value);
    }
};

window.openModal = (index) => App.openModal(index);
window.closeModal = () => App.closeModal();
window.nextImage = () => App.nextImage();
window.prevImage = () => App.prevImage();
window.startQuiz = () => App.startQuiz();
window.nextQuestion = () => App.nextQuestion();
window.prevQuestion = () => App.prevQuestion();
window.showAnswers = () => App.showAnswers();
window.backToResults = () => App.backToResults();
window.restartQuiz = () => App.restartQuiz();
window.selectOption = (index) => App.selectOption(index);
window.selectLeft = (index) => App.selectLeft(index);
window.selectRight = (index, value) => App.selectRight(index, value);

document.addEventListener('DOMContentLoaded', () => App.init());

window.addEventListener('beforeunload', () => {
    if (App.gallery && App.gallery.animationFrameId) {
        cancelAnimationFrame(App.gallery.animationFrameId);
    }
    const canvas = document.querySelector('canvas');
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
    }
});
