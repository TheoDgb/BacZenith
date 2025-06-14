import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ChangePasswordForm() {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.put(`/api/profils/${user.id}/password`, form);
            setMessage('Mot de passe mis à jour');
            setForm({ oldPassword: '', newPassword: '' });
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erreur lors de la mise à jour');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Ancien mot de passe</label><br />
            <input type={showPassword ? "text" : "password"} name="oldPassword" value={form.oldPassword} onChange={handleChange} className="form-control" required /><br /><br />
            <label>Nouveau mot de passe</label><br />
            <input type={showPassword ? "text" : "password"} name="newPassword" value={form.newPassword} onChange={handleChange} className="form-control" required /><br /><br />
            <button type="button" onClick={toggleShowPassword}>
                {showPassword ? "Masquer les mots de passe" : "Afficher les mots de passe"}
            </button><br /><br />
            <div className="form-container">
                <button type="submit">Modifier</button>
                {message && <p>{message}</p>}
            </div>
        </form>
    );
}

export default ChangePasswordForm;
