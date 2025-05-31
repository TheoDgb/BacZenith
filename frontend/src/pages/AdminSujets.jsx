import { useEffect, useState } from 'react';
import axios from 'axios';
import FormAjoutSujet from '../components/FormAjoutSujet';


function AdminSujets() {
    const [sujets, setSujets] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const fetchSujets = () => {
        axios.get('http://localhost:5000/api/sujets')
            .then(res => setSujets(res.data.sujets || []))
            .catch(err => console.error('Erreur chargement sujets :', err));
    };

    useEffect(() => {
        fetchSujets();
    }, []);

    return (
        <div>
            <h2>Gestion des Sujets</h2>
            {!showForm && (
                <button onClick={() => setShowForm(true)}>Ajouter un sujet</button>
            )}
            {showForm && (
                <FormAjoutSujet onAjout={fetchSujets} onClose={() => setShowForm(false)} />
            )}



            <ul>
                {sujets.map((s) => (
                    <li key={s.id}>
                        <strong>{s.annee} – {s.matiere}</strong> ({s.serie})
                        <br />
                        {s.fichier_sujet && <span>Sujet OK</span>} – {s.fichier_corrige && <span>Corrigé OK</span>}
                        <br />
                        <button onClick={() => alert(`Modifier ${s.id}`)}>Modifier</button>
                        <button onClick={() => alert(`Supprimer ${s.id}`)}>Supprimer</button>
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default AdminSujets;
