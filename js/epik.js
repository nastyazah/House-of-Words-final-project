
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Epik page initialized');

        trackTimeOnPage();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Epik page: ${timeSpent} seconds`);
        });
    }

})();