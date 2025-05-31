// upload pdf
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier dynamique en fonction du champ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = '';
        if (file.fieldname === 'fichier_sujet') {
            folder = '../frontend/public/pdf/sujets';
        } else if (file.fieldname === 'fichier_corrige') {
            folder = '../frontend/public/pdf/corriges';
        }

        // Crée le dossier si inexistant
        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        // Utilise le nom original
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

module.exports = upload;
