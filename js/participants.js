/**
 * Participants Page Script
 * @version 2.0.0
 */

// Constants
const CONSTANTS = {
    SCROLL_THRESHOLD: 500,
    DEBOUNCE_DELAY: 250,
    THROTTLE_DELAY: 100,
    ANIMATION_DELAY: 150,
    CATEGORY_TRANSITION: 300,
    MEMORY_CHECK_INTERVAL: 30000
};

const ANALYTICS_EVENTS = {
    CARD_CLICK: 'card_click',
    FILTER_USED: 'filter_used',
    PAGE_VIEW: 'page_view',
    TIME_SPENT: 'time_spent'
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initAccessibilityFeatures();
    initInteractiveElements();
    initCategoryFilters();
    enhanceMicrodata();
    enhanceCardAnimations();
    trackUserInteractions();
    enhanceImageLoading();
    initResponsiveFeatures();
    initPerformanceMonitoring();
});

// Navigation
function initNavigation() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav a');
    const body = document.body;

    if (!burger || !nav) {
        console.warn('Navigation elements not found');
        return;
    }

    const closeNavigation = () => {
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    };

    const toggleNavigation = () => {
        const isExpanded = burger.getAttribute('aria-expanded') === 'true';
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        burger.setAttribute('aria-expanded', !isExpanded);
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    };

    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNavigation();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    closeNavigation();
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, CONSTANTS.CATEGORY_TRANSITION);
                }
            } else {
                closeNavigation();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('active')) {
            closeNavigation();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeNavigation();
            burger.focus();
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported');
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }, index * CONSTANTS.ANIMATION_DELAY);
            }
        });
    }, observerOptions);

    const categoryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                categoryObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    const cards = document.querySelectorAll('.participant-card');
    const categories = document.querySelectorAll('.category');

    cards.forEach(card => cardObserver.observe(card));
    categories.forEach(category => categoryObserver.observe(category));
    
    initParallaxEffect();
}

// Parallax effect
function initParallaxEffect() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    if (floatingElements.length === 0) return;

    const handleScroll = throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        floatingElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            element.style.transform = `translateY(${rate * speed}px) rotate(${rate * 0.1}deg)`;
        });
    }, CONSTANTS.THROTTLE_DELAY);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Accessibility features
function initAccessibilityFeatures() {
    const cards = document.querySelectorAll('.participant-card');
    
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('.learn-more');
                if (link) link.click();
            }
        });
    });

    initDynamicHeadings();
    initHighContrastSupport();
    initTextSizeControl();
}

// Dynamic headings for page title
function initDynamicHeadings() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const heading = entry.target.querySelector('h2');
                if (heading) {
                    document.title = `${heading.textContent} - Будинок Слова`;
                }
            }
        });
    }, { threshold: 0.5 });

    const categories = document.querySelectorAll('.category');
    categories.forEach(category => observer.observe(category));
}

// High contrast mode
function initHighContrastSupport() {
    const contrastToggle = document.createElement('button');
    contrastToggle.innerHTML = '◐';
    contrastToggle.setAttribute('aria-label', 'Увімкнути висококонтрастний режим');
    contrastToggle.classList.add('contrast-toggle');

    const savedContrast = localStorage.getItem('highContrastEnabled') === 'true';
    
    if (savedContrast) {
        document.body.classList.add('high-contrast');
        contrastToggle.setAttribute('aria-label', 'Вимкнути висококонтрастний режим');
    }

    contrastToggle.addEventListener('click', function() {
        const isEnabled = document.body.classList.toggle('high-contrast');
        
        this.setAttribute('aria-label', 
            isEnabled ? 'Вимкнути висококонтрастний режим' : 'Увімкнути висококонтрастний режим'
        );
        
        localStorage.setItem('highContrastEnabled', isEnabled);
    });

    document.body.appendChild(contrastToggle);
}

// Text size control
function initTextSizeControl() {
    const TEXT_SIZE_CLASSES = ['text-size-normal', 'text-size-medium', 'text-size-large'];
    const LABELS = ['Нормальний розмір тексту', 'Середній розмір тексту', 'Великий розмір тексту'];
    const ICONS = ['A', 'A+', 'A++'];
    
    let textSizeLevel = parseInt(localStorage.getItem('textSizeLevel')) || 0;
    
    const textSizeToggle = document.createElement('button');
    textSizeToggle.innerHTML = ICONS[textSizeLevel];
    textSizeToggle.setAttribute('aria-label', LABELS[textSizeLevel]);
    textSizeToggle.classList.add('text-size-toggle');

    const applyTextSize = (level) => {
        document.body.classList.remove(...TEXT_SIZE_CLASSES);
        document.body.classList.add(TEXT_SIZE_CLASSES[level]);
        localStorage.setItem('textSizeLevel', level);
    };

    // Apply saved size
    applyTextSize(textSizeLevel);

    textSizeToggle.addEventListener('click', function() {
        textSizeLevel = (textSizeLevel + 1) % 3;
        applyTextSize(textSizeLevel);
        
        this.innerHTML = ICONS[textSizeLevel];
        this.setAttribute('aria-label', LABELS[textSizeLevel]);
    });

    document.body.appendChild(textSizeToggle);
}

// Interactive elements
function initInteractiveElements() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        const handleScroll = throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            backToTop.classList.toggle('visible', scrollTop > CONSTANTS.SCROLL_THRESHOLD);
        }, CONSTANTS.THROTTLE_DELAY);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    initImageLoading();
    initProgressBar();
}

// Image loading states
function initImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach(img => {
        img.classList.add('loading');
        
        img.addEventListener('load', function() {
            this.classList.remove('loading');
            this.classList.add('loaded');
        }, { once: true });
        
        img.addEventListener('error', function() {
            this.classList.remove('loading');
            this.classList.add('error');
            this.alt = 'Зображення не завантажилося';
        }, { once: true });
    });
}

// Reading progress bar
function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.classList.add('reading-progress');
    document.body.appendChild(progressBar);

    const updateProgress = throttle(() => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = `${scrolled}%`;
    }, CONSTANTS.THROTTLE_DELAY);

    window.addEventListener('scroll', updateProgress, { passive: true });
}

// Category filters
function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.category');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update buttons state
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Filter categories
            categories.forEach(cat => {
                const shouldShow = category === 'all' || cat.dataset.category === category;
                
                if (shouldShow) {
                    cat.style.display = 'block';
                    setTimeout(() => {
                        cat.style.opacity = '1';
                        cat.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    cat.style.opacity = '0';
                    cat.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        cat.style.display = 'none';
                    }, CONSTANTS.CATEGORY_TRANSITION);
                }
            });
            
            // Scroll to first visible category
            if (category !== 'all') {
                const firstVisible = document.querySelector(`.category[data-category="${category}"]`);
                if (firstVisible) {
                    setTimeout(() => {
                        firstVisible.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, CONSTANTS.CATEGORY_TRANSITION + 100);
                }
            }
        });
    });
}

// Enhance microdata
function enhanceMicrodata() {
    const cards = document.querySelectorAll('.participant-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h3')?.textContent;
        const years = card.querySelector('.years')?.textContent;
        const description = card.querySelector('p')?.textContent;
        const link = card.querySelector('a')?.getAttribute('href');
        
        if (!name || !years) return;
        
        const [birthYear, deathYear] = years.match(/\d{4}/g) || ['', ''];
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": name,
            "birthDate": birthYear,
            "deathDate": deathYear,
            "description": description,
            "url": link ? window.location.origin + link : undefined
        });
        
        card.appendChild(script);
    });
}

// Enhanced card animations
function enhanceCardAnimations() {
    const cards = document.querySelectorAll('.participant-card');
    
    cards.forEach((card, index) => {
        card.style.setProperty('--animation-delay', `${index * 0.1}s`);
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// User interaction tracking
function trackUserInteractions() {
    const cards = document.querySelectorAll('.participant-card');
    const filters = document.querySelectorAll('.filter-btn');
    
    const trackEvent = (eventName, label) => {
        console.log(`Event: ${eventName}, Label: ${label}`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': 'engagement',
                'event_label': label
            });
        }
    };
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.querySelector('h3')?.textContent;
            if (name) trackEvent(ANALYTICS_EVENTS.CARD_CLICK, name);
        });
    });
    
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            if (category) trackEvent(ANALYTICS_EVENTS.FILTER_USED, category);
        });
    });
}

// Enhanced image loading
function enhanceImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'img/placeholder.jpg';
            this.alt = 'Зображення не завантажилося';
            this.classList.add('image-error');
        }, { once: true });
        
        img.addEventListener('load', function() {
            this.classList.add('image-loaded');
        }, { once: true });
    });
}

// Responsive features
function initResponsiveFeatures() {
    const handleResize = debounce(() => {
        const filters = document.querySelector('.category-filters');
        const grid = document.querySelector('.participants-grid');
        const width = window.innerWidth;
        
        if (filters) {
            filters.classList.toggle('mobile', width < 768);
        }
        
        if (grid) {
            if (width < 480) {
                grid.style.gridTemplateColumns = '1fr';
            } else if (width < 768) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }
    }, CONSTANTS.DEBOUNCE_DELAY);
    
    window.addEventListener('resize', handleResize);
    handleResize();
}

// Performance monitoring
function initPerformanceMonitoring() {
    window.addEventListener('load', () => {
        if (!window.performance) return;
        
        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return;
        
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        
        console.log(`Page load time: ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('Page load time exceeds 3 seconds');
        }
    });
    
    // Memory monitoring (if available)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1048576);
            console.log(`Memory usage: ${used}MB`);
        }, CONSTANTS.MEMORY_CHECK_INTERVAL);
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Page error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Page load complete
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
    
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page fully loaded in ${pageLoadTime}ms`);
    }
    
    console.log('Participants page fully initialized');
});

// Export for potential external use
window.ParticipantsApp = {
    initCategoryFilters,
    enhanceCardAnimations,
    trackUserInteractions,
    initResponsiveFeatures,
    CONSTANTS
};