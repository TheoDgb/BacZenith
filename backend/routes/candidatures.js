const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempId = req.body.tempId;
        if (!tempId) return cb(new Error("tempId manquant"));

        const dir = path.join(__dirname, '../uploads/tmp', tempId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
const uploadFields = upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'diplome', maxCount: 5 },
    { name: 'certificats', maxCount: 5 } // max 5 certificats
]);

router.post('/', uploadFields, async (req, res) => {
    const { nom, prenom, email, motivation } = req.body;
    let matieres = req.body.matieres || req.body['matieres[]'];
    if (!matieres) {
        return res.status(400).json({ error: "Le champ 'matieres' est obligatoire." });
    }
    if (!Array.isArray(matieres)) {
        matieres = [matieres];
    }
    console.log("req.body:", req.body);

    if (matieres.length === 0) {
        return res.status(400).json({ error: "Le champ 'Matières' ne peut pas être vide." });
    }

    try {
        const result = await pool.query(`
            INSERT INTO candidatures (nom, prenom, email, motivation)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, [nom, prenom, email, motivation]);

        const candidatureId = result.rows[0].id;

        const tempId = req.body.tempId;
        const tempDir = path.join(__dirname, '../uploads/tmp', tempId);
        const finalDir = path.join(__dirname, '../uploads/candidatures', candidatureId.toString());

        await fsp.mkdir(finalDir, { recursive: true });

        const moveFileToSubfolder = async (file, candidatureId, subfolder) => {
            const baseDir = path.join(__dirname, '../uploads/candidatures', candidatureId.toString(), subfolder);
            await fsp.mkdir(baseDir, { recursive: true });
            const newPath = path.join(baseDir, file.filename);
            await fsp.rename(file.path, newPath);
            return path.join(subfolder, file.filename); // on garde le chemin relatif (utile si affichage ensuite)
        };


        // Insérer matières
        for (const matiere of matieres) {
            await pool.query(`
                INSERT INTO candidature_matieres (candidature_id, matiere)
                VALUES ($1, $2)
            `, [candidatureId, matiere]);
        }

        // Insérer fichiers
        const files = req.files;

        if (files.cv) {
            const filename = await moveFileToSubfolder(files.cv[0], candidatureId, 'cv');
            await pool.query(`
                INSERT INTO documents_candidats (candidature_id, type_doc, filename)
                VALUES ($1, 'cv', $2)
            `, [candidatureId, filename]);
        }

        if (files.diplome) {
            for (const file of files.diplome) {
                const filename = await moveFileToSubfolder(file, candidatureId, 'diplome');
                await pool.query(`
                    INSERT INTO documents_candidats (candidature_id, type_doc, filename)
                    VALUES ($1, 'diplome', $2)
                `, [candidatureId, filename]);
            }
        }

        if (files.certificats) {
            for (const file of files.certificats) {
                const filename = await moveFileToSubfolder(file, candidatureId, 'certificats');
                await pool.query(`
                    INSERT INTO documents_candidats (candidature_id, type_doc, filename)
                    VALUES ($1, 'certificats', $2)
                `, [candidatureId, filename]);
            }
        }

        res.json({ message: "Candidature reçue" });
        await fsp.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get('/all', auth, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.id, c.nom, c.prenom, c.email, c.motivation,

                (SELECT array_agg(matiere)
                 FROM candidature_matieres cm
                 WHERE cm.candidature_id = c.id) AS matieres,

                (SELECT json_agg(json_build_object('type', dc.type_doc, 'filename', dc.filename))
                 FROM documents_candidats dc
                 WHERE dc.candidature_id = c.id) AS documents

            FROM candidatures c
            ORDER BY c.id DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail'); // crée ce module avec nodemailer

router.post('/:id/accepter', auth, authorizeRoles('admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        const id = req.params.id;

        // Récupérer la candidature
        const { rows } = await pool.query('SELECT * FROM candidatures WHERE id = $1', [id]);
        const candidat = rows[0];
        if (!candidat) return res.status(404).json({ error: 'Candidature non trouvée' });

        // Générer mot de passe
        const plainPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Créer le compte tuteur
        await pool.query(
            `INSERT INTO users (nom, prenom, email, password, role)
             VALUES ($1, $2, $3, $4, 'tuteur')`,
            [candidat.nom, candidat.prenom, candidat.email, hashedPassword]
        );

        // Supprimer les lignes liées
        await pool.query('DELETE FROM documents_candidats WHERE candidature_id = $1', [id]);
        await pool.query('DELETE FROM candidature_matieres WHERE candidature_id = $1', [id]);
        await pool.query('DELETE FROM candidatures WHERE id = $1', [id]);

        // Supprimer le dossier entier du candidat
        const dirToRemove = path.join(__dirname, '../uploads/candidatures', id.toString());
        await fsp.rm(dirToRemove, { recursive: true, force: true });

        // Envoyer mail
        await sendMail({
            to: candidat.email,
            subject: 'Votre candidature BacZénith a été acceptée',
            html: `
                <p>Bonjour ${candidat.prenom},</p>
                <p>Nous avons le plaisir de vous informer que votre candidature en tant que tuteur a été acceptée.</p>
                <p>Vous pouvez désormais vous connecter avec les identifiants suivants :</p>
                <ul>
                    <li><strong>Email :</strong> ${candidat.email}</li>
                    <li><strong>Mot de passe :</strong> ${plainPassword}</li>
                </ul>
                <p>Vos documents (CV, diplôme, certificats) ont été supprimés de nos serveurs conformément à notre politique de confidentialité.</p>
                <p>Bienvenue dans l’équipe BacZénith !</p>
            `
        });

        res.json({ message: 'Candidat accepté, compte créé et mail envoyé.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de l’acceptation' });
    } finally {
        client.release();
    }
});

router.post('/:id/refuser', auth, authorizeRoles('admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        const id = req.params.id;

        // Récupérer la candidature
        const { rows } = await pool.query('SELECT * FROM candidatures WHERE id = $1', [id]);
        const candidat = rows[0];
        if (!candidat) return res.status(404).json({ error: 'Candidature non trouvée' });

        // Supprimer les lignes liées
        await pool.query('DELETE FROM documents_candidats WHERE candidature_id = $1', [id]);
        await pool.query('DELETE FROM candidature_matieres WHERE candidature_id = $1', [id]);
        await pool.query('DELETE FROM candidatures WHERE id = $1', [id]);

        // Supprimer le dossier entier du candidat
        const dirToRemove = path.join(__dirname, '../uploads/candidatures', id.toString());
        await fsp.rm(dirToRemove, { recursive: true, force: true });

        // Envoyer mail de refus
        await sendMail({
            to: candidat.email,
            subject: 'Votre candidature BacZénith a été refusée',
            html: `
                <p>Bonjour ${candidat.prenom},</p>
                <p>Nous sommes au regret de vous informer que votre candidature en tant que tuteur a été refusée.</p>
                <p>Nous vous remercions de l'intérêt porté à BacZénith et vous souhaitons bonne continuation dans vos projets.</p>
            `
        });

        res.json({ message: 'Candidat refusé, candidature supprimée et mail envoyé.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors du refus' });
    } finally {
        client.release();
    }
});



module.exports = router;
