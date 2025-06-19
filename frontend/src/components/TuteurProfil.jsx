import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function TuteurProfil() {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [profil, setProfil] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        disponibilites: '',
        tarif: 'Service gratuit',
        matieres: [],
        is_certified: false,
        visible: true
    });

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const res = await axios.get(`/api/profils/${user.id}/tuteur`);
                const data = res.data;
                setProfil(data);
                setFormData({
                    description: data.description || '',
                    disponibilites: data.disponibilites || '',
                    tarif: data.tarif || 'Service gratuit',
                    matieres: data.matieres || [],
                    is_certified: data.is_certified || false,
                    visible: data.visible || true
                });
            } catch (err) {
                console.error(err);
            }
        };
        if (user.role === 'tuteur') fetchProfil();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/profils/${user.id}/tuteur`, formData);
            setFormData(prev => ({
                ...prev,
                tarif: prev.tarif.trim() === '' ? 'Service gratuit' : prev.tarif
            }));
            setMessage('Profil tuteur mis à jour avec succès.');
        } catch (err) {
            setMessage("Erreur lors de la mise à jour du profil tuteur.");
        }
    };


    return (
        <div>
            <hr />
            <h3>Informations du profil tuteur public</h3>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="checkbox"
                        checked={formData.visible}
                        onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                    />
                    Rendre mon profil visible dans les demandes d’aides
                </label>
                <p style={{ color: 'gray', fontStyle: 'italic' }}>
                    Décocher (masquer votre profil) peut s'avérer utile si vous êtes surchargé de demandes d'aide.
                </p>
                <br />
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
                    className="form-control textarea"
                /><br /><br />
                <label>Disponibilités :</label><br />
                <textarea
                    value={formData.disponibilites}
                    onChange={e => setFormData({ ...formData, disponibilites: e.target.value })}
                    rows={3}
                    className="form-control textarea"
                /><br /><br />
                <label>Tarif (optionnel) :</label><br />
                <input
                    type="text"
                    value={formData.tarif}
                    onChange={e => setFormData({ ...formData, tarif: e.target.value })}
                    className="form-control"
                    disabled={!formData.is_certified}
                />
                {!formData.is_certified ? (
                    <p style={{ color: 'gray', fontStyle: 'italic' }}>
                        Vous devez être certifié pour pouvoir fixer un tarif.
                    </p>
                ) : (
                    <>
                        <br /><br />
                    </>
                )}
                <div className="form-container">
                    <button type="submit">Mettre à jour</button>
                    {message && <p>{message}</p>}
                </div>
            </form>
        </div>
    );
}

export default TuteurProfil;
