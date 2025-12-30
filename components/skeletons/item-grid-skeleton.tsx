export function ItemGridSkeleton() {
  return (
    <div className="w-full mt-12">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="glass-card rounded-lg overflow-hidden border border-border/40 shadow-sm animate-pulse"
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-muted" />
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-5 bg-muted rounded w-3/4" />
              
              {/* Price */}
              <div className="h-6 bg-muted rounded w-1/2" />
              
              {/* Location */}
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
