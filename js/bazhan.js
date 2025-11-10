(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.translation-stat', '.principle-item']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Bazhan page initialized');

        trackTimeOnPage();
        initTranslationStats();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Bazhan page: ${timeSpent} seconds`);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.storage.set('bazhan_time_spent', timeSpent);
            }
        });
    }

    function initTranslationStats() {
        const stats = document.querySelectorAll('.translation-stat');
        
        if (stats.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateStat(statElement) {
        const numberElement = statElement.querySelector('.stat-number');
        if (!numberElement) return;

        const finalNumber = parseInt(numberElement.textContent);
        if (isNaN(finalNumber)) return;

        let currentNumber = 0;
        const duration = 2000;
        const increment = finalNumber / (duration / 16);
        
        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(timer);
            }
            numberElement.textContent = Math.floor(currentNumber);
        }, 16);
    }

})();