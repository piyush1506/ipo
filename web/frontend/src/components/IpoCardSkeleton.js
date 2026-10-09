export default function IpoCardSkeleton() {
  return (
    <div className="groww-card p-5 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl shadow-2xs">
      <div>
        {/* Top Header: Avatar + Title lines + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Title line */}
              <div className="h-4 w-3/4 rounded-md skeleton" />
              {/* Subtitle / dates line */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 rounded skeleton" />
                <div className="h-3 w-12 rounded skeleton" />
              </div>
            </div>
          </div>
          {/* Status chip skeleton */}
          <div className="w-16 h-5 rounded-md skeleton shrink-0" />
        </div>

        {/* Metrics Box */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-3.5">
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 rounded skeleton" />
            <div className="h-4 w-24 rounded skeleton" />
            <div className="h-2.5 w-20 rounded skeleton" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-14 rounded skeleton" />
            <div className="h-4 w-24 rounded skeleton" />
            <div className="h-2.5 w-16 rounded skeleton" />
          </div>
        </div>

        {/* Subscription Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="h-3 w-24 rounded skeleton" />
            <div className="h-3 w-8 rounded skeleton" />
          </div>
          <div className="w-full h-2 rounded-full skeleton" />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 h-8 rounded-lg skeleton" />
        <div className="w-8 h-8 rounded-lg skeleton shrink-0" />
      </div>
    </div>
  );
}
