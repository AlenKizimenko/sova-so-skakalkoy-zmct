import Image from 'next/image'
import { CalendarDays, MapPin } from 'lucide-react'
import { SignupButton } from '@/components/event/signup-button'
import type { PublicEvent } from '@/lib/public-event'

export function EventHero({ event }: { event: PublicEvent }) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 text-white">
      <Image
        src="/images/event-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20"
      />
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-5xl flex-col justify-end gap-6 px-5 pt-24 pb-12 sm:px-8 sm:pb-16">
        <p className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm backdrop-blur">
          {event.isOnline ? 'Онлайн-встреча' : 'Офлайн-встреча'}
        </p>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {event.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-white/80">{event.tagline}</p>
        </div>
        <ul className="flex flex-col gap-2 text-base text-white/90 sm:flex-row sm:gap-6">
          <li className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-5 text-white/70" />
            {event.date}, {event.time}
          </li>
          <li className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-5 text-white/70" />
            {event.isOnline ? 'Онлайн' : event.venue}
          </li>
        </ul>
        <SignupButton className="w-full sm:w-fit" />
      </div>
    </section>
  )
}
