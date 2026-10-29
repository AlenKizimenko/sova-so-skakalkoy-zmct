import { CalendarDays, MapPin, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, type ExtractedAnnouncement } from '@/lib/extract-announcement'

type ExtractedPreviewProps = {
  data: ExtractedAnnouncement
  isExample: boolean
}

function NotFound() {
  return <span className="text-muted-foreground">Не найдено</span>
}

function FieldCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
            {icon}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide">{title}</span>
        </div>
        <div className="text-base font-medium leading-snug text-pretty">{children}</div>
      </CardContent>
    </Card>
  )
}

export function ExtractedPreview({ data, isExample }: ExtractedPreviewProps) {
  const { date, place, prices } = data

  return (
    <section aria-labelledby="preview-title" aria-live="polite" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="preview-title" className="text-lg font-semibold">
          Предпросмотр
        </h2>
        <Badge variant={isExample ? 'secondary' : 'default'}>
          {isExample ? 'Пример' : 'Извлечено'}
        </Badge>
      </div>

      {isExample && (
        <p className="text-sm text-muted-foreground">
          Так система покажет данные, извлечённые из вашего анонса.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <FieldCard icon={<CalendarDays className="size-4" aria-hidden="true" />} title="Дата">
          {date.day || date.time ? (
            <div className="flex flex-col">
              <span>{date.day ?? 'День не указан'}</span>
              {date.time && <span className="text-sm text-muted-foreground">в {date.time}</span>}
            </div>
          ) : (
            <NotFound />
          )}
        </FieldCard>

        <FieldCard icon={<MapPin className="size-4" aria-hidden="true" />} title="Место">
          {place ?? <NotFound />}
        </FieldCard>

        <FieldCard icon={<Wallet className="size-4" aria-hidden="true" />} title="Цена">
          {prices.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {prices.map((price, index) => (
                <li key={index} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{price.label}</span>
                  <span className="tabular-nums">{formatPrice(price.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <NotFound />
          )}
        </FieldCard>
      </div>
    </section>
  )
}
