import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MessagerieWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/api/messages/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Erreur récupération conversations:', err);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await axios.get(`/api/messages/conversations/${conversationId}/messages`);
            setMessages(res.data);
            setSelectedConversationId(conversationId);
        } catch (err) {
            console.error('Erreur récupération messages:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post(
                `/api/messages/conversations/${selectedConversationId}/messages`, {
                    content: newMessage
                });

            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Erreur envoi message:', err);
        }
    };

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
                        display: 'flex',
                        overflow: 'hidden'
                    }}
                >
                    {/* Colonne conversations */}
                    <div style={{ width: '40%', borderRight: '1px solid #444', overflowY: 'auto' }}>
                        {conversations.map((conv) => {
                            const otherUser = conv.user1_id === user.id
                                ? conv.user2_nom
                                : conv.user1_nom;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => fetchMessages(conv.id)}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        backgroundColor: conv.id === selectedConversationId ? '#444' : 'transparent',
                                        borderBottom: '1px solid #555',
                                        color: 'white'
                                    }}
                                >
                                    {otherUser}
                                </div>
                            );
                        })}
                    </div>

                    {/* Colonne messages */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', color: 'white' }}>
                            {selectedConversationId ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            textAlign: msg.sender_id === user.id ? 'right' : 'left',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem',
                                                backgroundColor: msg.sender_id === user.id ? '#007bff' : '#555',
                                                borderRadius: '1rem',
                                                color: 'white'
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#bbb' }}>Sélectionnez une conversation</p>
                            )}
                        </div>

                        {/* Envoi message */}
                        {selectedConversationId && (
                            <div style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #444' }}>
                                <input
                                    type="text"
                                    placeholder="Votre message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none' }}
                                />
                                <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>Envoyer</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MessagerieWidget;
