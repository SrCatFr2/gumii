const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const CardChecker = require('./modules/stripe');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta principal para el checker
app.post('/check-card', async (req, res) => {
    try {
        const checker = new CardChecker();
        const result = await checker.check(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'ERROR',
            message: error.message,
            time: '0.0',
            icon: '❌'
        });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});