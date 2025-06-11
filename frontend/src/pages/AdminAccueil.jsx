import { Link } from 'react-router-dom';

export default function AdminAccueil() {
    return (
        <div>
            <h2>Bienvenue sur l’Espace Admin</h2>
            <ul>
                <li><Link to="/admin/sujets">Gérer les sujets</Link></li>
                <li><Link to="/admin/candidatures">Gérer les candidatures tuteur</Link></li>
            </ul>
        </div>
    );
}
