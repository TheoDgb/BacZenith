const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET /api/messages/conversations
// Récupérer toutes les conversations de l’utilisateur connecté
router.get('/conversations', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const { rows } = await pool.query(`
            SELECT c.id, u1.id AS user1_id, u1.nom AS user1_nom, u2.id AS user2_id, u2.nom AS user2_nom
            FROM conversations c
            JOIN users u1 ON u1.id = c.user1_id
            JOIN users u2 ON u2.id = c.user2_id
            WHERE c.user1_id = $1 OR c.user2_id = $1
            ORDER BY c.created_at DESC
        `, [userId]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération des conversations");
    }
});

// GET /api/messages/conversations/:id/messages
// Récupérer les messages d’une conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
    const userId = req.user.id;
    const conversationId = req.params.id;

    try {
        // Vérifier que l'utilisateur fait partie de la conversation
        const validConv = await pool.query(`
            SELECT * FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
        `, [conversationId, userId]);

        if (validConv.rows.length === 0) {
            return res.status(403).json({ error: "Accès interdit à cette conversation" });
        }

        // Récupérer les messages
        const { rows } = await pool.query(`
            SELECT m.*, u.nom, u.prenom
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = $1
            ORDER BY m.sent_at ASC
        `, [conversationId]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération des messages");
    }
});

// POST /api/messages/conversations/:id/messages
// Envoyer un message
router.post('/conversations/:id/messages', auth, async (req, res) => {
    const senderId = req.user.id;
    const conversationId = req.params.id;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Message vide' });

    try {
        // Vérifier que l'utilisateur fait partie de la conversation
        const validConv = await pool.query(`
            SELECT * FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
        `, [conversationId, senderId]);

        if (validConv.rows.length === 0) {
            return res.status(403).json({ error: "Accès interdit à cette conversation" });
        }

        // Envoyer le message
        const { rows } = await pool.query(`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [conversationId, senderId, content]);

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de l'envoi du message");
    }
});

// POST /api/messages/conversations
// Crée une conversation entre deux utilisateurs (ou retourne l'existante)
router.post('/conversations', auth, async (req, res) => {
    const user1_id = req.user.id;
    const { user2_id } = req.body;

    if (!user2_id) {
        return res.status(400).json({ error: "user2_id est requis" });
    }

    if (user1_id === user2_id) {
        return res.status(400).json({ error: "Impossible de démarrer une conversation avec soi-même" });
    }

    try {
        // Vérifie si une conversation existe déjà
        const existing = await pool.query(`
            SELECT * FROM conversations
            WHERE (user1_id = $1 AND user2_id = $2)
               OR (user1_id = $2 AND user2_id = $1)
        `, [user1_id, user2_id]);

        if (existing.rows.length > 0) {
            return res.status(200).json(existing.rows[0]);
        }

        // Sinon, créer une nouvelle conversation
        const { rows } = await pool.query(`
            INSERT INTO conversations (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING *
        `, [user1_id, user2_id]);

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la création de la conversation");
    }
});

module.exports = router;