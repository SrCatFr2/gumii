document.addEventListener('DOMContentLoaded', () => {
    // Logo animado mejorado
    const canvas = document.getElementById('logo-canvas');
    const ctx = canvas.getContext('2d');

    function drawLogo() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradiente para el fondo
        const gradient = ctx.createRadialGradient(60, 60, 0, 60, 60, 60);
        gradient.addColorStop(0, '#FF69B4');
        gradient.addColorStop(1, '#7B68EE');

        // Círculo base
        ctx.beginPath();
        ctx.arc(60, 60, 40, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Orejas kawaii
        function drawEar(x, y, rotation) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(15, -20, 30, 0);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(8, -5);
            ctx.quadraticCurveTo(15, -15, 22, -5);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            ctx.restore();
        }

        drawEar(40, 45, -0.3);
        drawEar(80, 45, 0.3);

        // Ojos kawaii
        function drawEye(x, y) {
            // Blanco del ojo
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();

            // Brillo
            ctx.beginPath();
            ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();

            // Pupila
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        }

        drawEye(45, 65);
        drawEye(75, 65);

        // Boca kawaii
        ctx.beginPath();
        ctx.arc(60, 80, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Función para animar el logo
    function animateLogo() {
        anime({
            targets: '#logo-canvas',
            rotate: [
                { value: '10deg', duration: 1000, easing: 'easeInOutQuad' },
                { value: '-10deg', duration: 1000, easing: 'easeInOutQuad' }
            ],
            scale: [
                { value: 1.1, duration: 500, easing: 'easeInOutQuad' },
                { value: 1, duration: 500, easing: 'easeInOutQuad' }
            ],
            loop: true,
            direction: 'alternate'
        });
    }

    drawLogo();
    animateLogo();

    // Variables globales
    let isChecking = false;
    let remainingCards = [];
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');

    // Función para procesar una tarjeta
    async function processCard(card) {
        try {
            const [cc, month, year, cvv] = card.split('|');
            const requestData = {
                cc: cc.trim(),
                month: month.trim(),
                year: year.trim(),
                cvv: cvv.trim()
            };

            console.log('🌸 REQUEST:', requestData);

            const response = await fetch('/check-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('🎴 RESPONSE:', result);

            return result;
        } catch (error) {
            console.error('❌ ERROR:', error);
            return {
                success: false,
                status: 'ERROR',
                message: error.message,
                time: '0.0',
                icon: '❌'
            };
        }
    }

    // Función para actualizar resultados
    function updateResults(results) {
        document.querySelectorAll('.counter').forEach((counter, index) => {
            const count = [results.lives.length, results.deads.length, results.errors.length][index];
            anime({
                targets: counter,
                innerHTML: [parseInt(counter.innerHTML), count],
                round: 1,
                duration: 500,
                easing: 'easeInOutQuad'
            });
        });

        ['lives', 'deads', 'errors'].forEach((type, index) => {
            const container = document.getElementById(`${type}-list`);
            container.innerHTML = results[type].map(item => `
                <div class="card-result" style="opacity: 0">
                    <div style="font-size: 0.9em; margin-bottom: 5px">
                        ${item.card}
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.8">
                        ${item.result.status} ⏱ ${item.result.time}s
                    </div>
                </div>
            `).join('');

            // Animar entrada de nuevos resultados
            anime({
                targets: `#${type}-list .card-result`,
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(100)
            });
        });
    }

    // Función principal de procesamiento
    async function startProcessing() {
        const results = {
            lives: [],
            deads: [],
            errors: []
        };

        while (remainingCards.length > 0 && isChecking) {
            const card = remainingCards.shift();

            // Actualizar contador con animación
            anime({
                targets: '#remaining-count',
                innerHTML: [parseInt(document.getElementById('remaining-count').innerHTML), remainingCards.length],
                round: 1,
                duration: 500,
                easing: 'easeInOutQuad'
            });

            const result = await processCard(card);

            if (result.success) {
                results.lives.push({ card, result });
            } else if (result.status === 'ERROR') {
                results.errors.push({ card, result });
            } else {
                results.deads.push({ card, result });
            }

            updateResults(results);

            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (remainingCards.length === 0) {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            isChecking = false;
        }
    }

    // Eventos de botones
    startBtn.addEventListener('click', () => {
        const input = document.getElementById('cards-input').value;
        remainingCards = input.split('\n').filter(card => card.trim());

        if (remainingCards.length > 20) {
            alert('最大20枚のカードまで！ (Máximo 20 tarjetas)');
            return;
        }

        if (remainingCards.length === 0) {
            alert('カードを入力してください！ (Ingresa al menos una tarjeta)');
            return;
        }

        document.getElementById('remaining-count').textContent = remainingCards.length;
        isChecking = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        startProcessing();
    });

    stopBtn.addEventListener('click', () => {
        isChecking = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
});