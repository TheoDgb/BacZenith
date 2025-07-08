// node createAdmin.js
// SELECT * FROM users WHERE role = 'admin';

const bcrypt = require('bcrypt');
const pool = require('./config'); // adapte si besoin

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'admin';
        const nom = 'Admin';
        const prenom = 'Principal';
        const role = 'admin';

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer dans la base
        const { rows } = await pool.query(
            `INSERT INTO users (email, password, role, nom, prenom) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [email, hashedPassword, role, nom, prenom]
        );

        console.log(`Admin créé avec l'ID : ${rows[0].id}`);
        process.exit(0);
    } catch (err) {
        console.error('Erreur création admin:', err);
        process.exit(1);
    }
}

createAdmin();
