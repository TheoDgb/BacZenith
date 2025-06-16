const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

function checkOwnershipOrAdmin(req, res, next) {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id, 10)) {
        return res.status(403).json({ error: 'Accès refusé : modification non autorisée' });
    }
    next();
}

// Changer l'email
router.put('/:id/email', auth, authorizeRoles('eleve', 'tuteur', 'admin'), checkOwnershipOrAdmin, async (req, res) => {
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
router.put('/:id/password', auth, authorizeRoles('eleve', 'tuteur', 'admin'), checkOwnershipOrAdmin, async (req, res) => {
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

// Infos tuteur
router.get('/:id/tuteur', auth, authorizeRoles('tuteur', 'admin'), checkOwnershipOrAdmin, async (req, res) => {
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

// Mettre à jour le profil tuteur
router.put('/:id/tuteur', auth, authorizeRoles('tuteur', 'admin'), checkOwnershipOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { description, disponibilites, tarif } = req.body;

    const client = await pool.connect();
    try {
        // Vérifier que le tuteur est certifié pour modifier son tarif
        const { rows: [profil] } = await pool.query(
            'SELECT is_certified FROM tuteur_profils WHERE user_id = $1',
            [id]
        );
        if (!profil) {
            return res.status(404).json({ error: 'Profil tuteur introuvable' });
        }
        const tarifFinal = (!tarif || tarif.trim() === '')
            ? 'Service gratuit'
            : (profil.is_certified ? tarif : 'Service gratuit');

        await client.query('BEGIN');

        // Update tuteur_profils
        await client.query(
            `UPDATE tuteur_profils
             SET description = $1,
                 disponibilites = $2,
                 tarif = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4`,
            [description, disponibilites, tarifFinal, id]
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

// Liste des tuteurs filtrés par matière et nom/prénom
router.get('/tuteurs', auth, authorizeRoles('eleve', 'admin'), async (req, res) => {
    const { matiere, nom = '', page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const baseQuery = `
            FROM users u
            JOIN tuteur_profils tp ON tp.user_id = u.id
            JOIN tuteur_matieres tm ON tm.tuteur_id = u.id
            WHERE LOWER(CONCAT(u.nom, ' ', u.prenom)) LIKE $1
              AND tm.matiere = $2
        `;

        const countRes = await pool.query(
            `SELECT COUNT(*) ${baseQuery}`,
            [`%${nom.toLowerCase()}%`, matiere]
        );
        const total = parseInt(countRes.rows[0].count, 10);

        const dataRes = await pool.query(
            `SELECT u.id, u.nom, u.prenom, tp.description, tp.tarif, tp.disponibilites
             ${baseQuery}
             ORDER BY u.nom ASC
             LIMIT $3 OFFSET $4`,
            [`%${nom.toLowerCase()}%`, matiere, limit, offset]
        );

        res.json({
            total,
            tuteurs: dataRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur chargement des tuteurs' });
    }
});



module.exports = router;
