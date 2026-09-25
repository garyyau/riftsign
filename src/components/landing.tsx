import { ColumnLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { LEGENDS } from '@/data'
import { STRINGS } from '@/lib/strings'
import { landingOrder } from './landing/legend-order'
import { LegendRow } from './landing/legend-row'

const rowLegends = landingOrder(LEGENDS)

interface LandingProps {
  /** True when a finished run is stored on this device. */
  hasResult: boolean
  /** True when an unfinished run is stored on this device. */
  hasProgress: boolean
  onStart: () => void
  onContinue: () => void
  onSeeResult: () => void
}

export function Landing({ hasResult, hasProgress, onStart, onContinue, onSeeResult }: LandingProps) {
  const s = STRINGS.landing
  return (
    <div className="pt-6 pb-4">
      <section className="flex flex-col items-center px-6 text-center">
        <ColumnLogo />
        <p className="eyebrow mt-8">{s.eyebrow}</p>
        <h1 className="display-l md:display-xl mt-4 max-w-[860px]">{s.title}</h1>
        <p className="mt-5 max-w-[600px] text-body text-secondary-text">{s.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {hasResult ? (
            <>
              <Button size="lg" forward onClick={onSeeResult}>
                {s.seeResult}
              </Button>
              <Button size="lg" variant="secondary" onClick={onStart}>
                {s.retake}
              </Button>
            </>
          ) : hasProgress ? (
            <>
              <Button size="lg" forward onClick={onContinue}>
                {s.continue}
              </Button>
              <Button size="lg" variant="secondary" onClick={onStart}>
                {s.start}
              </Button>
            </>
          ) : (
            <Button size="lg" forward onClick={onStart}>
              {s.start}
            </Button>
          )}
        </div>
        <p className="mt-4 text-body text-muted-foreground">{s.time}</p>
      </section>
      <p className="eyebrow mt-14 px-6 text-center">{s.rowLabel(rowLegends.length)}</p>
      <div className="mt-6">
        <LegendRow legends={rowLegends} />
      </div>
    </div>
  )
}
