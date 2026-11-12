'use client'

import { useEffect, useState } from 'react'
import { EventHero } from '@/components/event/event-hero'
import {
  AboutSection,
  DatePlaceSection,
  ExpertSection,
  FinalCta,
  PriceSection,
} from '@/components/event/event-sections'
import { toPublicEvent } from '@/lib/adapters'
import { composePage, getCurrentEventId } from '@/lib/api'
import type { PublicEvent } from '@/lib/public-event'

export default function PublicEventPage() {
  const [publicEvent, setPublicEvent] = useState<PublicEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    composePage(getCurrentEventId())
      .then((response) => {
        if (!cancelled) setPublicEvent(toPublicEvent(response))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось загрузить страницу')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // metadata нельзя экспортировать из client-компонента — выставляем заголовок вручную
  useEffect(() => {
    if (publicEvent) document.title = `${publicEvent.title} — ${publicEvent.date}, ${publicEvent.time}`
  }, [publicEvent])

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <p role="status" className="text-muted-foreground">
          Загружаем страницу…
        </p>
      </main>
    )
  }

  if (error || !publicEvent) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <p role="alert" className="text-destructive">
          {error ?? 'Не удалось загрузить страницу'}
        </p>
      </main>
    )
  }

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
