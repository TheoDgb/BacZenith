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
                AND d.en_cours = false
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
        // Récupère la demande (on a besoin de l'élève et du message)
        const { rows: demandeRows } = await pool.query(`
            SELECT * FROM demandes_aide WHERE id = $1
        `, [demandeId]);

        if (demandeRows.length === 0) {
            return res.status(404).json({ error: "Demande non trouvée" });
        }

        const demande = demandeRows[0];
        const eleveId = demande.user_id;

        // Empêcher de s'assigner une demande déjà prise par un autre
        if (demande.tuteur_id && demande.tuteur_id !== tuteurId) {
            return res.status(403).json({ error: "Demande déjà prise par un autre tuteur." });
        }

        // Créer la conversation (si elle n'existe pas déjà entre ces 2)
        const conversationRes = await pool.query(`
            INSERT INTO conversations (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING id
        `, [eleveId, tuteurId]);

        const conversationId = conversationRes.rows[0].id;

        // Envoyer le premier message, depuis l'élève
        await pool.query(`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
        `, [conversationId, eleveId, demande.message]);

        // Mettre à jour la demande
        const update = await pool.query(`
            UPDATE demandes_aide
            SET tuteur_id = $1, en_cours = true, conversation_id = $2
            WHERE id = $3
            RETURNING *
        `, [tuteurId, conversationId, demandeId]);

        res.json({ success: true, demande: update.rows[0] });
    } catch (err) {
        console.error('Erreur lors de l’assignation de la demande :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});



module.exports = router;