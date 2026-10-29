import type { Metadata } from 'next'
import { EventHero } from '@/components/event/event-hero'
import {
  AboutSection,
  DatePlaceSection,
  ExpertSection,
  FinalCta,
  PriceSection,
} from '@/components/event/event-sections'
import { publicEvent } from '@/lib/public-event'

export const metadata: Metadata = {
  title: `${publicEvent.title} — ${publicEvent.date}, ${publicEvent.time}`,
  description: publicEvent.tagline,
}

export default function PublicEventPage() {
  return (
    <main>
      <EventHero event={publicEvent} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-5 py-14 sm:gap-16 sm:px-8 sm:py-20">
        <AboutSection event={publicEvent} />
        <DatePlaceSection event={publicEvent} />
        <PriceSection event={publicEvent} />
        <ExpertSection event={publicEvent} />
        <FinalCta event={publicEvent} />
      </div>
    </main>
  )
}
