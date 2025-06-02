import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    SERIES, MATIERES, SPECIALITES,
    EPREUVES, SESSIONS, NUMS_SUJET
} from '../data/options';

function FormEditSujet({ sujet, onClose, onMaj }) {
    const [form, setForm] = useState({ ...sujet });

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
            if (value !== null) {
                data.append(key, value);
            }
        });

        try {
            await axios.put(`http://localhost:5000/api/sujets/${sujet.id}`, data);
            alert('Sujet modifié');
            onMaj(); // refresh liste
            onClose(); // fermer form
        } catch (err) {
            console.error(err);
            alert("Erreur modification");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Modifier le sujet</h3>
            <div className="form-container">
                <input type="number" name="annee" value={form.annee} onChange={handleChange} className="form-control" required />

                <select name="serie" value={form.serie} onChange={handleChange} className="form-control" required>
                    {SERIES.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="matiere" value={form.matiere} onChange={handleChange} className="form-control" required>
                    {MATIERES.map(m => <option key={m}>{m}</option>)}
                </select>

                <select name="specialite" value={form.specialite || ''} onChange={handleChange} className="form-control">
                    <option value="">Aucune</option>
                    {SPECIALITES.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="epreuve" value={form.epreuve} onChange={handleChange} className="form-control" required>
                    {EPREUVES.map(e => <option key={e}>{e}</option>)}
                </select>

                <select name="session" value={form.session} onChange={handleChange} className="form-control" required>
                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </select>

                <select name="num_sujet" value={form.num_sujet || ''} onChange={handleChange} className="form-control">
                    <option value="">Aucun</option>
                    {NUMS_SUJET.map(n => <option key={n}>{n}</option>)}
                </select>
            </div>
            <br />
            <p>Fichier sujet PDF : <input type="file" name="fichier_sujet" onChange={handleChange} /></p>
            <p>Fichier corrigé PDF : <input type="file" name="fichier_corrige" onChange={handleChange} /></p>
            <br />
            <div className="form-container">
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}

export default FormEditSujet;
