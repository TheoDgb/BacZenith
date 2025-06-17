import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AiderEleve() {
    const [typeAide, setTypeAide] = useState('bac');
    const [order, setOrder] = useState('desc');
    const [demandes, setDemandes] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [matiereFiltre, setMatiereFiltre] = useState('');

    useEffect(() => {
        const fetchMatieres = async () => {
            try {
                const res = await axios.get('/api/profils/me/tuteur');
                setMatieres(res.data.matieres); // <-- On stocke uniquement les matières
            } catch (err) {
                console.error('Erreur chargement des matières :', err);
            }
        };
        fetchMatieres();
    }, []);

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const res = await axios.get('/api/aide/demandes', {
                    params: {
                        type_aide: typeAide,
                        order: order,
                        ...(matiereFiltre ? { matiere: matiereFiltre } : {})
                    }
                });
                setDemandes(res.data);
            } catch (err) {
                console.error('Erreur chargement demandes :', err);
            }
        };
        fetchDemandes();
    }, [typeAide, order, matiereFiltre]);


    return (
        <div>
            <h2>Aider un élève</h2>
            <form>
                <p>Type de demande :</p>
                <label>
                    <input
                        type="radio"
                        name="typeAide"
                        value="bac"
                        checked={typeAide === 'bac'}
                        onChange={(e) => setTypeAide(e.target.value)}
                    />
                    Sujet de BAC
                </label>
                <br />
                <label>
                    <input
                        type="radio"
                        name="typeAide"
                        value="autre"
                        checked={typeAide === 'autre'}
                        onChange={(e) => setTypeAide(e.target.value)}
                    />
                    Autre
                </label>
            </form>

            <div style={{ marginTop: '1rem' }}>
                <h3>Sélectionner une demande d'aide :</h3>
                <div className="form-container">
                    <button
                        type="button"
                        onClick={() => setOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="form-control"
                    >
                        {order === 'desc' ? 'Plus récentes' : 'Plus anciennes'}
                    </button>

                    <select
                        className="form-control"
                        value={matiereFiltre}
                        onChange={(e) => setMatiereFiltre(e.target.value)}
                    >
                        <option value="">Toutes les matières</option>
                        {matieres.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>


                </div>
            </div>

            <hr />

            <ul>
                {demandes.map((demande) => (
                    <li key={demande.id}>
                        <strong>Demande de {demande.nom} {demande.prenom}</strong> - {new Date(demande.created_at).toLocaleDateString()}<br />
                        {typeAide === 'bac' ? (
                            <>
                                Sujet :<br />
                                <Link to={`/sujets/${demande.id}`}>
                                    <strong>{demande.annee} - {demande.matiere}</strong>
                                </Link><br />
                                Série : {demande.serie} – Spécialité : {demande.specialite || 'N/A'}<br />
                                Épreuve : {demande.epreuve}<br />
                                <span>
                                    Session : {demande.session} {demande.num_sujet && ` – ${demande.num_sujet}`}
                                </span>
                            </>
                        ) : (
                            <>
                                Matière : {demande.matiere}<br />
                            </>
                        )}
                        <p><strong>Message :</strong> {demande.message}</p>
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}