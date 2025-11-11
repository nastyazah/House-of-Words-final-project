// Optimized Particle System
class ParticleSystem {
    constructor() {
        if (isReducedMotion) return;

        this.numberOfParticles = window.innerWidth < 768 ? 15 : 30;
        this.canvas = null;
        this.ctx = null;
        this.particlesArray = [];
        this.animationFrameId = null;
        this.isActive = false;

        this.init();
    }

    init() {
        if (window.innerWidth < 768 && !this.isHighPerformanceDevice()) {
            return;
        }

        this.createCanvas();
        this.initParticles();
        this.animate();

        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
        window.addEventListener('unload', () => this.cleanup());
    }

    isHighPerformanceDevice() {
        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        if (memory !== undefined) {
            return memory >= 4 && cores >= 4;
        } else {
            return cores >= 4;
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.15;
        `;
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
    }

    setCanvasSize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        this.setCanvasSize();
        this.initParticles();
    }

    initParticles() {
        this.particlesArray = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particlesArray.push(new Particle(this.canvas));
        }
    }

    animate() {
        if (!this.ctx || !this.canvas || document.hidden) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particlesArray.forEach(particle => {
            particle.update(this.canvas);
            particle.draw(this.ctx);
        });
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = ['#E63946', '#D4A574', '#FFFFFF'][Math.floor(Math.random() * 3)];
    }

    update(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Export
window.ParticleSystem = ParticleSystem;
window.Particle = Particle;