//page KPI (src/pages/KPI.jsx)
export default function KPI() {
  const metrics = {
    totalAgreements: 12,
    syncedWithERP: 10,
    unsynced: 2,
    averageRating: 4.2,
    avgCarbonFootprint: 115,
    avgEnergyUse: 310,
    recycledMaterial: "68%",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📊 KPI & Sustainability Metrics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="bg-white shadow-md p-4 rounded-lg">
            <p className="text-gray-500 text-sm">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}