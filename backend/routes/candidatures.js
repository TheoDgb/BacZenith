const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const pool = require('../config');

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

module.exports = router;
