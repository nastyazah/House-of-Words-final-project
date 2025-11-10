/**
 * Common Module - Загальний модуль для всіх сторінок
 * @version 2.0.0
 */

const CommonModule = (() => {
    // Constants
    const CONFIG = {
        AUTOPLAY_INTERVAL: 5000,
        ANIMATION_DELAY: 100,
        SCROLL_THRESHOLD: 0.1,
        SCROLL_MARGIN: '0px 0px -50px 0px',
        TRANSITION_DURATION: 500,
        IDLE_CALLBACK_TIMEOUT: 2000
    };

    const STORAGE_KEYS = {
        HIGH_CONTRAST: 'highContrastEnabled',
        TEXT_SIZE: 'textSizeLevel',
        THEME: 'theme'
    };

    // State
    let isInitialized = false;

    // Storage wrapper with fallback
    const storage = {
        get(key) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.warn(`Storage get error for key "${key}":`, error);
                return null;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn(`Storage set error for key "${key}":`, error);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn(`Storage remove error for key "${key}":`, error);
                return false;
            }
        }
    };

    // Navigation
    const initNavigation = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!navToggle || !navMenu) {
            console.warn('Navigation elements not found');
            return;
        }

        const closeMenu = () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        };

        const toggleMenu = () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
                navToggle.focus();
            }
        });
    };

    // Quotes Slider
    const initQuotesSlider = () => {
        const quotes = document.querySelectorAll('.quote');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.quote-prev');
        const nextBtn = document.querySelector('.quote-next');
        const quotesSection = document.querySelector('.quotes-section');
        
        if (quotes.length === 0) return;
        
        let currentIndex = 0;
        let autoplayInterval = null;
        let isTransitioning = false;

        const showQuote = (index) => {
            if (isTransitioning) return;
            
            isTransitioning = true;
            
            quotes.forEach(quote => quote.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            quotes[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            
            currentIndex = index;

            setTimeout(() => {
                isTransitioning = false;
            }, CONFIG.TRANSITION_DURATION);
        };

        const nextQuote = () => {
            const nextIndex = (currentIndex + 1) % quotes.length;
            showQuote(nextIndex);
        };

        const prevQuote = () => {
            const prevIndex = (currentIndex - 1 + quotes.length) % quotes.length;
            showQuote(prevIndex);
        };

        const startAutoplay = () => {
            stopAutoplay();
            autoplayInterval = setInterval(nextQuote, CONFIG.AUTOPLAY_INTERVAL);
        };

        const stopAutoplay = () => {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        };

        // Event listeners
        nextBtn?.addEventListener('click', () => {
            nextQuote();
            startAutoplay();
        });

        prevBtn?.addEventListener('click', () => {
            prevQuote();
            startAutoplay();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showQuote(index);
                startAutoplay();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!quotesSection) return;

            const rect = quotesSection.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isInView) {
                if (e.key === 'ArrowLeft') {
                    prevQuote();
                    startAutoplay();
                } else if (e.key === 'ArrowRight') {
                    nextQuote();
                    startAutoplay();
                }
            }
        });

        // Pause on hover
        quotesSection?.addEventListener('mouseenter', stopAutoplay);
        quotesSection?.addEventListener('mouseleave', startAutoplay);

        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stopAutoplay() : startAutoplay();
        });

        // Start autoplay
        startAutoplay();
    };

    // Animations with IntersectionObserver
    const initAnimations = (customSelectors = []) => {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        const baseSelectors = '.bio-paragraph, .timeline-item, .work-card, .fact-item';
        const allSelectors = customSelectors.length > 0 
            ? `${baseSelectors}, ${customSelectors.join(', ')}`
            : baseSelectors;

        const animatedElements = document.querySelectorAll(allSelectors);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.SCROLL_THRESHOLD,
            rootMargin: CONFIG.SCROLL_MARGIN
        });

        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * CONFIG.ANIMATION_DELAY}ms, transform 0.6s ease ${index * CONFIG.ANIMATION_DELAY}ms`;
            observer.observe(el);
        });
    };

    // Smooth scroll
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // Accessibility
    const initAccessibility = () => {
        let isKeyboardNavigation = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isKeyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            isKeyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });

        // Touch device detection
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Check images for alt text
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt || img.alt.trim() === '') {
                console.warn('Image without alt text:', img.src);
                img.alt = 'Зображення';
            }
        });

        // External links enhancement
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        externalLinks.forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                if (!link.getAttribute('target')) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
                
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon';
                    icon.setAttribute('aria-hidden', 'true');
                    icon.innerHTML = ' ↗';
                    link.appendChild(icon);
                }
            }
        });
    };

    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) return;
        
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if (!('IntersectionObserver' in window)) {
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
            return;
        }
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    const initErrorHandling = () => {
        window.addEventListener('error', (e) => {
            console.error('Page error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    };

    const logPerformance = () => {
        if (!window.performance) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log(`Page load time: ${pageLoadTime}ms`);
                
                if (pageLoadTime > 3000) {
                    console.warn('Page load time exceeds 3 seconds. Consider optimization.');
                }
            }, 0);
        });
    };

    const runWhenIdle = (callback) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: CONFIG.IDLE_CALLBACK_TIMEOUT });
        } else {
            setTimeout(callback, 1);
        }
    };

    const init = (options = {}) => {
        if (isInitialized) {
            console.warn('CommonModule is already initialized');
            return;
        }

        const {
            navigation = true,
            quotesSlider = true,
            animations = true,
            animationSelectors = [],
            accessibility = true,
            smoothScroll = true,
            lazyLoading = true,
            errorHandling = true,
            performanceMonitoring = false
        } = options;

        if (navigation) initNavigation();
        if (smoothScroll) initSmoothScroll();
        if (errorHandling) initErrorHandling();
        
        runWhenIdle(() => {
            if (quotesSlider) initQuotesSlider();
            if (animations) initAnimations(animationSelectors);
            if (accessibility) initAccessibility();
            if (lazyLoading) initLazyLoading();
            if (performanceMonitoring) logPerformance();
        });
        
        document.body.classList.add('page-loaded');
        isInitialized = true;
        
        console.log('CommonModule initialized successfully');
    };

    return { 
        init, 
        storage,
        CONFIG,
        STORAGE_KEYS
    };
})();

const addStyleSheet = () => {
    if (document.getElementById('common-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'common-styles';
    styleSheet.textContent = `
        .keyboard-navigation *:focus {
            outline: 3px solid var(--gold, #D4A574);
            outline-offset: 2px;
        }
        
        body:not(.keyboard-navigation) *:focus {
            outline: none;
        }
        
        .external-link-icon {
            font-size: 0.8em;
            opacity: 0.7;
        }
        
        img.loaded {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .page-loaded {
            animation: pageLoad 0.5s ease;
        }
        
        @keyframes pageLoad {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(styleSheet);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addStyleSheet);
} else {
    addStyleSheet();
}