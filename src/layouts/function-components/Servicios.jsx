const Servicios = ({ servicios }) => {
  return (
    // Reemplaza col-12 con un div contenedor que define el grid
    <div className="w-full"> {/* w-full para asegurar que ocupe todo el ancho disponible */}
      {/* Reemplaza row con grid y define las columnas y el espacio (gap) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"> {/* gap-6 añade 24px de espacio entre las cards */}
        {servicios.map((item, i) => {
          return (
            // Elimina lg:col-6 de aquí, ya que el contenedor padre (grid) ya define las columnas
            // Añade shadow-md para una sombra base y hover:shadow-xl para una sombra más pronunciada al hacer hover
            <div
              className="bg-white rounded-lg shadow-md
                         transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl" // Añadida shadow-xl para la sombra de hover
              key={`item-${i}`}
            >
              <div
                className={`flex items-center space-x-4 px-6 py-8
                            ${
                              servicios.length - 1 === i && servicios.length % 2 !== 0 // Si es la última card y hay un número impar de cards
                                ? "mb-0" // No margin-bottom
                                : "mb-0" // El gap ya maneja el espacio vertical, no necesitamos mb-6 aquí
                            }
                            `} // Eliminado rounded-lg de aquí, ya lo tiene el div padre de la card
              >
                <div className="relative inline-flex h-24 w-24 items-center justify-center p-3">
                  <span className="project-icon text-[#FA7398]">
                    <img
                      className="absolute left-0 top-0" // Cambiado 'class' a 'className' para React/Astro JSX
                      src={`/images/servicios/${item.icon}`}
                      alt={item.title} // Añadido alt para accesibilidad
                      width="90"
                      height="90"
                    />
                  </span>
                </div>
                <div>
                  <h3 className="h5 font-primary">{item.title}</h3>
                  <p className="mt-4">{item.content} </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Servicios;
