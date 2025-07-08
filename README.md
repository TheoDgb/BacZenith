# Bac Zénith

**Bac Zénith** est une plateforme web, destinée aux élèves préparant le baccalauréat, incluant un accompagnement humain. Elle centralise une recherche rapide de sujets d’examen, un système de prise de notes, une gestion des sujets et des tuteurs, et la possibilité pour un élève de demander de l'aide à un des tuteurs qualifiés pour y répondre à travers une messagerie intégrée.

Pour en savoir plus sur le contexte et les raisons de ce projet, [consultez la présentation de la soutenance Bac Zénith](https://github.com/TheoDgb/BacZenith/blob/main/docs/Open%20Innovation%20BAC%20Z%C3%89NITH.pdf).
<br> Vous pouvez également retrouver des captures d'écran du site web (prototype) [ici](https://github.com/TheoDgb/BacZenith/tree/main/docs/screens).

Ce projet a été réalisé dans le cadre d’un projet Open Innovation sur deux ans à l’école EPSI, avec pour objectif de présenter un prototype à des investisseurs à la fin de la première année ainsi que de proposer un projet complet et terminé à la fin de la deuxième année.

Note : Ce projet restera à l’état de prototype. Bien qu’il ait reçu un retour très positif du jury lors de la première soutenance, il ne sera pas poursuivi en deuxième année.
En effet, j'ai décidé de quitter l’école EPSI après une première année de Mastère, dont le contenu et la gestion ne répondaient absolument pas à mes attentes professionnelles, et que je considère même comme irrespectueux.
Ce dépôt représente donc l’état final du prototype de première année, avec les principales fonctionnalités opérationnelles.

## Stack Technique
### Frontend
| Outil            | 	Rôle                                          |
|------------------|------------------------------------------------|
| Vite             | 	Environnement de développement React rapide   |
| React            | 	Création de l’interface utilisateur           |
| Axios            | Requêtes HTTP vers l’API backend               |
| React Router DOM | Gestion du routage multi-pages                 |
| Bootstrap        | Design et composants UI                        |
| Bootstrap Icons  | Icônes simples et intégrables                  |
| UUID             | 	Génération d’identifiants uniques             |
| Socket.io-client | Communication en temps réel pour la messagerie |

### Backend
| Outil             | 	Rôle                                               |
|-------------------|-----------------------------------------------------|
| Node.js + Express | API REST, logique métier                            |
| PostgreSQL        | Base de données relationnelle                       |
| pg / dotenv       | 	Connexion et configuration base de données         |
| CORS              | Communication cross-origin avec le frontend         |
| Multer            | Upload de fichiers                                  |
| Bcrypt            | 	Hash de mots de passe pour l’authentification      |
| JSON Web Token    | Authentification sécurisée par token                |
| Express-jwt       | 	Middleware de vérification de tokens               |
| Nodemailer        | Envoi d’e-mails (confirmation, notifications, etc.) |
| Socket.io         | 	Communication temps réel (chat tuteur)             |
| Nodemon           | 	Redémarrage auto en développement                  |

## Installation du projet
**Prérequis :**
- Node.js ≥ 18.x
- PostgreSQL
- Un compte Gmail avec mot de passe d'application
- Git

### Cloner le projet
```
git clone https://github.com/TheoDgb/BacZenith.git
cd baczenith
```

### Installation des dépendances
Le repository contient deux projets indépendants : un pour le backend et un pour le frontend. Chacun a ses propres dépendances à installer séparément.
1. Dans le dossier `backend/`
```
cd backend
npm install
```
2. Dans le dossier `frontend/`
```
cd ../frontend
npm install
```

### Initialisation de la base de données PostgreSQL
1. Créer la base de données :
```
sudo su - postgres
psql
CREATE DATABASE baczenith;
\c baczenith
```
2. Créer les tables :
Dans le dossier `backend/`, un fichier `db.sql` contient toutes les instructions SQL nécessaires pour créer les tables et des sujets de test :
```
cd backend
psql -U nom_utilisateur_postgres -d baczenith -f db.sql
```

### Créer un premier compte administrateur
Dans `backend/`, un script `createAdmin.js` permet de générer rapidement un compte administrateur dans la base de données :
```
node createAdmin.js
# mail : admin@example.com
# mdp : admin
```

### Configuration des variables d'environnement
Dans `backend/`, créez un fichier `.env` en vous servant de `.env.example`.

### Lancer le projet en développement
Ouvrir deux terminaux :

Terminal 1 - Lancer le frontend :
```
cd frontend
npm run dev
# Le frontend est servi sur http://localhost:5173
```
Terminal 2 - lancer le backend :
```
cd backend
npm run dev
# Le backend est accessible sur http://localhost:5000
```
