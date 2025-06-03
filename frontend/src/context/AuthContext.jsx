import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Configure axios avec le token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Récupérer les infos utilisateur (endpoint /api/auth/me)
            axios.get('/api/auth/me')
                .then(res => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    logout(); // token invalide, déconnexion
                    setLoading(false);
                });
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    // Fonction login
    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setToken(res.data.token);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Erreur login' };
        }
    };

    // Fonction logout
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
