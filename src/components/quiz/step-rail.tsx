import type { ReactNode } from 'react'
import { stepNumber } from '@/lib/utils'

interface StepRailProps {
  /** The step number, or a word such as "Optional" for a step outside the count. */
  number: number | string
  eyebrow: string
  title: ReactNode
  help?: ReactNode
  children: ReactNode
}

/** Numbered-step layout: number and Axis-neutral eyebrow in a left rail on desktop, stacked on mobile. */
export function StepRail({ number, eyebrow, title, help, children }: StepRailProps) {
  return (
    <section className="grid gap-8 px-6 py-12 md:grid-cols-12 md:py-20">
      <div className="md:col-span-4">
        <p className="label-mono text-muted-foreground">
          <span className="text-primary">{typeof number === 'number' ? stepNumber(number) : number}</span> / {eyebrow}
        </p>
        <h2 className="display mt-5 text-3xl md:text-4xl">{title}</h2>
        {help && <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{help}</p>}
      </div>
      <div className="min-w-0 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  )
}
