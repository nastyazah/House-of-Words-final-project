(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.principle-item', '.legacy-stat']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Koryak page initialized');

        trackTimeOnPage();
        initLegacyStats();
        initPrinciplesAnimation();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Koryak page: ${timeSpent} seconds`);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.storage.set('koryak_time_spent', timeSpent);
            }
        });
    }

    function initLegacyStats() {
        const stats = document.querySelectorAll('.legacy-stat');
        
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
        } else {
            // For single numbers like "3"
            const finalNumber = parseInt(text);
            if (!isNaN(finalNumber)) {
                let currentNumber = 0;
                const duration = 1000;
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
        }
    }

    function initPrinciplesAnimation() {
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