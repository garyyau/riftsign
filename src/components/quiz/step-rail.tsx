import type { ReactNode } from 'react'
import { stepNumber } from '@/lib/utils'

interface StepRailProps {
  number: number
  eyebrow: string
  title: ReactNode
  children: ReactNode
}

/** Numbered-step layout: number and Axis-neutral eyebrow in a left rail on desktop, stacked on mobile. */
export function StepRail({ number, eyebrow, title, children }: StepRailProps) {
  return (
    <section className="grid gap-8 px-6 py-12 md:grid-cols-12 md:py-20">
      <div className="md:col-span-4">
        <p className="small-caps text-muted-foreground">
          <span className="text-amber">{stepNumber(number)}</span> / {eyebrow}
        </p>
        <h2 className="display-s md:display-m mt-5">{title}</h2>
      </div>
      <div className="min-w-0 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  )
}
