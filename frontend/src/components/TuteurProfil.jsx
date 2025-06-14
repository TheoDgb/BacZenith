import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function TuteurProfil() {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [profil, setProfil] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        disponibilites: '',
        tarif: '',
        matieres: []
    });

    useEffect(() => {
        const fetchProfil = async () => {
            const res = await fetch(`/api/profils/${user.id}/tuteur`);
            const data = await res.json();
            setProfil(data);
            setFormData({
                description: data.description || '',
                disponibilites: data.disponibilites || '',
                tarif: data.tarif || '',
                matieres: data.matieres || []
            });
        };
        if (user.role === 'tuteur') fetchProfil();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/api/profils/${user.id}/tuteur`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setMessage('Profil tuteur mis à jour avec succès.');
        } catch (err) {
            setMessage("Erreur lors de la mise à jour du profil tuteur.");
        }
    };

    const handleMatiereChange = (e) => {
        setFormData({ ...formData, matieres: e.target.value.split(',').map(m => m.trim()) });
    };

    return (
        <div>
            <hr />
            <h3>Informations du profil tuteur public</h3>
            <form onSubmit={handleSubmit}>
                <label>Matières liées à votre profil tuteur :</label>
                <ul>
                    {formData.matieres.map((matiere, index) => (
                        <li key={index}>{matiere}</li>
                    ))}
                </ul>
                <label>Description :</label><br />
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="form-control"
                /><br /><br />
                <label>Disponibilités :</label><br />
                <textarea
                    value={formData.disponibilites}
                    onChange={e => setFormData({ ...formData, disponibilites: e.target.value })}
                    rows={3}
                    className="form-control"
                /><br /><br />
                <label>Tarif (optionnel) :</label><br />
                <input
                    type="text"
                    value={formData.tarif}
                    onChange={e => setFormData({ ...formData, tarif: e.target.value })}
                    className="form-control"
                /><br /><br />
                <div className="form-container">
                    <button type="submit">Mettre à jour</button>
                    {message && <p>{message}</p>}
                </div>
            </form>
        </div>
    );
}

export default TuteurProfil;
