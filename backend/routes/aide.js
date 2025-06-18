const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

// Envoyer une demande d'aide
router.post('/demandes', auth, authorizeRoles('eleve'), async (req, res) => {
    const { type_aide, sujet_id, matiere, tuteur_id, contact_type, message } = req.body;
    const userId = req.user.id;

    try {
        await pool.query(
            `INSERT INTO demandes_aide 
            (user_id, type_aide, sujet_id, matiere, tuteur_id, contact_type, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, type_aide, sujet_id, matiere, tuteur_id, contact_type, message]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Voir les demandes d'aide
router.get('/demandes', auth, authorizeRoles('tuteur'), async (req, res) => {
    const { affectation = 'me', type_aide, matiere, order = 'desc' } = req.query;
    const userId = req.user.id;

    try {
        const matieresResult = await pool.query(
            'SELECT matiere FROM tuteur_matieres WHERE tuteur_id = $1',
            [userId]
        );
        const matieres = matieresResult.rows.map(r => r.matiere);
        const selectedMatieres = matiere && matieres.includes(matiere) ? [matiere] : matieres;

        let affectationClause = '';
        const values = [selectedMatieres, type_aide];
        let i = 3;

        if (affectation === 'me') {
            affectationClause = `AND d.tuteur_id = $${i++}`;
            values.push(userId);
        } else if (affectation === 'none') {
            affectationClause = `AND d.tuteur_id IS NULL`;
        }

        const orderSQL = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const query = `
            SELECT d.*, u.nom, u.prenom, s.annee, s.serie, s.epreuve, s.session, s.num_sujet
            FROM demandes_aide d
            JOIN users u ON d.user_id = u.id
            LEFT JOIN sujets s ON d.sujet_id = s.id
            WHERE d.matiere = ANY($1)
                AND d.type_aide = $2
                ${affectationClause}
            ORDER BY d.created_at ${orderSQL}
        `;

        const demandes = await pool.query(query, values);

        res.json(demandes.rows);
    } catch (err) {
        console.error('Erreur chargement demandes aide :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Prendre en charge une demande
router.post('/demandes/:id/prendre', auth, authorizeRoles('tuteur'), async (req, res) => {
    const demandeId = req.params.id;
    const tuteurId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE demandes_aide
             SET tuteur_id = $1, en_cours = true
             WHERE id = $2 AND (tuteur_id IS NULL OR tuteur_id = $1)
             RETURNING *`,
            [tuteurId, demandeId]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ error: "Demande déjà prise ou inexistante." });
        }

        res.json({ success: true, demande: result.rows[0] });
    } catch (err) {
        console.error('Erreur lors de l’assignation de la demande :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});



module.exports = router;