import Image from 'next/image'
import { CalendarDays, Clock, MapPin, Wifi } from 'lucide-react'
import { SignupButton } from '@/components/event/signup-button'
import type { PublicEvent } from '@/lib/public-event'

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
      {children}
    </h2>
  )
}

export function AboutSection({ event }: { event: PublicEvent }) {
  return (
    <section aria-labelledby="about-title" className="flex flex-col gap-5">
      <SectionTitle id="about-title">О мероприятии</SectionTitle>
      <div className="flex flex-col gap-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
        {event.description.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

export function DatePlaceSection({ event }: { event: PublicEvent }) {
  const rows = [
    { icon: CalendarDays, label: 'Дата', value: `${event.date}, ${event.weekday}` },
    { icon: Clock, label: 'Время', value: `${event.time} · ${event.duration}` },
    event.isOnline
      ? { icon: Wifi, label: 'Формат', value: 'Онлайн', note: 'Ссылка придёт после записи' }
      : { icon: MapPin, label: 'Адрес', value: event.venue, note: event.address },
  ]

  return (
    <section aria-labelledby="place-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <SectionTitle id="place-title">Дата и место</SectionTitle>
        {event.isOnline && (
          <span className="rounded-full bg-accent-cta/10 px-2.5 py-0.5 text-sm font-medium text-accent-cta">
            Онлайн
          </span>
        )}
      </div>
      <dl className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map(({ icon: Icon, label, value, note }) => (
          <div key={label} className="flex items-start gap-4 p-4 sm:p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon aria-hidden="true" className="size-5 text-foreground" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
              {note && <dd className="text-sm text-muted-foreground">{note}</dd>}
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function PriceSection({ event }: { event: PublicEvent }) {
  return (
    <section
      id="signup"
      aria-labelledby="price-title"
      className="flex scroll-mt-6 flex-col gap-6 rounded-3xl bg-neutral-900 p-6 text-white sm:p-8"
    >
      <h2 id="price-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Стоимость
      </h2>
      <dl className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-white/60">Стандартный билет</dt>
          <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">{event.price}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-white/60">Для своих</dt>
          <dd className="text-4xl font-semibold tracking-tight text-accent-cta-soft sm:text-5xl">
            {event.friendsPrice}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <SignupButton className="w-full sm:w-fit" />
        <p className="text-sm text-white/60">Осталось {event.seatsLeft} мест из 15</p>
      </div>
    </section>
  )
}

export function ExpertSection({ event }: { event: PublicEvent }) {
  const { expert } = event
  return (
    <section aria-labelledby="expert-title" className="flex flex-col gap-5">
      <SectionTitle id="expert-title">Об эксперте</SectionTitle>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <Image
          src={expert.photo}
          alt={`Фото: ${expert.name}`}
          width={112}
          height={112}
          className="size-24 shrink-0 rounded-full object-cover sm:size-28"
        />
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-lg font-semibold">{expert.name}</p>
            <p className="text-sm text-muted-foreground">{expert.role}</p>
          </div>
          <p className="leading-relaxed text-pretty text-muted-foreground">{expert.bio}</p>
        </div>
      </div>
    </section>
  )
}

export function FinalCta({ event }: { event: PublicEvent }) {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="flex flex-col items-center gap-5 border-t border-border pt-12 text-center"
    >
      <h2 id="final-cta-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        Готовы попробовать?
      </h2>
      <p className="max-w-md text-pretty text-muted-foreground">
        {event.date}, {event.time} · {event.isOnline ? 'Онлайн' : event.venue}. Осталось{' '}
        {event.seatsLeft} мест.
      </p>
      <SignupButton className="w-full sm:w-fit" />
    </section>
  )
}
