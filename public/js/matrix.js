class MatrixEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        this.charSize = 16;
        this.drops = [];
        this.neonPink = '#FF69B4';
        this.darkPink = '#FF1493';
        this.running = false;

        this.init();
        window.addEventListener('resize', () => this.init());
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const columns = Math.floor(this.canvas.width / this.charSize);
        this.drops = new Array(columns).fill(1);
    }

    draw() {
        if (!this.running) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.charSize}px monospace`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = this.darkPink;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.charSize;
            const y = this.drops[i] * this.charSize;

            if (this.drops[i] * this.charSize < 50) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.neonPink;
            } else {
                this.ctx.fillStyle = this.neonPink;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = this.darkPink;
            }

            this.ctx.fillText(text, x, y);

            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            this.drops[i]++;
        }

        requestAnimationFrame(() => this.draw());
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.draw();
        }
    }

    stop() {
        this.running = false;
    }
}

// Inicializar el efecto Matrix cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix-bg');
    const matrixEffect = new MatrixEffect(canvas);
    matrixEffect.start();
});