import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* SUPERIOR: Marca y enlaces */}
        <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-x-8 gap-y-5 pb-6">

          {/* Marca */}
          <div className="space-y-1">
            <h3 className="text-base md:text-xl font-semibold text-blue-600 flex items-center gap-1.5">
              Conexión Animal <span className="text-gray-400">🐾</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-sm">
              Proyecto para la gestión de colonias y adopciones.
            </p>
          </div>

          {/* Enlaces legales */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Enlaces Legales
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacidad" className="text-xs md:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-150">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-xs md:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-150">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Copyright */}
        <div className="pt-4 md:pt-6">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Conexión Animal — Proyecto de Fin de Ciclo · IES Virgen de la Paloma
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;