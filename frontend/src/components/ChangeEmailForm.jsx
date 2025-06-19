import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // adapte le chemin si besoin

const MessagerieWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    // Si non connecté → ne pas afficher le bouton
    if (!user) return null;

    return (
        <>
            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 1000,
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}
            >
                Messagerie
            </button>

            {/* Fenêtre popup */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '5rem',
                        right: '1rem',
                        width: '50vw',
                        height: '50vh',
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        padding: '1rem',
                        zIndex: 1000,
                        overflow: 'auto',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Messagerie</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                            }}
                        >
                            ✖
                        </button>
                    </div>

                    <p>Ici apparaîtra la messagerie en temps réel.</p>
                </div>
            )}
        </>
    );
};

export default MessagerieWidget;
