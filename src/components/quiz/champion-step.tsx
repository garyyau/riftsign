import { Button } from '@/components/ui/button'
import { STRINGS } from '@/lib/strings'
import { cn } from '@/lib/utils'
import { StepRail } from './step-rail'

interface ChampionStepProps {
  champions: string[]
  selected: string[]
  onToggle: (champion: string) => void
  onSkip: () => void
  onDone: () => void
}

export function ChampionStep({ champions, selected, onToggle, onSkip, onDone }: ChampionStepProps) {
  const s = STRINGS.quiz
  return (
    <StepRail number={s.optionalStep} eyebrow={s.championsEyebrow} title={s.championsPrompt} help={s.championsHelp}>
      {champions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{s.noChampions}</p>
      ) : (
        <div className="flex flex-wrap gap-2" role="group" aria-label={s.championsPrompt}>
          {champions.map((champion) => {
            const active = selected.includes(champion)
            return (
              <button
                key={champion}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(champion)}
                className={cn(
                  'cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-foreground',
                  active ? 'border-primary bg-primary/10' : 'text-foreground/90',
                )}
              >
                {champion}
              </button>
            )
          })}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button size="lg" forward onClick={onDone}>
          {s.championsDone}
        </Button>
        {selected.length === 0 && (
          <Button size="lg" variant="secondary" onClick={onSkip}>
            {s.championsSkip}
          </Button>
        )}
      </div>
    </StepRail>
  )
}
