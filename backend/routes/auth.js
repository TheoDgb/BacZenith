const express = require('express');
const router = express.Router();
const pool = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post('/register', async (req, res) => {
    const { email, password, nom, prenom } = req.body;
    if (!email || !password || !nom || !prenom) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    try {
        // vérifier si utilisateur existe
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(409).json({ error: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password, nom, prenom, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, nom, prenom, 'eleve']
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Mot de passe incorrect' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur (login)' });
    }
});

// ME (profil utilisateur)
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { rows } = await pool.query('SELECT id, email, role, nom, prenom FROM users WHERE id = $1', [decoded.id]);
        res.json(rows[0]);
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide' });
    }
});

module.exports = router;
