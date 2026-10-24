export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 leading-none ${className}`}>
      <span className="font-display text-[1.65em] italic text-gold">Don</span>
      <span className="flex flex-col">
        <span className="font-sans text-[0.62em] font-bold uppercase tracking-[0.42em]">Corte Fino</span>
        <span className="mt-1 hidden whitespace-nowrap font-sans text-[0.42em] font-medium uppercase tracking-[0.5em] text-muted sm:block">Wagyu Butchery</span>
      </span>
    </span>
  )
}
