DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS message_reads;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS demandes_aide;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS candidature_matieres;
DROP TABLE IF EXISTS documents_candidats;
DROP TABLE IF EXISTS candidatures;
DROP TABLE IF EXISTS tuteur_matieres;
DROP TABLE IF EXISTS tuteur_profils;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sujets;

DROP TYPE IF EXISTS role_enum;

CREATE TABLE sujets (
  id SERIAL PRIMARY KEY,
  annee INT NOT NULL,
  serie VARCHAR(50) NOT NULL, -- ES, S, L, etc.
  matiere VARCHAR(100) NOT NULL, -- Mathématiques, Physique, etc.
  specialite VARCHAR(100), -- Spécialité du bac (ex : NSI, SES…)
  epreuve VARCHAR(100) NOT NULL, -- Épreuve terminale, Rattrapage
  session VARCHAR(100) NOT NULL, -- Métropole France, Polynésie
  num_sujet VARCHAR(50), -- Sujet 1 Sujet 2 NULL
  fichier_sujet TEXT, -- ex : 2023-general-mathematiques-maths-expertes-metropole-1-sujet.pdf
  fichier_corrige TEXT, -- ex : 2023-general-mathematiques-maths-expertes-metropole-1-corrige.pdf
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE role_enum AS ENUM ('admin', 'tuteur', 'eleve');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role role_enum NOT NULL DEFAULT 'eleve',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tuteur_profils (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    description TEXT NOT NULL,
    disponibilites TEXT NOT NULL,
    tarif VARCHAR(100) DEFAULT 'Service gratuit',
    visible BOOLEAN DEFAULT TRUE,
    is_certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tuteur_matieres (
    id SERIAL PRIMARY KEY,
    tuteur_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matiere VARCHAR(100) NOT NULL
);

CREATE INDEX idx_tuteur_matieres_matiere ON tuteur_matieres(matiere);
CREATE INDEX idx_tuteur_matieres_tuteur_id ON tuteur_matieres(tuteur_id);

CREATE TABLE candidatures (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    motivation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents_candidats (
    id SERIAL PRIMARY KEY,
    candidature_id INTEGER REFERENCES candidatures(id) ON DELETE CASCADE,
    type_doc VARCHAR(50) NOT NULL,  -- 'cv', 'diplome', 'certificat'
    filename TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidature_matieres (
    id SERIAL PRIMARY KEY,
    candidature_id INTEGER REFERENCES candidatures(id) ON DELETE CASCADE,
    matiere VARCHAR(100) NOT NULL
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demandes_aide (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type_aide VARCHAR(20) NOT NULL CHECK (type_aide IN ('bac', 'autre')),
    sujet_id INTEGER REFERENCES sujets(id) ON DELETE SET NULL,  -- null si typeAide = 'autre'
    matiere VARCHAR(100) NOT NULL,
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- null si "laisser"
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('laisser', 'specifique')),
    message TEXT NOT NULL,
    en_cours BOOLEAN DEFAULT FALSE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_reads (
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- Index pour améliorer les performances de recherche
-- retrouver les messages d'une conversation
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
-- retrouver toutes les conversations d'un utilisateur
CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sujet_id INTEGER REFERENCES sujets(id) ON DELETE CASCADE,
    demande_id INTEGER REFERENCES demandes_aide(id) ON DELETE CASCADE,
    contenu TEXT,
    partage_avec_tuteur BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (sujet_id IS NOT NULL AND demande_id IS NULL) OR
        (sujet_id IS NULL AND demande_id IS NOT NULL)
    ),
    -- Colonne calculée pour concaténer sujet_id et demande_id en texte non null
    unique_key TEXT GENERATED ALWAYS AS (
        COALESCE(sujet_id::text, '') || '-' || COALESCE(demande_id::text, '')
        ) STORED
);

CREATE UNIQUE INDEX unique_notes_user_key ON notes (user_id, unique_key);

-- insertion de sujets test
INSERT INTO sujets (annee, serie, matiere, specialite, epreuve, session, num_sujet, fichier_sujet, fichier_corrige)
VALUES (2023, 'Générale', 'Mathématiques', 'Maths expertes', 'Épreuve terminale', 'Métropole France', 'Sujet 1', '2023-general-mathematiques-maths-expertes-metropole-1-sujet.pdf', '2023-general-mathematiques-maths-expertes-metropole-1-corrige.pdf'),
       (2022, 'Générale', 'Physique-Chimie', 'Physique', 'Épreuve terminale', 'Polynésie', 'Sujet 2', '2023-general-mathematiques-maths-expertes-metropole-1-sujet.pdf', NULL),
       (2023, 'Générale', 'SES', 'SES', 'Épreuve de spécialité', 'Métropole France', NULL, NULL, '2023-general-mathematiques-maths-expertes-metropole-1-corrige.pdf'),
       (2021, 'Technologique', 'Philosophie', NULL, 'Épreuve commune', 'Métropole France', NULL, NULL, NULL);
