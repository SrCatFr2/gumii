class CyberLogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = canvas.width;
        this.angle = 0;
        this.running = false;
    }

    drawSamuraiBear() {
        const ctx = this.ctx;
        const center = this.size / 2;
        const size = this.size * 0.8;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(this.angle);
        ctx.translate(-center, -center);

        // Cabeza del osito
        ctx.beginPath();
        ctx.fillStyle = '#FFB6C1';
        ctx.arc(center, center, size/3, 0, Math.PI * 2);
        ctx.fill();

        // Orejas
        ctx.beginPath();
        ctx.fillStyle = '#FF69B4';
        ctx.arc(center - size/4, center - size/4, size/6, 0, Math.PI * 2);
        ctx.arc(center + size/4, center - size/4, size/6, 0, Math.PI * 2);
        ctx.fill();

        // Ojos kawaii
        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.arc(center - size/8, center - size/12, size/12, 0, Math.PI * 2);
        ctx.arc(center + size/8, center - size/12, size/12, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.beginPath();
        ctx.fillStyle = '#FFF';
        ctx.arc(center - size/8 + 3, center - size/12 - 3, size/30, 0, Math.PI * 2);
        ctx.arc(center + size/8 + 3, center - size/12 - 3, size/30, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.beginPath();
        ctx.fillStyle = '#FF1493';
        ctx.arc(center, center + size/12, size/20, 0, Math.PI * 2);
        ctx.fill();

        // Casco samurai
        this.drawSamuraiHelmet(ctx, center, size);

        // Katana
        this.drawKatana(ctx, center, size);

        ctx.restore();
    }

    drawSamuraiHelmet(ctx, center, size) {
        ctx.beginPath();
        ctx.fillStyle = '#303030';
        ctx.moveTo(center - size/2, center - size/4);
        ctx.quadraticCurveTo(center, center - size/2, center + size/2, center - size/4);
        ctx.lineTo(center + size/2.2, center);
        ctx.lineTo(center - size/2.2, center);
        ctx.fill();

        // Detalles del casco
        ctx.beginPath();
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 3;
        ctx.moveTo(center - size/2.5, center - size/3.5);
        ctx.lineTo(center + size/2.5, center - size/3.5);
        ctx.stroke();
    }

    drawKatana(ctx, center, size) {
        // Hoja
        ctx.beginPath();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 4;
        ctx.moveTo(center + size/2, center);
        ctx.lineTo(center + size/1.2, center + size/4);
        ctx.stroke();

        // Empuñadura
        ctx.beginPath();
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(center + size/2.2, center - size/20, size/6, size/10);
    }

    animate() {
        this.running = true;
        this.draw();
    }

    draw() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Efecto de brillo
        this.ctx.shadowColor = '#FF69B4';
        this.ctx.shadowBlur = 20;
        
        this.drawSamuraiBear();
        
        // Animación suave
        this.angle += 0.02;
        if (this.angle > Math.PI * 2) {
            this.angle = 0;
        }

        requestAnimationFrame(() => this.draw());
    }

    stop() {
        this.running = false;
    }
}