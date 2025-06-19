import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const MessagerieWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null; // Ne rien afficher si non connecté

    return (
        <>
            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    zIndex: 999,
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-send"></i>}
            </button>

            {/* Fenêtre de messagerie */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        width: '45vw',
                        height: '50vh',
                        backgroundColor: '#323232',
                        borderRadius: '1rem',
                        boxShadow: '0 0 20px rgba(0,0,0,0.25)',
                        zIndex: 998,
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{flex: 1, marginTop: '1rem', overflowY: 'auto'}}>
                        INTERFACE ICI
                    </div>
                </div>
            )}
        </>
    );
};

export default MessagerieWidget;
