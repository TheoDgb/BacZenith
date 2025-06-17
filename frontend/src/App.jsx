import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import DevenirTuteur from './pages/DevenirTuteur.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import ListeSujets from './components/ListeSujets';
import SujetDetail from './components/SujetDetail';
import DemanderAideTuteur from './pages/DemanderAideTuteur.jsx';
import AiderEleve from './pages/AiderEleve.jsx';
import AdminAccueil from './pages/AdminAccueil.jsx';
import AdminSujets from './pages/AdminSujets.jsx';
import AdminCandidatures from './pages/AdminCandidatures.jsx';
import Profil from "./pages/Profil.jsx";


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
                        {user.role === 'eleve' && (
                            <>
                                <Link to="/profils">Profil élève</Link> |{' '}
                                <Link to="/demanderAideTuteur">Demander de l'aide</Link> |{' '}
                            </>
                        )}
                        {user.role === 'tuteur' && (
                            <>
                                <Link to="/profils">Profil tuteur</Link> |{' '}
                                <Link to="/aiderEleve">Aider un élève</Link> |{' '}
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin">Admin</Link> |{' '}
                            </>
                        )}
                        <span>Connecté: {user.prenom} {user.nom} ({user.role})</span> |{' '}
                        <button onClick={logout}>Déconnexion</button>
                    </>
                )}
            </nav>
            <Routes>
                {/* Routes publiques */}
                <Route path="/devenir-tuteur" element={<DevenirTuteur />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ListeSujets />} />
                <Route path="/sujets/:id" element={<SujetDetail />} />

                {/*Routes users*/}
                <Route
                    path="/profils"
                    element={
                        <PrivateRoute allowedRoles={['eleve', 'tuteur', 'admin']}>
                            <Profil />
                        </PrivateRoute>
                    }
                />

                {/*Routes élèves*/}
                <Route
                    path="/demanderAideTuteur"
                    element={
                        <PrivateRoute allowedRoles={['eleve', 'admin']}>
                            <DemanderAideTuteur />
                        </PrivateRoute>
                    }
                />

                {/*Routes tuteurs*/}
                <Route
                    path="/aiderEleve"
                    element={
                        <PrivateRoute allowedRoles={['tuteur', 'admin']}>
                            <AiderEleve />
                        </PrivateRoute>
                    }
                />

                {/* Route protégée (admin uniquement) */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminAccueil />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/sujets"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminSujets />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/candidatures"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminCandidatures />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
