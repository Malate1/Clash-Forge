export default function ErrorState({ message }) {
  return (
    <div className="plate bg-panel border border-hairline px-6 py-10 text-center max-w-lg mx-auto mt-12">
      <p className="font-display text-2xl text-ember mb-2">Lookup failed</p>
      <p className="text-ink-dim text-sm leading-relaxed">
        {message || 'Something went wrong. Check the tag and try again.'}
      </p>
    </div>
  )
}
