import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setIsVisible(true);
  }, []);

  const handleConsent = (decision) => {
    localStorage.setItem('cookieConsent', decision);
    setIsVisible(false);
    if (decision === 'accepted') {
      console.log("Cookies aceptadas: Aquí podrías activar Google Analytics, etc.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white px-4 py-4 z-50 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        <p className="text-xs md:text-sm leading-relaxed">
          🐾 <strong>Conexión Animal</strong> utiliza cookies para mejorar tu experiencia.
          Al navegar, aceptas nuestra{' '}
          <Link to="/privacidad" className="underline text-blue-400 hover:text-blue-300">
            política de privacidad
          </Link>.
        </p>

        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => handleConsent('rejected')}
            className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm border border-gray-500 hover:bg-gray-800 rounded-lg transition"
          >
            Rechazar
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;