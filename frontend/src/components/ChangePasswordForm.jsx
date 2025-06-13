import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ChangePasswordForm() {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.put(`/api/profils/${user.id}/password`, form);
            setMessage('Mot de passe mis à jour');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erreur lors de la mise à jour');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Ancien mot de passe</label><br />
            <input type="password" name="oldPassword" onChange={handleChange} className="form-control" required /><br /><br />
            <label>Nouveau mot de passe</label><br />
            <input type="password" name="newPassword" onChange={handleChange} className="form-control" required /><br /><br />
            <div className="form-container">
                <button type="submit">Modifier</button>
                {message && <p>{message}</p>}
            </div>
        </form>
    );
}

export default ChangePasswordForm;
