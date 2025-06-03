const express = require('express');
const cors = require('cors');
const pool = require('./config');
const sujetsRoutes = require('./routes/sujets');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // autorise les requêtes depuis le frontend
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sujets', sujetsRoutes);

// Test de serveur
app.get('/', (req, res) => {
    res.send('Bienvenue sur le backend de BacZenith !');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (error) {
        console.error('Erreur DB :', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});
