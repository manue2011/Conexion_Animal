import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AnimalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [envioStatus, setEnvioStatus] = useState(null);

  const [formDatos, setFormDatos] = useState({
    mensaje: '',
    telefono: '',
    direccion: '',
    tiene_jardin: false,
    otros_animales: ''
  });

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/animales/public/${id}`);
        setAnimal(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el animal:", error);
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id]);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormDatos({ ...formDatos, [e.target.name]: value });
  };

  const handleAdoptClick = () => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para solicitar una adopción.");
      navigate('/login');
    } else {
      setShowForm(true);
    }
  };

  const handleEnviarSolicitud = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/api/adopciones`,
        { animal_id: animal.id, ...formDatos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnvioStatus('success');
      setShowForm(false);
    } catch (error) {
      setEnvioStatus('error');
      alert(error.response?.data?.message || 'Error al enviar');
    }
  };

  if (loading) return <div className="text-center p-10">Cargando ficha...</div>;
  if (!animal) return <div className="text-center p-10">Animal no encontrado 😕</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">← Volver al listado</Link>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">

        {/* COLUMNA IZQUIERDA: FOTO */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-200 relative shrink-0">
          {animal.foto_url ? (
            <img
              src={animal.foto_url}
              alt={animal.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Sin Foto</div>
          )}
          {animal.urgent && (
            <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold shadow animate-pulse">
              URGENTE
            </span>
          )}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y FORMULARIO */}
        <div className="w-full md:w-1/2 p-5 md:p-8 overflow-y-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{animal.nombre}</h1>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase font-bold mt-2 inline-block">
            {animal.especie}
          </span>

          <p className="text-gray-600 text-base md:text-lg mt-4 leading-relaxed">{animal.descripcion}</p>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div>
              <span className="block text-gray-500 text-sm">Edad</span>
              <span className="text-xl font-semibold">{animal.edad} años</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Estado</span>
              <span className="text-xl font-semibold text-green-600">En Adopción</span>
            </div>
          </div>

          {/* ZONA DE ACCIÓN */}
          <div className="mt-6 md:mt-8">

            {/* CASO 1: YA ENVIADO */}
            {envioStatus === 'success' ? (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center border border-green-200 animate-fade-in">
                <p className="text-2xl mb-2">✅</p>
                <strong>¡Solicitud enviada correctamente!</strong><br />
                La protectora revisará tus datos y te contactará al teléfono que has facilitado.
              </div>
            ) : !showForm ? (
              /* CASO 2: BOTÓN INICIAL */
              <button
                onClick={handleAdoptClick}
                className="w-full bg-blue-600 text-white text-xl font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-1"
              >
                ❤️ Quiero Adoptarlo
              </button>
            ) : (
              /* CASO 3: FORMULARIO */
              <form onSubmit={handleEnviarSolicitud} className="bg-gray-50 p-4 md:p-6 rounded-lg border shadow-inner animate-fade-in text-left">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Datos de Pre-Adopción</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-600 text-xs uppercase font-bold mb-1">Teléfono</label>
                    <input
                      type="tel" name="telefono" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="600..."
                      value={formDatos.telefono} onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs uppercase font-bold mb-1">Ciudad</label>
                    <input
                      type="text" name="direccion" required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Tu dirección"
                      value={formDatos.direccion} onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-600 text-xs uppercase font-bold mb-1">Otros animales en casa</label>
                  <input
                    type="text" name="otros_animales"
                    placeholder="Ej: Un gato de 3 años..."
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formDatos.otros_animales} onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border">
                    <input
                      type="checkbox" name="tiene_jardin"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={formDatos.tiene_jardin} onChange={handleInputChange}
                    />
                    <span className="text-gray-700 text-sm">Dispongo de jardín, patio o terraza segura</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-600 text-xs uppercase font-bold mb-1">Mensaje</label>
                  <textarea
                    name="mensaje" required rows="3"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Cuéntanos por qué eres la familia ideal..."
                    value={formDatos.mensaje} onChange={handleInputChange}
                  />
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold shadow">Enviar Solicitud</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailsPage;