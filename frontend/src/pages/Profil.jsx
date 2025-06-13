import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChangeEmailForm from '../components/ChangeEmailForm';
import ChangePasswordForm from '../components/ChangePasswordForm';

function Profil() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <p>Chargement du profil...</p>;

    if (!user) return <p>Utilisateur non connecté</p>; // ou redirect vers login

    return (
        <div>
            <h2>Profil {user.role}</h2>
            <p>Bienvenue, {user.prenom} {user.nom}</p>
            <hr />
            <h3>Modifier l'adresse email</h3>
            <ChangeEmailForm />
            <hr />
            <h3>Modifier le mot de passe</h3>
            <ChangePasswordForm />
        </div>
    );
}

export default Profil;
