const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

router.post('/', auth, authorizeRoles('eleve'), async (req, res) => {
    const userId = req.user.id;
    const { sujet_id, demande_id, contenu = '', partage_avec_tuteur = false } = req.body;

    const sujetId = sujet_id || null;
    const demandeId = demande_id || null;

    if ((sujetId && demandeId) || (!sujetId && !demandeId)) {
        return res.status(400).json({ error: 'Un seul des deux doit être défini' });
    }

    try {
        if (sujetId) {
            const check = await pool.query(`SELECT id FROM sujets WHERE id = $1`, [sujetId]);
            if (check.rowCount === 0) return res.status(404).json({ error: 'Sujet introuvable' });
        }

        if (demandeId) {
            const check = await pool.query(
                `SELECT id FROM demandes_aide WHERE id = $1 AND user_id = $2`,
                [demandeId, userId]
            );
            if (check.rowCount === 0) return res.status(403).json({ error: 'Demande invalide ou non autorisée' });
        }

        if (contenu.trim() === '') {
            const delResult = await pool.query(
                `DELETE FROM notes WHERE user_id = $1 AND sujet_id IS NOT DISTINCT FROM $2 AND demande_id IS NOT DISTINCT FROM $3 RETURNING *`,
                [userId, sujetId, demandeId]
            );

            if (delResult.rowCount === 0) {
                return res.status(404).json({ message: 'Aucune note à supprimer' });
            }

            return res.json({ message: 'Note supprimée' });
        }

        // Sinon, insert ou update
        const result = await pool.query(
            `INSERT INTO notes (user_id, sujet_id, demande_id, contenu, partage_avec_tuteur)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, unique_key)
                 DO UPDATE SET contenu = $4, partage_avec_tuteur = $5, updated_at = NOW()
             RETURNING *`,
            [userId, sujetId, demandeId, contenu, partage_avec_tuteur]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur création/màj note:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer la note d'un utilisateur pour un sujet ou une demande
router.get('/', auth, authorizeRoles('eleve'), async (req, res) => {
    const userId = req.user.id;
    const { sujet_id, demande_id } = req.query;

    if ((!sujet_id && !demande_id) || (sujet_id && demande_id)) {
        return res.status(400).json({
            error: 'Il faut fournir soit sujet_id soit demande_id, mais pas les deux.',
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM notes WHERE user_id = $1 AND
                ${sujet_id ? 'sujet_id = $2' : 'demande_id = $2'}`,
            [userId, sujet_id || demande_id]
        );

        res.json(result.rows[0] || null);
    } catch (err) {
        console.error('Erreur récupération note:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;