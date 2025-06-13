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

    const handleVoirFichier = async (id, type, filename) => {
        try {
            const res = await axios.get(`/api/candidatures/fichier/${id}/${type}/${filename}`, {
                responseType: 'blob',
                withCredentials: true
            });

            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Erreur lors de la récupération du fichier', err);
            alert('Impossible d’ouvrir le fichier (non autorisé ou introuvable).');
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
                            <p><strong>Motivation :</strong> {c.motivation}</p>
                            <p><strong>Matières : </strong>{c.matieres.join(', ')}</p>
                            <div>
                                <strong>Fichiers :</strong>
                                <ul>
                                    {c.documents.map((doc, i) => (
                                        <li key={i}>
                                            {doc.type} : <a href="#" onClick={(e) => {e.preventDefault(); handleVoirFichier(c.id, doc.type, doc.filename.split('/').pop());}}>Voir</a>
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
