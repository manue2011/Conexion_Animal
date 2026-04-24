const PoliticaPrivacidad = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-5 md:p-8 shadow-md rounded-xl text-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">Política de Privacidad - Conexión Animal</h1>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">1. Responsable del Tratamiento</h2>
          <p className="text-sm md:text-base leading-relaxed">El responsable de los datos recogidos en esta web es el equipo de desarrollo de <strong>Conexión Animal</strong>, con fines exclusivamente educativos para el proyecto de fin de ciclo.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">2. Datos que recogemos</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm md:text-base">
            <li><strong>Registro:</strong> Correo electrónico y contraseña (encriptada).</li>
            <li><strong>Formularios:</strong> Información proporcionada voluntariamente para solicitudes de adopción o gestión de colonias.</li>
            <li><strong>Seguridad:</strong> Datos de navegación procesados por Google reCAPTCHA para evitar ataques.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">3. Finalidad</h2>
          <p className="text-sm md:text-base leading-relaxed">Usamos tus datos para gestionar tu cuenta de usuario, permitirte interactuar con el catálogo de animales y enviarte notificaciones importantes sobre tus solicitudes a través de <strong>SendGrid</strong>.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">4. Terceros que acceden a datos</h2>
          <p className="text-sm md:text-base leading-relaxed">No vendemos tus datos. Sin embargo, utilizamos servicios externos necesarios para el funcionamiento:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm md:text-base">
            <li><strong>Google reCAPTCHA:</strong> Para proteger la web de bots.</li>
            <li><strong>SendGrid:</strong> Para el envío de correos electrónicos.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">5. Tus Derechos</h2>
          <p className="text-sm md:text-base leading-relaxed">Puedes solicitar el acceso, rectificación o eliminación de tu cuenta enviando un correo a nuestro contacto de soporte o directamente desde tu perfil de usuario.</p>
        </section>

        <div className="border-t pt-6 mt-8 text-xs md:text-sm text-gray-500">
          <p>Última actualización: Abril 2026. Esta política ha sido redactada siguiendo las directrices del RGPD.</p>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;