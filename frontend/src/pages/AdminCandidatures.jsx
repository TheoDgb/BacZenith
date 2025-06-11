import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCandidatures() {
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/candidatures/all');
                setCandidatures(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Chargement...</div>;

    if (candidatures.length === 0) return <div>Aucune candidature pour le moment.</div>;

    return (
        <div>
            <h2>Candidatures Tuteur</h2>
            {candidatures.map(c => (
                <div key={c.id} style={{ border: '1px solid gray', margin: '1em 0', padding: '1em' }}>
                    <p><strong>{c.prenom} {c.nom}</strong> - {c.email}</p>
                    <p><strong>Motivation :</strong> {c.motivation}</p>
                    <p><strong>Matières :</strong> {c.matieres.join(', ')}</p>
                    <p><strong>Fichiers :</strong></p>
                    <ul>
                        {c.documents.map((doc, i) => (
                            <li key={i}>
                                {doc.type} : <a href={`/uploads/candidatures/${c.id}/${doc.filename}`} target="_blank" rel="noopener noreferrer">Voir</a>
                            </li>
                        ))}
                    </ul>
                    {/* Placeholders pour boutons à venir */}
                    <button>Accepter</button>{' '}
                    <button>Refuser</button>
                </div>
            ))}
        </div>
    );
}
