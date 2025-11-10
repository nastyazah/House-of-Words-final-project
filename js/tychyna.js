(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof CommonModule !== 'undefined') {
            CommonModule.init({
                performanceMonitoring: true,
                animationSelectors: ['.stage-item', '.legacy-stat']
            });
        } else {
            console.error('CommonModule not loaded');
        }

        initPageSpecific();
    });

    function initPageSpecific() {
        console.log('Tychyna page initialized');

        trackTimeOnPage();
        enhanceEvolutionStages();
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time spent on Tychyna page: ${timeSpent} seconds`);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_spent', {
                    'event_category': 'engagement',
                    'event_label': 'Tychyna Page',
                    'value': timeSpent
                });
            }
        });
    }

    function enhanceEvolutionStages() {
        const stages = document.querySelectorAll('.stage-item');
        
        stages.forEach((stage, index) => {
            stage.style.setProperty('--animation-delay', `${index * 0.2}s`);
            
            stage.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            stage.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    function animateLegacyStats() {
        const stats = document.querySelectorAll('.legacy-stat');
        let delay = 0;
        
        stats.forEach(stat => {
            setTimeout(() => {
                stat.classList.add('animated');
            }, delay);
            delay += 200;
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(animateLegacyStats, 1000);
    });

})();