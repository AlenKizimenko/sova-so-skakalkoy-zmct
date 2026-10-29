import Link from 'next/link'
import { CalendarDays, MapPin, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { events } from '@/lib/events'

export function EventsList() {
  return (
    <section aria-labelledby="events-heading" className="flex flex-col gap-3">
      <h2 id="events-heading" className="text-sm font-medium text-muted-foreground">
        Список мероприятий
      </h2>

      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_6rem_8.5rem_5.5rem] gap-4 px-5 text-xs font-medium text-muted-foreground lg:grid">
        <span>Название</span>
        <span>Дата и время</span>
        <span>Место</span>
        <span>Цена</span>
        <span>Статус</span>
        <span className="sr-only">Действия</span>
      </div>

      <ul className="flex flex-col gap-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-accent/40 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_6rem_8.5rem_5.5rem] lg:items-center lg:gap-4 lg:px-5"
          >
            <div className="flex items-start justify-between gap-3 lg:contents">
              <h3 className="font-medium leading-snug text-pretty lg:order-1">{event.title}</h3>
              <div className="shrink-0 lg:order-5">
                <StatusBadge status={event.status} />
              </div>
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground lg:order-2 lg:text-foreground">
              <CalendarDays className="size-4 shrink-0 lg:hidden" aria-hidden="true" />
              <span className="sr-only lg:hidden">Дата и время: </span>
              {event.dateTime}
            </p>

            <p className="flex items-center gap-2 text-sm text-muted-foreground lg:order-3 lg:text-foreground">
              <MapPin className="size-4 shrink-0 lg:hidden" aria-hidden="true" />
              <span className="sr-only lg:hidden">Место: </span>
              <span className="truncate">{event.place}</span>
            </p>

            <div className="flex items-center justify-between gap-3 border-t pt-3 lg:contents">
              <p className="flex items-center gap-2 text-sm font-medium tabular-nums lg:order-4">
                <Wallet className="size-4 shrink-0 text-muted-foreground lg:hidden" aria-hidden="true" />
                <span className="sr-only lg:hidden">Цена: </span>
                {event.price}
              </p>
              <div className="lg:order-6 lg:justify-self-end">
                <Button
                    variant="outline"
                    size="sm"
                    render={<Link href="/event" />}
                    nativeButton={false}
                    aria-label={`Открыть «${event.title}»`}
                  >
                  Открыть
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
