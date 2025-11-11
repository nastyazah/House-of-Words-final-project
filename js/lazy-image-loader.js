// Lazy Image Loading Implementation
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

// Export for use in main
window.LazyImageLoader = LazyImageLoader;