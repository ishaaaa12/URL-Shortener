function StatsCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-black text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

export default StatsCard;