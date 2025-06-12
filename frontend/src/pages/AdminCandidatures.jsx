import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCandidatures() {
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCandidatures = async () => {
        const res = await axios.get('/api/candidatures/all');
        console.log(res.data);
        setCandidatures(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCandidatures();
    }, []);

    const handleAccepter = async (id) => {
        if (!window.confirm('Accepter cette candidature ?')) return;

        try {
            await axios.post(`/api/candidatures/${id}/accepter`);
            alert('Candidat accepté, mail envoyé.');
            fetchCandidatures(); // rafraîchir la liste
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'acceptation");
        }
    };

    const handleRefuser = async (id) => {
        if (!window.confirm('Refuser cette candidature ? Cette action est définitive.')) return;

        try {
            await axios.post(`/api/candidatures/${id}/refuser`);
            alert('Candidat refusé, mail envoyé.');
            fetchCandidatures(); // rafraîchir la liste
        } catch (err) {
            console.error(err);
            alert("Erreur lors du refus");
        }
    };

    if (loading) return <p>Chargement des candidatures...</p>;

    return (
        <div>
            <h2>Candidatures reçues</h2>
            {candidatures.length === 0 ? (
                <p>Aucune candidature pour le moment.</p>
            ) : (
                <ul>
                    {candidatures.map(c => (
                        <li key={c.id} style={{ border: '1px solid #ccc', padding: '1em', marginBottom: '1em' }}>
                            <strong>{c.prenom} {c.nom}</strong> - {c.email}
                            <p><em>Motivation :</em> {c.motivation}</p>
                            <p><em>Matières :</em> {c.matieres.join(', ')}</p>
                            <div>
                                <strong>Fichiers :</strong>
                                <ul>
                                    {c.documents.map((doc, i) => (
                                        <li key={i}>
                                            {doc.type} : <a href={`/uploads/candidatures/${doc.filename}`} target="_blank" rel="noreferrer">Voir</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => handleAccepter(c.id)}>Accepter</button>
                            <button onClick={() => handleRefuser(c.id)}>Refuser</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
