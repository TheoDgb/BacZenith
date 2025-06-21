// import io from 'socket.io-client';
import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const NotesWidget = ({ sujetId, demandeId }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef(null);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('/api/notes', {
                params: {
                    sujet_id: sujetId,
                    demande_id: demandeId
                }
            });
            if (res.data) {
                setNotes(res.data.contenu || '');
            } else {
                setNotes('');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des notes', err);
        }
    };

    const saveNotes = async () => {
        setIsSaving(true);
        try {
            await axios.post('/api/notes', {
                sujet_id: sujetId || null,
                demande_id: demandeId || null,
                contenu: notes
            });
        } catch (err) {
            console.error('Erreur lors de la sauvegarde', err);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen]);

    if (!user || user.role !== 'eleve') return null;

    return (
        <>
            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 999,
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <i className="bi bi-x-lg"></i> : 'Notes'}
            </button>

            {/* Zone de notes */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '1.5rem',
                        right: '1.5rem',
                        width: '40vw',
                        height: '40vh',
                        backgroundColor: '#323232',
                        borderRadius: '1rem',
                        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                        zIndex: 998,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <textarea
                        ref={textareaRef}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Écrivez vos notes ici..."
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            resize: 'none',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            backgroundColor: '#323232',
                            color: '#fff',
                            outline: 'none',
                            borderRadius: '1rem 1rem 0 0'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem' }}>
                        <button
                            onClick={saveNotes}
                            disabled={isSaving}
                            style={{
                                backgroundColor: isSaving ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: isSaving ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotesWidget;
