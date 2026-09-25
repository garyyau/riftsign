import { useState } from 'react'
import type { Legend } from '@/lib/types'
import { cn } from '@/lib/utils'

/** The Legend's card at the true 5:7 ratio, with a typographic stand-in when the image is missing. */
export function CardImage({ legend, className }: { legend: Legend; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = `${import.meta.env.BASE_URL}cards/${legend.cardImage}`
  return (
    <div className={cn('relative aspect-[5/7] w-full overflow-hidden rounded-md border bg-surface', className)}>
      {failed ? (
        <div className="flex h-full flex-col justify-end p-4">
          <p className="small-caps text-muted-foreground">{legend.set}</p>
          <p className="display-s mt-2">{legend.name}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={legend.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
