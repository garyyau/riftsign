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
        <p className="label-mono text-muted-foreground">{s.eyebrow}</p>
        <h1 className="display mt-6 text-5xl md:text-7xl">{s.title}</h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">{s.body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {hasResult ? (
            <>
              <Button size="lg" onClick={onSeeResult}>
                {s.seeResult}
              </Button>
              <Button size="lg" variant="subtle" onClick={onStart}>
                {s.retake}
              </Button>
            </>
          ) : hasProgress ? (
            <>
              <Button size="lg" onClick={onContinue}>
                {s.continue}
              </Button>
              <Button size="lg" variant="subtle" onClick={onStart}>
                {s.start}
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={onStart}>
              {s.start}
            </Button>
          )}
          <span className="label-mono text-muted-foreground">{s.time}</span>
        </div>
      </div>
      <p className="label-mono self-end text-muted-foreground md:col-span-4 md:text-right">{s.fanNote}</p>
    </section>
  )
}
