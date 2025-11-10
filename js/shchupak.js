(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.principle-item', '.editing-stat']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Shchupak page initialized');

        trackTimeOnPage();
        enhanceEditingStats();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Shchupak page: ${timeSpent} seconds`);
            
            // Можна додати відправку даних в аналітику
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_spent', {
                    'event_category': 'engagement',
                    'event_label': 'Shchupak Page',
                    'value': timeSpent
                });
            }
        });
    }

    function enhanceEditingStats() {
        const stats = document.querySelectorAll('.editing-stat');
        
        stats.forEach((stat, index) => {
            stat.style.setProperty('--animation-delay', `${index * 0.1}s`);
        });
    }

})();