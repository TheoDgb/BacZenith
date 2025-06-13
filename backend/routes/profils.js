const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config');

// Changer l'email
router.put('/:id/email', async (req, res) => {
    const { id } = req.params;
    const { oldEmail, newEmail } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = rows[0];

        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
        if (user.email !== oldEmail) return res.status(400).json({ error: 'Ancien email incorrect' });

        await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, id]);
        res.json({ message: 'Email mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur (email)' });
    }
});

// Changer le mot de passe
router.put('/:id/password', async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = rows[0];

        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Ancien mot de passe incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
        res.json({ message: 'Mot de passe mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur (mdp)' });
    }
});

module.exports = router;
