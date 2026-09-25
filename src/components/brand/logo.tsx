import { cn } from '@/lib/utils'

const CYAN = '#3BE8D0'
const AMBER = '#E8B04B'
/** Chevron opacities from the hex outward, as in the Penpot logo. */
const TRAIL = [0.7, 0.45, 0.2]

/** The hex and chevron trail, drawn at the height of the wordmark's capitals. */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 192.08 27.36" fill="none" aria-hidden className={className}>
      {TRAIL.map((opacity, i) => (
        <g key={i} stroke={CYAN} strokeWidth={3.28} strokeOpacity={opacity}>
          <path d={`M${43.78 - i * 15.05},1.64L${31.74 - i * 15.05},13.68L${43.78 - i * 15.05},25.72`} />
          <path d={`M${148.3 + i * 15.05},1.64L${160.34 + i * 15.05},13.68L${148.3 + i * 15.05},25.72`} />
        </g>
      ))}
      <path d="M67.31,2.05L124.77,2.05L136.39,13.68L124.77,25.31L67.31,25.31L55.68,13.68Z" fill="#12151F" stroke={AMBER} strokeWidth={4.1} />
    </svg>
  )
}

/** Row logo for the header: mark, then the wordmark. Sized by font-size; the mark tracks the cap height. */
export function RowLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[0.9em] text-[15px]', className)}>
      <Mark className="h-[0.76em] w-auto" />
      <span className="wordmark">RIFTWARD</span>
    </span>
  )
}

/** Column logo for the landing hero: a glowing beam onto the mark, the wordmark, and a ruled diamond. */
export function ColumnLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)} role="img" aria-label="Riftward">
      <svg viewBox="0 0 400 164" width={400} height={164} fill="none" aria-hidden className="h-auto w-[min(400px,80vw)] overflow-visible">
        <defs>
          <linearGradient id="riftward-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CYAN} stopOpacity={0} />
            <stop offset="1" stopColor={CYAN} />
          </linearGradient>
          <filter id="riftward-glow" x="-200%" y="-20%" width="500%" height="140%">
            <feGaussianBlur stdDeviation="4" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x={192} y={0} width={16} height={136} fill="url(#riftward-beam)" filter="url(#riftward-glow)" />
        {TRAIL.map((opacity, i) => (
          <g key={i} stroke={CYAN} strokeWidth={1.5} strokeOpacity={opacity}>
            <path d={`M${148 - i * 12},136L${138 - i * 12},146L${148 - i * 12},156`} />
            <path d={`M${252 + i * 12},136L${262 + i * 12},146L${252 + i * 12},156`} />
          </g>
        ))}
        <path d="M170,134L230,134L242,146L230,158L170,158L158,146Z" fill="#12151F" stroke={AMBER} strokeWidth={3} />
      </svg>
      <span className="wordmark mt-9 text-[32px] tracking-[0.25em]">RIFTWARD</span>
      <svg viewBox="0 0 280 12" width={280} height={12} fill="none" aria-hidden className="mt-[18px]">
        <path d="M0,6H120M160,6H280" stroke="#3A4358" strokeWidth={1.5} />
        <path d="M140,0L146,6L140,12L134,6Z" fill={AMBER} />
      </svg>
    </div>
  )
}
