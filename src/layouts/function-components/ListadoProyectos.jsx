import { humanize } from "@/lib/utils/textConverter";
import { useState, useEffect } from "react";

const normalizarUF = (uf) => {
  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "decimal",
    currency: "CLP",
  });
  const nUF = parseInt(uf);
  if (isNaN(nUF)) {
    return clpFormat.format(0);
  }

  return clpFormat.format(nUF);
};

const ListadoProyectos = ({ projects, categories }) => {
  const [tab, setTab] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of projects to display per page

  // filterPost will contain projects where the 'categories' array includes the selected tab
  const filterPost = !tab
    ? projects
    : projects.filter((post) => post.data.categories.includes(tab));

  // Reset current page to 1 when the category tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  // Calculate the projects to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filterPost.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(filterPost.length / itemsPerPage);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-12">
            <h2 id="proyectos">Proyectos en los que hemos trabajado</h2>
            <p className="mt-4">... y en los que estamos trabajando</p>

            <ul className="filter-list mt-8 flex flex-wrap items-center justify-center">
              <li>
                <span
                  className={`filter-btn ${
                    !tab ? "filter-btn-active" : undefined
                  } btn btn-sm cursor-pointer`}
                  onClick={() => setTab("")}
                >
                  Todas las categorias
                </span>
              </li>
              {categories.map((category, i) => (
                <li key={`category-${i}`} onClick={() => setTab(category)}>
                  <span
                    className={`filter-btn ${
                      tab === category ? "filter-btn-active shadow-xl" : undefined
                    } btn btn-sm cursor-pointer`}
                  >
                    {humanize(category)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="row mt-12">
          {/* Map over the filtered projects for the current page */}
          {currentProjects.map((post, i) => (
            <div className="mb-8 md:col-12" key={`post-${i}`}>
              <div className="rounded-xl bg-white p-5 shadow-lg lg:p-5">
                <p className="text-xl">{post.data.title}</p>
                <p className="text-xl text-black">{post.data.excerpt}</p>
                <ul className="mt-2 flex flex-wrap items-center text-text-dark">
                  <li className="my-1 mr-8 inline-flex items-center">
                    <span className="material-symbols-outlined mr-1">person</span>
                    {post.data.location}
                  </li>
                  <li className="my-1 mr-8 inline-flex items-center">
                    {post.data.job_nature}
                  </li>
                  {post.data.monto !== undefined && normalizarUF(post.data.monto) !== "0" && (
                    <li className="my-1 mr-8 inline-flex items-center">
                      Monto: UF {normalizarUF(post.data.monto)}
                    </li>
                  )}
                  {post.data.calificacion !== undefined &&
                    post.data.calificacion !== "NO" &&
                    post.data.calificacion !== "PROVISORIA" &&
                    post.data.calificacion !== "EJECUCIÓN" &&
                    post.data.calificacion !== "PENDIENTE" && (
                      <li className="my-1 mr-8 inline-flex items-center">
                        Puntuación: {post.data.calificacion}
                      </li>
                    )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filterPost.length > itemsPerPage && (
          <div className="flex justify-center mt-8">
            <nav>
              <ul className="inline-flex -space-x-px text-base h-10">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-4 h-10 ms-0 leading-tight bg-white text-gray-700 border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-900"
                  >
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => paginate(i + 1)}
                      className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                        currentPage === i + 1
                          ? "z-10 bg-[#f09300] text-white border-[#f09300] hover:bg-orange-600 hover:text-white" // Estilo para página activa
                          : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Estilo para páginas inactivas
                      }`}
                    >
                      <a href="#proyectos">
                      {i + 1}
                      </a>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-4 h-10 leading-tight bg-white text-gray-700 border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-900"
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};

export default ListadoProyectos;
