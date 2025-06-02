const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const pool = require('../config');

// GET /api/sujets avec filtres
router.get('/', async (req, res) => {
    const {
        annee,
        serie,
        matiere,
        specialite,
        session,
        page = 1,
        limit = 3
    } = req.query;

    const offset = (page - 1) * limit;

    let filters = [];
    let values = [];

    if (annee) {
        filters.push(`annee = $${values.length + 1}`);
        values.push(annee);
    }
    if (serie) {
        filters.push(`serie = $${values.length + 1}`);
        values.push(serie);
    }
    if (matiere) {
        filters.push(`matiere = $${values.length + 1}`);
        values.push(matiere);
    }
    if (specialite) {
        filters.push(`specialite = $${values.length + 1}`);
        values.push(specialite);
    }
    if (session) {
        filters.push(`session = $${values.length + 1}`);
        values.push(session);
    }

    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

    try {
        const result = await pool.query(
            `SELECT * FROM sujets
       ${whereClause}
       ORDER BY annee DESC, matiere
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
            [...values, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM sujets ${whereClause}`,
            values
        );

        res.json({
            sujets: result.rows,
            total: parseInt(countResult.rows[0].count),
        });
    } catch (err) {
        console.error('Erreur lors du chargement des sujets :', err.message);
        res.status(500).send('Erreur serveur');
    }
});


// GET /api/sujets/options
router.get('/options', async (req, res) => {
    try {
        const result = await Promise.all([
            pool.query('SELECT DISTINCT annee FROM sujets ORDER BY annee DESC'),
            pool.query('SELECT DISTINCT serie FROM sujets ORDER BY serie'),
            pool.query('SELECT DISTINCT matiere FROM sujets ORDER BY matiere'),
            pool.query('SELECT DISTINCT specialite FROM sujets ORDER BY specialite'),
            pool.query('SELECT DISTINCT session FROM sujets ORDER BY session')
        ]);

        res.json({
            annees: result[0].rows.map(r => r.annee),
            series: result[1].rows.map(r => r.serie),
            matieres: result[2].rows.map(r => r.matiere),
            specialites: result[3].rows.map(r => r.specialite),
            sessions: result[4].rows.map(r => r.session),
        });
    } catch (err) {
        console.error('Erreur récupération des options :', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// GET sujet par ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM sujets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sujet non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

router.post('/', upload.fields([
    { name: 'fichier_sujet', maxCount: 1 },
    { name: 'fichier_corrige', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            annee, serie, matiere, specialite,
            epreuve, session, num_sujet
        } = req.body;

        const fichier_sujet = req.files?.fichier_sujet?.[0]?.filename || null;
        const fichier_corrige = req.files?.fichier_corrige?.[0]?.filename || null;


        const query = `
      INSERT INTO sujets 
        (annee, serie, matiere, specialite, epreuve, session, num_sujet, fichier_sujet, fichier_corrige)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

        const values = [
            annee, serie, matiere, specialite || null, epreuve, session,
            num_sujet || null, fichier_sujet, fichier_corrige
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({ message: 'Sujet ajouté avec succès.', sujet: rows[0] });

    } catch (error) {
        console.error('Erreur ajout sujet :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// DELETE /api/sujets/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM sujets WHERE id = $1', [id]);
        res.status(200).json({ message: 'Sujet supprimé avec succès.' });
    } catch (err) {
        console.error('Erreur suppression sujet :', err.message);
        res.status(500).send('Erreur serveur');
    }
});

router.put('/:id', upload.fields([
    { name: 'fichier_sujet', maxCount: 1 },
    { name: 'fichier_corrige', maxCount: 1 }
]), async (req, res) => {
    const { id } = req.params;
    const {
        annee, serie, matiere, specialite,
        epreuve, session, num_sujet
    } = req.body;

    const fichier_sujet = req.files?.fichier_sujet?.[0]?.filename;
    const fichier_corrige = req.files?.fichier_corrige?.[0]?.filename;

    const fields = [
        { name: 'annee', value: annee },
        { name: 'serie', value: serie },
        { name: 'matiere', value: matiere },
        { name: 'specialite', value: specialite },
        { name: 'epreuve', value: epreuve },
        { name: 'session', value: session },
        { name: 'num_sujet', value: num_sujet },
        ...(fichier_sujet ? [{ name: 'fichier_sujet', value: fichier_sujet }] : []),
        ...(fichier_corrige ? [{ name: 'fichier_corrige', value: fichier_corrige }] : [])
    ];

    const updates = fields
        .map((f, idx) => `${f.name} = $${idx + 1}`)
        .join(', ');

    const values = fields.map(f => f.value);

    try {
        await pool.query(
            `UPDATE sujets SET ${updates} WHERE id = $${values.length + 1}`,
            [...values, id]
        );
        res.status(200).json({ message: 'Sujet modifié avec succès' });
    } catch (err) {
        console.error('Erreur modification :', err.message);
        res.status(500).send('Erreur serveur');
    }
});


module.exports = router;
