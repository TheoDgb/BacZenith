const express = require('express');
const cors = require('cors');
const pool = require('./config');
const candidaturesRoutes = require('./routes/candidatures');
const authRoutes = require('./routes/auth');
const sujetsRoutes = require('./routes/sujets');
require('dotenv').config();
const sendMail = require('./utils/sendMail');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // autorise les requêtes depuis le frontend
app.use(express.json());

// Routes
app.use('/api/candidatures', candidaturesRoutes);
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

// curl -X POST http://localhost:5000/test-mail
app.post('/test-mail', async (req, res) => {
    try {
        await sendMail({
            to: 'candidat@email.com',
            subject: 'Test de mail',
            html: '<p>Bienvenue chez BacZénith !</p>'
        });
        res.json({ message: 'Mail envoyé !' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur envoi mail' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});
