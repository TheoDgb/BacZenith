import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function SujetDetail() {
    const { id } = useParams();
    const [sujet, setSujet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/sujets/${id}`)
            .then(res => {
                setSujet(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors de la récupération du sujet :', err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Chargement...</p>;
    if (!sujet) return <p>Sujet introuvable.</p>;

    // Chemins locaux vers les fichiers PDF
    const sujetPdf = sujet.fichier_sujet
        ? `/pdf/sujets/${sujet.fichier_sujet}`
        : null;

    const corrigePdf = sujet.fichier_corrige
        ? `/pdf/corriges/${sujet.fichier_corrige}`
        : null;

    return (
        <div>
            <h2>{sujet.annee} - {sujet.matiere}</h2>
            <p>Série : {sujet.serie}</p>
            <p>Spécialité : {sujet.specialite || 'N/A'}</p>
            <p>Épreuve : {sujet.epreuve}</p>
            <p>Session : {sujet.session}</p>
            <p>{sujet.num_sujet ? `${sujet.num_sujet}` : <br />}</p>

            {/* Sujet PDF */}
            {sujetPdf ? (
                <>
                    <h3>Sujet :</h3>
                    <iframe
                        src={sujetPdf}
                        width="150%"
                        height="985"
                        title="Sujet PDF"
                    />
                    <a href={sujetPdf} download target="_blank" rel="noopener noreferrer">
                        Télécharger le sujet
                    </a>
                </>
            ) : (
                <p>Aucun fichier de sujet disponible.</p>
            )}

            <hr />

            {/* Corrigé PDF */}
            {corrigePdf ? (
                <>
                    <h3>Corrigé :</h3>
                    <iframe
                        src={corrigePdf}
                        width="100%"
                        height="600px"
                        title="Corrigé PDF"
                    />
                    <a href={corrigePdf} download target="_blank" rel="noopener noreferrer">
                        Télécharger le corrigé
                    </a>
                </>
            ) : (
                <p>Aucun corrigé disponible pour ce sujet.</p>
            )}
        </div>
    );
}

export default SujetDetail;
