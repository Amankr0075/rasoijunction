const LoadingSkeleton = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const types = {
    text: (
      <div className="space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </div>
    ),
    card: (
      <div className="card p-6 space-y-4">
        <div className="skeleton h-40 w-full rounded-xl" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    ),
    table: (
      <div className="space-y-3">
        <div className="skeleton h-10 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full rounded-lg" />
        ))}
      </div>
    ),
    avatar: (
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
    ),
    stat: (
      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-20 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    ),
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {skeletons.map((i) => (
        <div key={i} className={count > 1 ? 'mb-4' : ''}>
          {types[type]}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
