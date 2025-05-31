import { useState } from 'react';
import axios from 'axios';
import {
    SERIES, MATIERES, SPECIALITES,
    EPREUVES, SESSIONS, NUMS_SUJET
} from '../data/options';

function FormAjoutSujet({ onAjout, onClose }) {
    const [form, setForm] = useState({
        annee: '',
        serie: '',
        matiere: '',
        specialite: '',
        epreuve: '',
        session: '',
        num_sujet: '',
        fichier_sujet: null,
        fichier_corrige: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        try {
            await axios.post('http://localhost:5000/api/sujets', data);
            alert('Sujet ajouté');
            onAjout(); // actualise la liste
            onClose(); // ferme le formulaire
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l’ajout');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Ajouter un nouveau sujet</h3>

            <div className="form-container">
                <input type="number" name="annee" placeholder="Année" onChange={handleChange} className="form-control" required />

                <select name="serie" onChange={handleChange} className="form-control" required>
                    <option value="">Série</option>
                    {SERIES.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="matiere" onChange={handleChange} className="form-control" required>
                    <option value="">Matière</option>
                    {MATIERES.map(m => <option key={m}>{m}</option>)}
                </select>

                <select name="specialite" onChange={handleChange} className="form-control">
                    <option value="">Spécialité (facultatif)</option>
                    {SPECIALITES.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="epreuve" onChange={handleChange} className="form-control" required>
                    <option value="">Épreuve</option>
                    {EPREUVES.map(e => <option key={e}>{e}</option>)}
                </select>

                <select name="session" onChange={handleChange} className="form-control" required>
                    <option value="">Session</option>
                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="num_sujet" onChange={handleChange} className="form-control">
                    <option value="">Numéro du sujet (facultatif)</option>
                    {NUMS_SUJET.map(n => <option key={n}>{n}</option>)}
                </select>
            </div>
            <br />
                <p>Fichier sujet PDF : <input type="file" name="fichier_sujet" accept="application/pdf" onChange={handleChange} /></p>

                <p>Fichier corrigé PDF : <input type="file" name="fichier_corrige" accept="application/pdf" onChange={handleChange} /></p>
            <br />
            <button type="submit">Ajouter</button>
            <button type="button" onClick={onClose}>Annuler</button>
        </form>
    );
}

export default FormAjoutSujet;