const TerminosCondiciones = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-lg text-gray-800 text-sm md:text-base">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Términos y Condiciones de Uso</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar <strong>Conexión Animal</strong>, aceptas cumplir con estos términos. Este es un proyecto con fines educativos realizado en el IES Virgen de la Paloma.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">2. Uso de la Plataforma</h2>
          <p>La plataforma está destinada a la gestión de adopciones y colonias felinas. Queda prohibido el uso de la misma para cualquier fin ilícito, comercial o que implique maltrato animal.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">3. Registro de Usuarios</h2>
          <p>El usuario se compromete a proporcionar información real y a proteger su contraseña. Nos reservamos el derecho de eliminar cuentas que violen las normas de convivencia de la protectora.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">4. Responsabilidad</h2>
          <p>Conexión Animal actúa como intermediario informativo. No nos hacemos responsables de los acuerdos finales entre particulares y protectoras, ni de la veracidad de los anuncios publicados por terceros.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">5. Propiedad Intelectual</h2>
          <p>Las imágenes de los animales y el contenido del tablón pertenecen a sus respectivos autores o a la plataforma. No se permite su uso fuera de este proyecto sin permiso.</p>
        </section>

        <div className="border-t pt-6 mt-8 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Conexión Animal. Proyecto de Fin de Ciclo.</p>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;