const express = require('express');
const cors = require('cors');
const pool = require('./config');
const http = require('http');
const { Server } = require('socket.io');
const candidaturesRoutes = require('./routes/candidatures');
const authRoutes = require('./routes/auth');
const profilsRoutes = require('./routes/profils');
const sujetsRoutes = require('./routes/sujets');
const aideRoutes = require('./routes/aide');
const notesRoutes = require('./routes/notes');
const messagesRoutes = require('./routes/messages');
require('dotenv').config();
const sendMail = require('./utils/sendMail');

const app = express();
const PORT = 5000;

// Créer serveur HTTP avec Express (nécessaire pour socket.io)
const server = http.createServer(app);
// Initialiser Socket.IO avec options CORS
const io = new Server(server, {
    cors: {
        origin: '*', // adapte l'origine front si besoin
        methods: ['GET', 'POST']
    }
});
// Rendre io accessible dans les routes via app.set
app.set('io', io);

// Middleware
app.use(cors()); // autorise les requêtes depuis le frontend
app.use(express.json());

// Routes
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profils', profilsRoutes);
app.use('/api/sujets', sujetsRoutes);
app.use('/api/aide', aideRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/messages', messagesRoutes);

// Socket.IO gestion connexion
io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} a rejoint conversation_${conversationId}`);
    });
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} a quitté conversation_${conversationId}`);
    });
    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} a rejoint user_${userId}`);
    });
    socket.on('disconnect', () => {
        console.log('Socket déconnecté:', socket.id);
    });
});

// Test de serveur
app.get('/', (req, res) => {
    res.send('Bienvenue sur le backend de BacZenith !');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (error) {
        console.error('Erreur DB :', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// curl -X POST http://localhost:5000/test-mail
app.post('/test-mail', async (req, res) => {
    try {
        await sendMail({
            to: 'candidat@email.com',
            subject: 'Test de mail',
            html: '<p>Bienvenue chez BacZénith !</p>'
        });
        res.json({ message: 'Mail envoyé !' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur envoi mail' });
    }
});

server.listen(PORT, () => {
    console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});