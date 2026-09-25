import { Button } from '@/components/ui/button'
import { STRINGS } from '@/lib/strings'

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
    <section className="grid gap-10 px-6 py-16 md:grid-cols-12 md:py-28">
      <div className="md:col-span-8">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1 className="display-l md:display-xl mt-6">{s.title}</h1>
        <p className="mt-8 max-w-xl text-body-l text-secondary-text">{s.body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {hasResult ? (
            <>
              <Button size="lg" onClick={onSeeResult}>
                {s.seeResult}
              </Button>
              <Button size="lg" variant="secondary" onClick={onStart}>
                {s.retake}
              </Button>
            </>
          ) : hasProgress ? (
            <>
              <Button size="lg" onClick={onContinue}>
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
          <span className="text-small text-muted-foreground">{s.time}</span>
        </div>
      </div>
      <p className="text-small self-end text-faint md:col-span-4 md:text-right">{s.fanNote}</p>
    </section>
  )
}
