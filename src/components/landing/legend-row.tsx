import type { Legend } from '@/lib/types'

/**
 * A decorative, full-bleed row of Legend cards that drifts on its own. The list renders twice so the loop
 * is seamless; the row pauses on hover and stays still for Players who turn motion off.
 */
export function LegendRow({ legends }: { legends: Legend[] }) {
  return (
    <div
      aria-hidden
      className="group mx-[calc(50%-50vw)] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
    >
      <div className="marquee flex w-max group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-4 pr-4">
            {legends.map((legend) => (
              <img
                key={legend.id}
                src={`${import.meta.env.BASE_URL}cards/${legend.cardImage}`}
                alt=""
                loading="lazy"
                className="aspect-[5/7] w-[150px] rounded-md bg-surface object-cover"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
