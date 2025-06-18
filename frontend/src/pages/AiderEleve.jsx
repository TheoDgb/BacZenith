import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AiderEleve() {
    const [typeAide, setTypeAide] = useState('bac');
    const [order, setOrder] = useState('desc');
    const [demandes, setDemandes] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [matiereFiltre, setMatiereFiltre] = useState('');
    const [affectationFiltre, setAffectationFiltre] = useState('me'); // 'me' | 'none' | 'all'
    const [demandeSelectionneeId, setDemandeSelectionneeId] = useState(null);

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
                        affectation: affectationFiltre,
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
    }, [typeAide, order, matiereFiltre, affectationFiltre]);

    return (
        <div>
            <h2>Aider un élève</h2>
            <h3>Sélectionner une demande d'aide :</h3>
            <div className="form-container">
                <select
                    className="form-control"
                    value={affectationFiltre}
                    onChange={(e) => setAffectationFiltre(e.target.value)}
                >
                    <option value="me">Affectées à moi</option>
                    <option value="none">Non affectées</option>
                </select>
                <select
                    className="form-control"
                    value={typeAide}
                    onChange={(e) => setTypeAide(e.target.value)}
                >
                    <option value="bac">Sujet de BAC</option>
                    <option value="autre">Autre demande</option>
                </select>
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
                <button
                    type="button"
                    onClick={() => setOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="form-control"
                >
                    {order === 'desc' ? 'Plus récentes' : 'Plus anciennes'}
                </button>
            </div>
            <hr />
            <ul>
                {demandes.map((demande) => (
                    <li key={demande.id}>
                        <strong>Demande de {demande.nom} {demande.prenom}</strong> - {new Date(demande.created_at).toLocaleDateString()}<br />
                        {typeAide === 'bac' ? (
                            <>
                                <strong>Sujet :</strong><br />
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
                                <strong>Matière : </strong>{demande.matiere}<br />
                            </>
                        )}
                        <p><strong>Message :</strong> {demande.message}</p>
                        <button
                            onClick={() => setDemandeSelectionneeId(demande.id)}
                            style={{
                                marginTop: '0.5rem',
                                backgroundColor: demandeSelectionneeId === demande.id ? 'green' : '#eee',
                                color: demandeSelectionneeId === demande.id ? 'white' : 'black',
                                border: '1px solid #ccc',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer'
                            }}
                        >
                            {demandeSelectionneeId === demande.id ? 'Demande sélectionnée' : 'Sélectionner cette demande'}
                        </button>
                        <hr />
                    </li>
                ))}
            </ul>
            {demandeSelectionneeId && (
                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={async () => {
                            try {
                                await axios.post(`/api/aide/demandes/${demandeSelectionneeId}/prendre`);
                                alert('Demande prise en charge avec succès.');
                                setDemandeSelectionneeId(null);
                                // Recharger les demandes
                                const res = await axios.get('/api/aide/demandes', {
                                    params: {
                                        affectation: affectationFiltre,
                                        type_aide: typeAide,
                                        order: order,
                                        ...(matiereFiltre ? { matiere: matiereFiltre } : {})
                                    }
                                });
                                setDemandes(res.data);
                            } catch (err) {
                                console.error(err);
                                alert('Erreur : impossible de prendre la demande.');
                            }
                        }}
                    >
                        Prendre en charge cette demande
                    </button>
                </div>
            )}
        </div>
    );
}