import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ChangeEmailForm() {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ oldEmail: '', newEmail: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.put(`/api/profils/${user.id}/email`, form);
            setMessage('Email mis à jour');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erreur lors de la mise à jour');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Ancienne adresse</label><br />
            <input type="email" name="oldEmail" onChange={handleChange} className="form-control" required /><br /><br />
            <label>Nouvelle adresse</label><br />
            <input type="email" name="newEmail" onChange={handleChange} className="form-control" required /><br /><br />
            <div className="form-container">
                <button type="submit">Modifier</button>
                {message && <p>{message}</p>}
            </div>
        </form>
    );
}

export default ChangeEmailForm;
