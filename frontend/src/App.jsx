import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';

import Login from './pages/Login';
import Register from './pages/Register';
import ListeSujets from './components/ListeSujets';
import SujetDetail from './components/SujetDetail';
import AdminSujets from './pages/AdminSujets.jsx';

function PrivateRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Chargement...</div>;

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    const { user, logout } = useContext(AuthContext);
    return (
        <div className="App">
            <h1>BacZénith</h1>
            <nav>
                <Link to="/">Sujets</Link> |{' '}

                {!user ? (
                    <>
                        <Link to="/login">Connexion</Link> |{' '}
                        <Link to="/register">Créer un compte</Link>
                    </>
                ) : (
                    <>
                        <span>Bienvenue {user.prenom} {user.nom} ({user.role})</span> |{' '}
                        <button onClick={logout}>Déconnexion</button>
                    </>
                )}
            </nav>
            <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ListeSujets />} />
                <Route path="/sujets/:id" element={<SujetDetail />} />

                {/* Route protégée (admin uniquement) */}
                <Route
                    path="/admin/sujets"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminSujets />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
