import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-gray-700 mt-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* PARTE SUPERIOR COMPACTA: Marca y Enlaces */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-x-8 gap-y-6 pb-6">
          
          {/* Columna 1: Marca (Más compacta) */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-1.5">
              Conexión Animal <span className="text-gray-400 text-lg">🐾</span>
            </h3>
            <p className="text-sm text-gray-600 max-w-sm">
              Proyecto para la gestión de colonias y adopciones.
            </p>
          </div>

          {/* Columna 2: Enlaces (Más pequeños y alineados) */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              ENLACES LEGALES
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacidad" className="text-sm hover:text-blue-600 transition duration-150">
                  Política de Privacidad
                </Link>
              </li>
              <li>
               <Link to="/terminos" className="text-sm hover:text-blue-600 transition duration-150">
                    Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* LÍNEA DIVISORA SUTIL */}
        <hr className="border-gray-200" />

        {/* PARTE INFERIOR: Copyright (Muy sutil y centrado) */}
        <div className="pt-6">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Conexión Animal 
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;