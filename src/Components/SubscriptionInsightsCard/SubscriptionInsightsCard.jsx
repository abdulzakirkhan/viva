export default function SubscriptionInsightsCard({ highest ,title}) {
  if (!highest) return null;

  return (
    <div className="w-full h-64 bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>
        {/* <span className="text-lg flex items-center gap-2 text-gray-600">
          <FaUsers className="" /> {highest?.subscribersCount} Subscribers
        </span> */}
      </div>

      {/* Package Info */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{highest?.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{highest?.description}</p>
      </div>

      {/* Price + Tier */}
      <div className="flex items-center gap-3">
        <span className="text-green-600 font-medium">💲 {highest?.price}</span>
        <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
          {highest?.tier}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center text-gray-700">
          Total Mock Minutes: {highest?.totalMockMinutes}
        </div>
        <div className="flex items-center text-gray-700">
          Total Live Minutes: ({highest?.totalLiveMinutes})
        </div>
      </div>
    </div>
  );
}
