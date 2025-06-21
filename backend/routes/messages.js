const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

// VERIFIER USERS

// GET /api/messages/conversations
// Récupérer toutes les conversations de l’utilisateur connecté
router.get('/conversations', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const { rows } = await pool.query(`
            SELECT c.id,
                u1.id AS user1_id, u1.nom AS user1_nom, u1.prenom AS user1_prenom,
                u2.id AS user2_id, u2.nom AS user2_nom, u2.prenom AS user2_prenom,
                (
                    SELECT COUNT(*) FROM messages m
                    WHERE m.conversation_id = c.id
                        AND m.sender_id <> $1
                        AND m.id NOT IN (
                            SELECT message_id FROM message_reads WHERE user_id = $1
                        )
                ) AS unread_count
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

// POST /api/messages/conversations/:id/mark_read
router.post('/conversations/:conversationId/mark_read', auth, async (req, res) => {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;

    try {
        await pool.query(`
          INSERT INTO message_reads (message_id, user_id)
          SELECT id, $1 FROM messages
          WHERE conversation_id = $2
            AND id NOT IN (
              SELECT message_id FROM message_reads WHERE user_id = $1
            )
            AND sender_id <> $1
        `, [userId, conversationId]);

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la mise à jour des messages lus" });
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
        const { rows: messages } = await pool.query(`
            SELECT m.*, u.nom, u.prenom
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = $1
            ORDER BY m.sent_at ASC
        `, [conversationId]);

        // Récupérer le sujet lié s'il existe
        const { rows: sujetRows } = await pool.query(`
            SELECT s.id, s.annee, s.serie, s.matiere, s.specialite, s.epreuve, s.session, s.num_sujet
            FROM demandes_aide da
            JOIN sujets s ON da.sujet_id = s.id
            WHERE da.conversation_id = $1
            LIMIT 1
        `, [conversationId]);

        res.json({
            messages,
            sujet: sujetRows[0] || null
        });
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

        const io = req.app.get('io');

        // Obtenir les IDs des deux participants
        const conv = validConv.rows[0];
        const recipientId = (senderId === conv.user1_id) ? conv.user2_id : conv.user1_id;

        // Émettre vers la room de la conversation (si elle est ouverte activement)
        io.to(`conversation_${conversationId}`).emit('new_message', rows[0]);

        // Émettre vers la room de l'utilisateur (notification globale)
        io.to(`user_${recipientId}`).emit('new_message', rows[0]);

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