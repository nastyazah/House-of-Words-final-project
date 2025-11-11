(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.principle-item']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Semenko page initialized');

        trackTimeOnPage();
        initFuturismPrinciples();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Semenko page: ${timeSpent} seconds`);
            
            if (typeof CommonModule !== 'undefined') {
                CommonModule.storage.set('semenko_time_spent', timeSpent);
            }
        });
    }

    function initFuturismPrinciples() {
        const principles = document.querySelectorAll('.principle-item');
        
        if (principles.length === 0) return;
        console.log('Futurism principles initialized');
    }

})();