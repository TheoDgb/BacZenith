const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

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



module.exports = router;