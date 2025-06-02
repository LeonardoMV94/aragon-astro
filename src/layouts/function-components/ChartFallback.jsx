// components/ChartFallback.jsx
export default function ChartFallback() {
  return (
    <div className="w-full h-[350px] bg-gray-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-pulse">
          <div className="h-10 w-10 bg-[#f09300] rounded-full mb-3 mx-auto"></div>
          <p className="text-gray-500 text-sm">Cargando gráfico...</p>
        </div>
      </div>
    </div>
  );
}
