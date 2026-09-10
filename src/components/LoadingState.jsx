export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-dim">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 bg-gold animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="font-body text-sm uppercase tracking-wide">{label}</p>
    </div>
  )
}
