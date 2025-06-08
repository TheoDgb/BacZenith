import { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MATIERES } from '../data/options.js';

export default function DevenirTuteur() {
    const [tempId] = useState(uuidv4());
    const [fileInputKey, setFileInputKey] = useState(0);

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        motivation: '',
        cv: null
    });

    const [files, setFiles] = useState({
        cv: null,
        diplome: [],
        certificats: []
    });

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (!selectedFiles) return;

        if (name === 'certificats') {
            setFiles({
                ...files,
                certificats: Array.from(selectedFiles)
            });
        } else if (name === 'diplome') {
            setFiles({
                ...files,
                diplome: Array.from(selectedFiles)
            });
        } else {
            setFiles({
                ...files,
                [name]: selectedFiles[0]
            });
        }
    };

    const [selectedMatieres, setSelectedMatieres] = useState([]);
    const toggleMatiere = (matiere) => {
        if (selectedMatieres.includes(matiere)) {
            setSelectedMatieres(selectedMatieres.filter(m => m !== matiere));
        } else {
            setSelectedMatieres([...selectedMatieres, matiere]);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        data.append('tempId', tempId);

        data.append('nom', form.nom);
        data.append('prenom', form.prenom);
        data.append('email', form.email);
        data.append('motivation', form.motivation);
        selectedMatieres.forEach(m => data.append('matieres[]', m));

        if (files.cv) data.append('cv', files.cv);
        if (files.diplome && files.diplome.length > 0) {
            files.diplome.forEach((file) => {
                data.append('diplome', file);
            });
        }
        if (files.certificats && files.certificats.length > 0) {
            files.certificats.forEach((file) => {
                data.append('certificats', file);
            });
        }

        try {
            await axios.post('/api/candidatures', data);
            alert("Votre candidature a été envoyée !");
            window.location.href = "/";

            // Reset tout le formulaire
            setForm({ nom: '', prenom: '', email: '', motivation: '', cv: null });
            setFiles({ cv: null, diplome: [], certificats: [] });
            setSelectedMatieres([]);
            setFileInputKey(k => k + 1);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi.");
        }
    };

    return (
        <div>
            <h2>Candidature Tuteur</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-container">
                    <input type="text" name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} className="form-control" required />
                    <input type="text" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} className="form-control" required />
                    <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-control" required />
                </div>
                <br />
                <div>
                    <label>Matières :</label>
                    {MATIERES.map(matiere => (
                        <div key={matiere}>
                            <input
                                type="checkbox"
                                id={matiere}
                                checked={selectedMatieres.includes(matiere)}
                                onChange={() => toggleMatiere(matiere)}
                            />
                            <label htmlFor={matiere}>{matiere}</label>
                        </div>
                    ))}
                </div>
                <br />
                <div className="form-container">
                    <textarea name="motivation" placeholder="Motivation / Expérience" value={form.motivation} onChange={handleChange} className="form-control" required />
                </div>
                <br />
                <div className="form-container">
                    Fichiers en .pdf/.doc /.docx
                </div>
                <div className="form-container">
                    <p>CV : <input key={fileInputKey} type="file" name="cv" onChange={handleFileChange} accept=".pdf,.doc,.docx" required /></p>
                </div>
                <div className="form-container">
                    <p>Diplôme(s) : <input key={fileInputKey} type="file" name="diplome" onChange={handleFileChange} accept=".pdf,.doc,.docx" multiple/></p>
                </div>
                <div className="form-container">
                    <p>Autre(s) justificatif(s) (certificats, attestations de formation ou d’enseignement, etc.) :<br /><input key={fileInputKey} type="file" name="certificats" onChange={handleFileChange} accept=".pdf,.doc,.docx" multiple /></p>
                </div>
                <br />
                <div className="form-container">
                    <button type="submit">Envoyer</button>
                </div>
            </form>
        </div>
    );
}
