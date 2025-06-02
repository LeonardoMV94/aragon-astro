import { useState,useEffect } from "react";
import Chart from "react-apexcharts";
import ChartFallback from "./ChartFallback";


const ApexChart = () => {
  const [isBrowser, setIsBrowser] = useState(false);


  const options = {
    chart: {
      id: "line",
      toolbar: {
        show: false, // 👈 Esto oculta el toolbar
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
    },
    colors: ["#f09300", "#E91E63"],
    grid:{
      padding: {
        right: 40, // Ajusta este valor según sea necesario
        left: 20,
        top: 0,
        bottom: 0,
      },
    },
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `UF ${Math.round(val).toLocaleString()}`;
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value).toLocaleString(); // Usa separador de miles y sin decimales
        },
      },
    },
    xaxis: {
      categories: [
        "2013",
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
      ],
    },
  };

  const series = [
    {
      name: "Monto de adjudicación en UF",
      data: [
        20188.71, 19598.51528, 68836.71527, 74419.43158, 37813.77569,
        76939.46869, 95881.80784, 80695.29336, 221900.0691, 98350.2513,
        275608.0273,
      ],
    },
  ];

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) return <ChartFallback />;

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-12">
            <h2>Montos que nos han adjudicado </h2>
            {/* El padding de Tailwind aquí es para el contenedor externo,
                útil para el layout general, pero no para el corte interno del gráfico */}
            <div className=" md:px-4 md:py-2 rounded-xl shadow-xl">

              <Chart
                options={options}
                series={series}
                type="area"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApexChart;
