import { useState } from 'react';
import axios from 'axios';
import Filter from 'bad-words-es';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const palabrasEs = [
  'follar', 'follador', 'follarse', 'folla', 'follando',
  'gilipollas', 'gilipichis', 'gilipollez',
  'hijo de puta', 'hijoputa', 'hijaputa', 'hija de puta',
  'cabrón', 'cabrona', 'cabrones', 'cabron',
  'puta', 'putas', 'putazo', 'puto', 'putos',
  'coño', 'coños', 'cono',
  'joder', 'jodido', 'jodida', 'jodidos',
  'mierda', 'mierdas',
  'hostia', 'hostias',
  'cojones', 'cojón', 'cojon',
  'maricón', 'maricones', 'maricon',
  'capullo', 'capullos',
  'imbécil', 'imbecil', 'imbéciles',
  'subnormal', 'subnormales',
  'zorra', 'zorras',
  'polla', 'pollas',
  'verga', 'vergas',
  'pendejo', 'pendeja', 'pendejos',
  'chinga', 'chingada', 'chingado',
  'mamada', 'culero', 'culera',
  'porno', 'pornografia', 'pornografía',
  'sexo explicito', 'sexo explícito',
  'prostituta', 'prostitución',
  'pederasta', 'pedófilo', 'pedofilo',
];

const filter = new Filter({ list: palabrasEs });

const ContactoPage = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (filter.isProfane(formData.mensaje) || filter.isProfane(formData.nombre)) {
      setStatus('ofensivo');
      return;
    }

    setStatus('enviando');
    try {
      await axios.post(`${API_URL}/api/contacto`, formData);
      setStatus('exito');
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6 text-center">Contacta con nosotros 🐾</h1>

        {status === 'ofensivo' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 shadow-sm">
            <p className="font-bold text-sm md:text-base">⚠️ Mensaje bloqueado</p>
            <p className="text-xs md:text-sm mt-1">
              Tu mensaje contiene lenguaje inapropiado u ofensivo. Por favor, mantén un tono respetuoso.
            </p>
          </div>
        )}

        {status === 'exito' && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center text-sm md:text-base">
            ¡Mensaje enviado! Te responderemos pronto.
          </p>
        )}
        {status === 'error' && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center text-sm md:text-base">
            Hubo un error. Inténtalo más tarde.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 md:p-8 shadow-lg rounded-xl">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu nombre</label>
            <input
              type="text" placeholder="Ej: María García" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (status === 'ofensivo') setStatus(null);
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu email</label>
            <input
              type="email" placeholder="Ej: maria@email.com" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">¿En qué podemos ayudarte?</label>
            <textarea
              placeholder="Escribe tu mensaje aquí..." required
              className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              value={formData.mensaje}
              onChange={(e) => {
                setFormData({ ...formData, mensaje: e.target.value });
                if (status === 'ofensivo') setStatus(null);
              }}
            />
          </div>
          <button
            type="submit" disabled={status === 'enviando'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md text-sm md:text-base"
          >
            {status === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactoPage;