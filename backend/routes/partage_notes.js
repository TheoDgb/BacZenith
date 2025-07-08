const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

async function verifyUserInConversation(req, res, next) {
    const { id } = req.params; // id conversation
    const userId = req.user.id;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ error: 'Conversation non trouvée' });

    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    req.conversation = conversation;
    next();
}

module.exports = router;