// Archivo: frontend/src/pages/admin/ModeracionTablonPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const ModeracionTablonPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NUEVO: Controla qué pestaña estamos viendo ('pending' o 'approved')
  const [vistaActual, setVistaActual] = useState('pending');

  useEffect(() => {
    fetchPosts();
  }, [vistaActual]); // Se vuelve a ejecutar si cambias de pestaña

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Le pasamos el estado que queremos ver por la URL
      const response = await axios.get(`http://localhost:3000/api/posts/superadmin/moderate?estado=${vistaActual}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar posts:", err);
      setError("No se pudo cargar la lista de publicaciones.");
      setLoading(false);
    }
  };

  const handleModerar = async (id, nuevoEstado) => {
    if (nuevoEstado === 'rejected') {
      if (!window.confirm('✨ ¿Esta petición de ayuda ya ha sido resuelta? Se archivará y dejará de ser pública.')) return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/api/posts/superadmin/moderate/${id}`,
        { nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      alert("Hubo un error al intentar cambiar el estado de la publicación.");
    }
  };

  // NUEVA FUNCIÓN: Eliminar definitivamente
  const handleEliminar = async (id) => {
    if (!window.confirm('🚨 ¿PELIGRO! Vas a borrar esta publicación de la base de datos para siempre. ¿Continuar?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/posts/superadmin/moderate/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Lo quitamos de la pantalla
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      alert("Hubo un error al intentar eliminar la publicación.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
      
      {/* Cabecera y Pestañas */}
      <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión del Tablón</h2>
          <p className="text-gray-500 text-sm mt-1">Aprueba nuevos posts o elimina los antiguos.</p>
        </div>

        {/* SELECTOR DE VISTA */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setVistaActual('pending')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition ${vistaActual === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Nuevos (Pendientes)
          </button>
          <button 
            onClick={() => setVistaActual('approved')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition ${vistaActual === 'approved' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Públicos (Aprobados)
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 py-8 animate-pulse">Cargando datos...</p>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">
            {vistaActual === 'pending' ? 'No hay publicaciones nuevas para revisar. ¡Todo al día!' : 'No hay publicaciones activas en el tablón en este momento.'}
          </p>
        </div>
      )}

      {/* Lista de Posts */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post.id} className={`border rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition ${vistaActual === 'approved' ? 'border-green-200' : 'border-gray-200'}`}>
            
            <div className="flex-1 mb-4 md:mb-0 pr-4 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{post.titulo}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                  {post.categoria.replace('_', ' ')}
                </span>
                {post.codigo_postal && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">📍 CP: {post.codigo_postal}</span>}
              </div>
              <p className="text-gray-700 text-sm mb-3 bg-white p-3 border border-gray-100 rounded">{post.contenido}</p>
              <div className="text-xs text-gray-500 flex items-center gap-4">
                <span>👤 <span className="font-semibold">{post.autor_email}</span></span>
                <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN DINÁMICOS */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {vistaActual === 'pending' ? (
                <>
                  <button onClick={() => handleModerar(post.id, 'approved')} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm text-sm">✅ Aprobar</button>
                  <button onClick={() => handleModerar(post.id, 'rejected')} className="flex-1 bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded-lg font-bold hover:bg-gray-100 shadow-sm text-sm">❌ Rechazar</button>
                </>
              ) : (
                <>
                
                  <button onClick={() => handleModerar(post.id, 'rejected')} className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-bold hover:bg-yellow-200 transition text-sm">🙈 Finalizar y Resolver</button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeracionTablonPage;