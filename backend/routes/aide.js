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
    const { type_aide, order = 'desc', matiere } = req.query;
    const userId = req.user.id;

    try {
        const matieresResult = await pool.query(
            'SELECT matiere FROM tuteur_matieres WHERE tuteur_id = $1',
            [userId]
        );
        const matieres = matieresResult.rows.map(r => r.matiere);

        // Si une matière spécifique est demandée, on filtre uniquement dessus (si elle fait partie des matières autorisées)
        const selectedMatieres = matiere && matieres.includes(matiere) ? [matiere] : matieres;

        const demandes = await pool.query(
            `SELECT d.*, u.nom, u.prenom, s.annee, s.serie, s.epreuve, s.session, s.num_sujet
             FROM demandes_aide d
             JOIN users u ON d.user_id = u.id
             LEFT JOIN sujets s ON d.sujet_id = s.id
             WHERE d.matiere = ANY($1) AND d.type_aide = $2
             ORDER BY d.created_at ${order.toUpperCase()}`,
            [selectedMatieres, type_aide]
        );

        res.json(demandes.rows);
    } catch (err) {
        console.error('Erreur chargement demandes aide :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});



module.exports = router;