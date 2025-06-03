import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/filters.css';

function ListeSujets() {
    const [sujets, setSujets] = useState([]);
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
    const resetFilters = () => {
        setFilters({
            annee: '',
            serie: '',
            matiere: '',
            specialite: '',
            session: '',
        });
    };
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 3;



    const fetchSujets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sujets', {
                params: { ...filters, page, limit }
            });
            setSujets(res.data.sujets);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Erreur lors du chargement des sujets :', err);
        }
    };

    useEffect(() => {
        setPage(1); // reset page quand filtres changent
    }, [filters]);


    useEffect(() => {
        fetchSujets();
    }, [filters, page]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/sujets/options');
                setOptions(res.data);
            } catch (err) {
                console.error('Erreur chargement options :', err);
            }
        };

        fetchOptions();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    return (
        <div>
            <h2>Recherche de Sujets</h2>

            <div className="form-container">
                <select name="annee" value={filters.annee} onChange={handleChange} className="form-control">
                    <option value="">Année</option>
                    {options.annees.map((annee) => (
                        <option key={annee} value={annee}>{annee}</option>
                    ))}
                </select>

                <select name="serie" value={filters.serie} onChange={handleChange} className="form-control">
                    <option value="">Série</option>
                    {options.series.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <select name="matiere" value={filters.matiere} onChange={handleChange} className="form-control">
                    <option value="">Matière</option>
                    {options.matieres.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                <select name="specialite" value={filters.specialite} onChange={handleChange} className="form-control">
                    <option value="">Spécialité</option>
                    {options.specialites.filter(Boolean).map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                    ))}
                </select>

                <select name="session" value={filters.session} onChange={handleChange} className="form-control">
                    <option value="">Session</option>
                    {options.sessions.filter(Boolean).map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                    ))}
                </select>

                <button onClick={resetFilters}>Réinitialiser les filtres</button>
            </div>
            <hr />

            <ul>
                {sujets.map((sujet) => (
                    <li key={sujet.id}>
                        <Link to={`/sujets/${sujet.id}`}>
                            <strong>{sujet.annee} - {sujet.matiere}</strong>
                        </Link>
                        <br />
                        Série : {sujet.serie} – Spécialité : {sujet.specialite || 'N/A'}
                        <br />
                        Épreuve : {sujet.epreuve}
                        <br />
                        <span>
                            Session : {sujet.session} {sujet.num_sujet && ` – ${sujet.num_sujet}`}
                        </span>
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

        </div>
    );
}

export default ListeSujets;
