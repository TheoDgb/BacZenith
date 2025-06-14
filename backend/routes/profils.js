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

// Infos tuteur (description, disponibilites, tarif, matieres)
router.get('/:id/tuteur', async (req, res) => {
    const { id } = req.params;

    try {
        const { rows: profils } = await pool.query(
            'SELECT * FROM tuteur_profils WHERE user_id = $1',
            [id]
        );
        const profil = profils[0];
        if (!profil) return res.status(404).json({ error: 'Profil tuteur introuvable' });

        const { rows: matieres } = await pool.query(
            'SELECT matiere FROM tuteur_matieres WHERE tuteur_id = $1',
            [id]
        );

        res.json({
            ...profil,
            matieres: matieres.map(m => m.matiere)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur (get profil tuteur)' });
    }
});

// Mettre à jour le profil tuteur (description, disponibilites, tarif, matieres)
router.put('/:id/tuteur', async (req, res) => {
    const { id } = req.params;
    const { description, disponibilites, tarif } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update tuteur_profils
        await client.query(
            `UPDATE tuteur_profils
             SET description = $1,
                 disponibilites = $2,
                 tarif = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4`,
            [description, disponibilites, tarif || null, id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Profil tuteur mis à jour' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur (update profil tuteur)' });
    } finally {
        client.release();
    }
});



module.exports = router;
