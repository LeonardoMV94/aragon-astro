import { humanize } from "@/lib/utils/textConverter";
import { useState } from "react";

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
}

// Renamed component function
const ListadoProyectos = ({ projects, categories }) => {
  const [tab, setTab] = useState("");
  // filterPost will contain projects where the 'categories' array includes the selected tab
  const filterPost = !tab
    ? projects
    : projects.filter((post) => post.data.categories.includes(tab));

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-12">
            {/* Assumes career object has title and subtitle */}
            <h2 >Proyectos en los que hemos trabajado</h2>
            <p
              className="mt-4"
            >... y en los que estamos trabajando</p>

            <ul className="filter-list mt-8 flex flex-wrap items-center justify-center">
              {/* Button to show all categories */}
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
              {/* Buttons for unique categories received from the Astro page */}
              {categories.map((category, i) => (
                <li key={`category-${i}`} onClick={() => setTab(category)}>
                  <span
                    className={`filter-btn ${
                      tab === category ? "filter-btn-active" : undefined
                    } btn btn-sm cursor-pointer`}
                  >
                    {humanize(category)} {/* humanize likely formats the category string */}
                  </span>
                </li>
              ))}
            </ul>

          </div>
        </div>
        <div className="row mt-12">
          {/* Map over the filtered projects */}
          {filterPost.map((post, i) => (
            <div className="mb-8 md:col-12" key={`post-${i}`}>
              <div className="rounded-xl bg-white p-5 shadow-lg lg:p-5">
                {/* Accessing data fields from the processed object */}
                <p className="text-xl">{post.data.title}</p>
                <p className=" text-xl text-black">{post.data.excerpt}</p>
                <ul className="mt-2 flex flex-wrap items-center text-text-dark">

                  {/* Displaying location (Mandante) */}
                  <li className="my-1 mr-8 inline-flex items-center">
                    <span className="material-symbols-outlined mr-1">
                    person
                    </span>
                    {post.data.location}
                  </li>
                  <li className="my-1 mr-8 inline-flex items-center">

                    {post.data.job_nature}
                  </li>

                {
                  post.data.monto !== undefined
                  && normalizarUF(post.data.monto) !== '0'
                  && (
                    <li className="my-1 mr-8 inline-flex items-center">
                      Monto: UF {normalizarUF(post.data.monto)}
                    </li>
                  )
                }
                {post.data.calificacion !== undefined
                    && post.data.calificacion !== 'NO'
                    && post.data.calificacion !== 'PROVISORIA'
                    && post.data.calificacion !== 'EJECUCIÓN'
                    && post.data.calificacion !== 'PENDIENTE'
                    &&  (
                    <li className="my-1 mr-8 inline-flex items-center">
                    Puntuación: {post.data.calificacion}
                    </li>
                )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Renamed export statement
export default ListadoProyectos;
