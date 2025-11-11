(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.theater-stat']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Kulish page initialized');

        trackTimeOnPage();
        initTheaterStats();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Kulish page: ${timeSpent} seconds`);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.storage.set('kulish_time_spent', timeSpent);
            }
        });
    }

    function initTheaterStats() {
        const stats = document.querySelectorAll('.theater-stat');
        
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

        const text = numberElement.textContent;
        if (text.includes('+')) {
            const baseNumber = parseInt(text);
            if (!isNaN(baseNumber)) {
                let currentNumber = 0;
                const duration = 1500;
                const increment = baseNumber / (duration / 16);
                
                const timer = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= baseNumber) {
                        currentNumber = baseNumber;
                        clearInterval(timer);
                        numberElement.textContent = baseNumber + '+';
                    } else {
                        numberElement.textContent = Math.floor(currentNumber);
                    }
                }, 16);
            }
        }
    }

})();