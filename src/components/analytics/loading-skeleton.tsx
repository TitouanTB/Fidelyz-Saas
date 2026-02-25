export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-[300px] bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-[300px] bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Cohort table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-[200px] bg-gray-100 rounded"></div>
      </div>

      {/* ROI skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-100 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-[200px] bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}