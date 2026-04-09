import { useState } from 'react';
import axios from 'axios';

const ContactoPage = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('enviando');
    try {
      await axios.post('http://localhost:3000/api/contacto', formData);
      setStatus('exito');
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Contacta con nosotros 🐾</h1>
      
      {status === 'exito' && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">¡Mensaje enviado! Te responderemos pronto.</p>}
      {status === 'error' && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">Hubo un error. Inténtalo más tarde.</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-lg rounded-xl">
        <input 
          type="text" placeholder="Tu nombre" required className="w-full p-2 border rounded"
          value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        />
        <input 
          type="email" placeholder="Tu email" required className="w-full p-2 border rounded"
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <textarea 
          placeholder="¿En qué podemos ayudarte?" required className="w-full p-2 border rounded h-32"
          value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
        />
        <button 
          type="submit" disabled={status === 'enviando'}
          className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  );
};

export default ContactoPage;