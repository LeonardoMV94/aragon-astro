import Chart from "react-apexcharts";

const ApexChart = () => {
  const options = {
    chart: { id: "line" },
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
        "2025",
      ],
    },
  };

  const series = [
    {
      name: "Ventas",
      data: [
        20188.71, 19598.51528, 68836.71527, 74419.43158, 37813.77569,
        76939.46869, 95881.80784, 80695.29336, 221900.0691, 98350.2513,
        275608.0273, 30808.30552,
      ],
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-12">
            <h2>Montos que nos han adjudicado </h2>
            <Chart options={options} series={series} type="area" height={350} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApexChart;
