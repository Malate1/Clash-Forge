export default function StatPanel({ label, value, accent = false }) {
  return (
    <div
      className={`bg-[#0d121d] border-2 rounded-xl px-4 py-3 shadow-inner transition-all duration-200 ${
        accent
          ? 'border-[#ffc800]/80 shadow-[0_0_12px_rgba(255,200,0,0.12)] bg-[#121824]'
          : 'border-slate-700/60'
      }`}
    >
      <p className="font-clash text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 truncate">
        {label}
      </p>
      <p
        className={`font-clash text-2xl font-extrabold leading-none tracking-wide drop-shadow-sm ${
          accent ? 'text-[#ffc800]' : 'text-slate-100'
        }`}
      >
        {value}
      </p>
    </div>
  )
}