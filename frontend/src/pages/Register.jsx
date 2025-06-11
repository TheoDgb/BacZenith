import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/register', { email, password, nom, prenom });
            navigate('/login');  // redirige vers login après inscription
        } catch (err) {
            console.error('Erreur inscription:', err.response || err.message);
            setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
        }

    };

    return (
        <div>
            <h2>Créer un compte élève</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
                    <br />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
                    <br />
                    <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} className="form-control" required />
                    <br />
                    <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} className="form-control" required />
                </div>
                <br />
                <div className="form-container">
                    <button type="submit">S'inscrire</button>
                </div>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>
                Vous êtes tuteur ? <Link to="/devenir-tuteur">Candidater comme tuteur</Link>
            </p>
        </div>
    );
}
