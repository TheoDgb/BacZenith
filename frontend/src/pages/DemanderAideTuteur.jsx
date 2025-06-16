import { useState, useEffect } from 'react';
import axios from 'axios';
import { MATIERES } from '../data/options.js';

export default function DemanderAideTuteur() {
    const [typeAide, setTypeAide] = useState('bac');

    const handleChangeTypeAide = (event) => {
        setTypeAide(event.target.value);
    };

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
        sessions: []
    });
    const [sujets, setSujets] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 5;

    const [selectedSujetId, setSelectedSujetId] = useState(null);
    const [matiereAutre, setMatiereAutre] = useState(MATIERES[0] || '');
    const [contactType, setContactType] = useState('laisser');

    const [tuteurs, setTuteurs] = useState([]);
    const [totalTuteurs, setTotalTuteurs] = useState(0);
    const [pageTuteur, setPageTuteur] = useState(1);

    const [rechercheNom, setRechercheNom] = useState('');
    const [tuteurSelectionneId, setTuteurSelectionneId] = useState(null);
    const [raisonAide, setRaisonAide] = useState('');

    const matiereSelectionnee = (() => {
        if (typeAide === 'bac') {
            const sujet = sujets.find(s => s.id === selectedSujetId);
            return sujet?.matiere || '';
        } else if (typeAide === 'autre') {
            return matiereAutre;
        }
        return '';
    })();

    // Charger les options au montage
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await axios.get('/api/sujets/options');
                setOptions(res.data);
            } catch (err) {
                console.error('Erreur chargement options :', err);
            }
        };
        fetchOptions();
    }, []);

    // Recharger les sujets dès que les filtres ou la page changent
    useEffect(() => {
        const fetchSujets = async () => {
            if (typeAide !== 'bac') return;
            try {
                const res = await axios.get('/api/sujets', {
                    params: { ...filters, page, limit }
                });
                setSujets(res.data.sujets);
                setTotal(res.data.total);
            } catch (err) {
                console.error('Erreur chargement sujets :', err);
            }
        };
        fetchSujets();
    }, [filters, page, typeAide]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setPage(1); // reset pagination
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

    useEffect(() => {
        const fetchTuteurs = async () => {
            if (!matiereSelectionnee) return;
            try {
                const res = await axios.get('/api/profils/tuteurs', {
                    params: {
                        matiere: matiereSelectionnee,
                        nom: rechercheNom,
                        page: pageTuteur,
                        limit: 5,
                    }
                });
                setTuteurs(res.data.tuteurs);
                setTotalTuteurs(res.data.total);
            } catch (err) {
                console.error('Erreur chargement tuteurs :', err);
            }
        };
        fetchTuteurs();
    }, [matiereSelectionnee, rechercheNom, pageTuteur]);

    return (
        <div>
            <h2>Demander l’aide d’un tuteur</h2>
            <form>
                <p>Quel type d’aide souhaitez-vous ?</p>
                <label>
                    <input
                        type="radio"
                        name="typeAide"
                        value="bac"
                        checked={typeAide === 'bac'}
                        onChange={handleChangeTypeAide}
                    />
                    Aide sur un sujet de BAC
                </label>
                <br />
                <label>
                    <input
                        type="radio"
                        name="typeAide"
                        value="autre"
                        checked={typeAide === 'autre'}
                        onChange={handleChangeTypeAide}
                    />
                    Autre type d’aide
                </label>
            </form>

            {typeAide === 'bac' && (
                <>
                    <h3>Filtrer les sujets de BAC</h3>
                    <div className="form-container">
                        <select name="annee" value={filters.annee} onChange={handleFilterChange} className="form-control">
                            <option value="">Année</option>
                            {options.annees.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>

                        <select name="serie" value={filters.serie} onChange={handleFilterChange} className="form-control">
                            <option value="">Série</option>
                            {options.series.filter(Boolean).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <select name="matiere" value={filters.matiere} onChange={handleFilterChange} className="form-control">
                            <option value="">Matière</option>
                            {options.matieres.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <select name="specialite" value={filters.specialite} onChange={handleFilterChange} className="form-control">
                            <option value="">Spécialité</option>
                            {options.specialites.filter(Boolean).map((sp) => (
                                <option key={sp} value={sp}>{sp}</option>
                            ))}
                        </select>

                        <select name="session" value={filters.session} onChange={handleFilterChange} className="form-control">
                            <option value="">Session</option>
                            {options.sessions.filter(Boolean).map((se) => (
                                <option key={se} value={se}>{se}</option>
                            ))}
                        </select>

                        <button type="button" onClick={resetFilters}>Réinitialiser</button>
                    </div>
                    <hr />

                    <ul>
                        {sujets.map((sujet) => (
                            <li key={sujet.id} style={{ marginBottom: '1rem' }}>
                                <div>
                                    <strong>{sujet.annee} - {sujet.matiere}</strong><br />
                                    Série : {sujet.serie} – Spécialité : {sujet.specialite || 'N/A'}<br />
                                    Épreuve : {sujet.epreuve}<br />
                                    Session : {sujet.session} {sujet.num_sujet && `– ${sujet.num_sujet}`}
                                </div>

                                <button
                                    onClick={() => setSelectedSujetId(sujet.id)}
                                    style={{
                                        marginTop: '0.5rem',
                                        backgroundColor: selectedSujetId === sujet.id ? 'green' : '#eee',
                                        color: selectedSujetId === sujet.id ? 'white' : 'black',
                                        border: '1px solid #ccc',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {selectedSujetId === sujet.id ? 'Sujet sélectionné' : 'Sélectionner ce sujet'}
                                </button>
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
            {typeAide === 'autre' && (
                <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="matiereAutre">Sélectionnez la matière concernée par votre demande : </label>
                    <br />
                    <select
                        id="matiereAutre"
                        name="matiereAutre"
                        value={matiereAutre}
                        onChange={(e) => setMatiereAutre(e.target.value)}
                        className="form-control"
                    >
                        {MATIERES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            )}
            {matiereSelectionnee && (
                <>
                    <hr />
                    <div style={{ marginTop: '1rem' }}>
                        <p>Comment souhaitez-vous être contacté ?</p>
                        <label>
                            <input
                                type="radio"
                                name="contactType"
                                value="laisser"
                                checked={contactType === 'laisser'}
                                onChange={() => {
                                    setContactType('laisser');
                                    setTuteurSelectionneId(null);
                                }}
                            />
                            Laisser un tuteur me contacter
                        </label>
                        <br />
                        <label>
                            <input
                                type="radio"
                                name="contactType"
                                value="specifique"
                                checked={contactType === 'specifique'}
                                onChange={() => setContactType('specifique')}
                            />
                            Contacter un tuteur spécifique
                        </label>

                        {contactType === 'specifique' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <h3>Tuteurs disponibles pour : {matiereSelectionnee}</h3>

                                <input
                                    type="text"
                                    placeholder="Nom / Prénom"
                                    value={rechercheNom}
                                    onChange={(e) => {
                                        setRechercheNom(e.target.value);
                                        setPageTuteur(1);
                                    }}
                                    className="form-control"
                                />
                                <hr />
                                <ul>
                                    {tuteurs.map((tuteur) => (
                                        <li key={tuteur.id} style={{ marginBottom: '1rem' }}>
                                            <strong>{tuteur.nom} {tuteur.prenom}</strong><br />
                                            {tuteur.description}<br />
                                            Tarif : {tuteur.tarif}<br />
                                            Disponibilités : {tuteur.disponibilites || 'Non renseignées'}

                                            <br />
                                            <button
                                                onClick={() => setTuteurSelectionneId(tuteur.id)}
                                                style={{
                                                    marginTop: '0.5rem',
                                                    backgroundColor: tuteurSelectionneId === tuteur.id ? 'green' : '#eee',
                                                    color: tuteurSelectionneId === tuteur.id ? 'white' : 'black',
                                                    border: '1px solid #ccc',
                                                    padding: '0.5rem 1rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {tuteurSelectionneId === tuteur.id ? 'Tuteur sélectionné' : 'Sélectionner ce tuteur'}
                                            </button>
                                            <hr />
                                        </li>
                                    ))}
                                </ul>

                                <div>
                                    <button
                                        onClick={() => setPageTuteur((p) => Math.max(p - 1, 1))}
                                        disabled={pageTuteur === 1}
                                    >
                                        Précédent
                                    </button>

                                    <span style={{ margin: '0 1rem' }}>
                                        Page {pageTuteur} / {Math.ceil(totalTuteurs / 5)}
                                    </span>
                                    <button
                                        onClick={() => setPageTuteur((p) => (p < Math.ceil(totalTuteurs / 5) ? p + 1 : p))}
                                        disabled={pageTuteur >= Math.ceil(totalTuteurs / 5)}
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                        <hr />
                        <div style={{ marginTop: '1rem' }}>
                            <label htmlFor="raisonAide"><strong>Expliquez pourquoi vous avez besoin d’aide :</strong></label>
                            <br />
                            <textarea
                                id="raisonAide"
                                name="raisonAide"
                                className="form-control textarea"
                                placeholder="Décrivez votre difficulté ou votre besoin spécifique..."
                                value={raisonAide}
                                onChange={(e) => setRaisonAide(e.target.value)}
                            />
                        </div>
                        <br/>
                    </div>
                </>
            )}
        </div>
    );
}