import { useEffect, useState } from 'react';
import axios from 'axios';
import FormAjoutSujet from '../components/FormAjoutSujet';
import FormEditSujet from '../components/FormEditSujet';
import {Link} from "react-router-dom";

function AdminSujets() {
    const [sujets, setSujets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        annee: '',
        serie: '',
        matiere: '',
        specialite: '',
        session: '',
    });
    const [options, setOptions] = useState({
        annees: [],
        series: [],
        matieres: [],
        specialites: [],
        sessions: [],
    });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 3;

    const [sujetEnEdition, setSujetEnEdition] = useState(null);

    const fetchSujets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sujets', {
                params: { ...filters, page, limit }
            });
            setSujets(res.data.sujets || []);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Erreur chargement sujets :', err);
        }
    };

    const fetchOptions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sujets/options');
            setOptions(res.data);
        } catch (err) {
            console.error('Erreur chargement options :', err);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        setPage(1); // reset la page quand les filtres changent
    }, [filters]);

    useEffect(() => {
        fetchSujets();
    }, [filters, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const resetFilters = () => {
        setFilters({
            annee: '',
            serie: '',
            matiere: '',
            specialite: '',
            session: '',
        });
    };

    return (
        <div>
            <h2>Gestion des Sujets</h2>

            {!showForm && (
                <button onClick={() => setShowForm(true)}>Ajouter un sujet</button>
            )}
            {showForm && (
                <FormAjoutSujet onAjout={fetchSujets} onClose={() => setShowForm(false)} />
            )}

            <hr />

            {!sujetEnEdition && (
                <>
                    <h3>Modifier / Supprimer un nouveau sujet</h3>
                    <div className="form-container">
                        <select name="annee" value={filters.annee} onChange={handleChange} className="form-control">
                            <option value="">Année</option>
                            {options.annees.map((a) => <option key={a}>{a}</option>)}
                        </select>

                        <select name="serie" value={filters.serie} onChange={handleChange} className="form-control">
                            <option value="">Série</option>
                            {options.series.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
                        </select>

                        <select name="matiere" value={filters.matiere} onChange={handleChange} className="form-control">
                            <option value="">Matière</option>
                            {options.matieres.map((m) => <option key={m}>{m}</option>)}
                        </select>

                        <select name="specialite" value={filters.specialite} onChange={handleChange} className="form-control">
                            <option value="">Spécialité</option>
                            {options.specialites.filter(Boolean).map((sp) => <option key={sp}>{sp}</option>)}
                        </select>

                        <select name="session" value={filters.session} onChange={handleChange} className="form-control">
                            <option value="">Session</option>
                            {options.sessions.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
                        </select>

                        <button onClick={resetFilters}>Réinitialiser</button>
                    </div>

                    <ul>
                        {sujets.map((s) => (
                            <li key={s.id}>
                                <Link to={`/sujets/${s.id}`}>
                                    <strong>{s.annee} - {s.matiere}</strong>
                                </Link>
                                <br />
                                Série : {s.serie} – Spécialité : {s.specialite || 'N/A'}
                                <br />
                                Épreuve : {s.epreuve}
                                <br />
                                <span>
                                    Session : {s.session} {s.num_sujet && ` – ${s.num_sujet}`}
                                </span>
                                <br />
                                <span>
                                  {s.fichier_sujet ? 'Sujet OK' : 'Sujet manquant'} – {s.fichier_corrige ? 'Corrigé OK' : 'Corrigé manquant'}
                                </span>
                                <br />
                                <div className="form-container">
                                    <button onClick={() => setSujetEnEdition(s)}>Modifier</button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Confirmer la suppression ?')) {
                                                axios.delete(`http://localhost:5000/api/sujets/${s.id}`)
                                                    .then(() => {
                                                        alert('Sujet supprimé');
                                                        fetchSujets();
                                                    })
                                                    .catch(err => {
                                                        console.error(err);
                                                        alert('Erreur suppression');
                                                    });
                                            }
                                        }}
                                    >Supprimer</button>
                                </div>
                                <hr />
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                        >
                            Précédent
                        </button>

                        <span style={{ margin: '0 1rem' }}>
                            Page {page} / {Math.ceil(total / limit)}
                        </span>

                        <button
                            onClick={() =>
                                setPage((p) => (p < Math.ceil(total / limit) ? p + 1 : p))
                            }
                            disabled={page >= Math.ceil(total / limit)}
                        >
                            Suivant
                        </button>
                    </div>
                </>
            )}
            {sujetEnEdition && (
                <FormEditSujet
                    sujet={sujetEnEdition}
                    onClose={() => setSujetEnEdition(null)}
                    onMaj={fetchSujets}
                />
            )}
        </div>
    );
}


export default AdminSujets;
