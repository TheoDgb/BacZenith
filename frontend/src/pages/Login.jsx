import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/');  // redirige vers page d’accueil après connexion
        } else {
            setError(result.error);
        }
    };

    return (
        <div>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-control"
                        required />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-control"
                        required />
                </div>
                <br />
                <div className="form-container">
                    <button type="submit">Se connecter</button>
                </div>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
