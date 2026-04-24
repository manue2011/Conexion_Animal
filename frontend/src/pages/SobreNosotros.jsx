const SobreNosotros = () => {
  return (
    <div className="bg-white min-h-screen">

      {/* Cabecera */}
      <div className="bg-gray-50 py-10 md:py-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestra Historia 🐾</h1>
          <p className="text-base md:text-lg text-gray-600">Uniendo tecnología y bienestar animal en el corazón de Madrid.</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto py-10 md:py-16 px-4 space-y-10 md:space-y-12">

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-4">¿Qué es Conexión Animal?</h2>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
            Conexión Animal es una plataforma integral diseñada para transformar la gestión de las colonias
            felinas y facilitar los procesos de adopción. Nuestro objetivo es crear una red colaborativa
            donde protectoras, gestores y ciudadanos puedan trabajar juntos por el bienestar animal.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-blue-50 p-5 md:p-6 rounded-2xl">
            <h3 className="font-bold text-blue-800 mb-2">Nuestra Misión</h3>
            <p className="text-sm text-blue-900">Dar voz a quienes no la tienen y profesionalizar el seguimiento de los animales callejeros.</p>
          </div>
          <div className="bg-green-50 p-5 md:p-6 rounded-2xl">
            <h3 className="font-bold text-green-800 mb-2">Proyecto Educativo</h3>
            <p className="text-sm text-green-900">Desarrollado con pasión como proyecto de fin de ciclo en el IES Virgen de la Paloma.</p>
          </div>
        </section>

        <section className="text-center pt-6 md:pt-8">
          <blockquote className="space-y-4">
            <p className="italic text-lg md:text-xl text-gray-500 leading-relaxed">
              "La grandeza de una nación y su progreso moral pueden ser juzgados por la forma en que se trata a sus animales."
            </p>
            <footer className="text-gray-400 font-medium text-sm md:text-base">
              — Mahatma Gandhi
            </footer>
          </blockquote>
        </section>
      </div>
    </div>
  );
};

export default SobreNosotros;