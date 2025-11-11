(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.principle-item', '.modernism-list li']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Khvylovy page initialized');

        trackTimeOnPage();
        initModernismAnimation();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Khvylovy page: ${timeSpent} seconds`);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.storage.set('khvylovy_time_spent', timeSpent);
            }
        });
    }

    function initModernismAnimation() {
        const principles = document.querySelectorAll('.principle-item');
        
        if (principles.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        principles.forEach(principle => {
            principle.style.opacity = '0';
            principle.style.transform = 'translateY(30px)';
            principle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(principle);
        });
    }

})();