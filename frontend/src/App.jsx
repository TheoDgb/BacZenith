import { Routes, Route } from 'react-router-dom';
import ListeSujets from './components/ListeSujets';
import SujetDetail from './components/SujetDetail';
import AdminSujets from './pages/AdminSujets.jsx';

function App() {
    return (
        <div className="App">
            <h1>BacZénith</h1>
            <Routes>
                <Route path="/" element={<ListeSujets />} />
                <Route path="/sujets/:id" element={<SujetDetail />} />
                <Route path="/admin/sujets" element={<AdminSujets />} />
            </Routes>
        </div>
    );
}

export default App;