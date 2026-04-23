import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobamos si el usuario ya tomó una decisión antes
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (decision) => {
    // Guardamos la decisión (accepted o rejected)
    localStorage.setItem('cookieConsent', decision);
    setIsVisible(false);
    
    if (decision === 'accepted') {
      console.log("Cookies aceptadas: Aquí podrías activar Google Analytics, etc.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-50 shadow-2xl animate-bounce-in">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            🐾 <strong>Conexión Animal</strong> utiliza cookies para mejorar tu experiencia. 
            Al navegar, aceptas nuestra <Link to="/privacidad" className="underline text-blue-400 hover:text-blue-300">política de privacidad</Link>.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleConsent('rejected')}
            className="px-4 py-2 text-sm border border-gray-500 hover:bg-gray-800 rounded transition"
          >
            Rechazar
          </button>
          <button 
            onClick={() => handleConsent('accepted')}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;