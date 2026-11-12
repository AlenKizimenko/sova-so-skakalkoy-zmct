import { eventStats } from '@/lib/events'

export function StatsCards() {
  return (
    <section aria-label="Статистика">
      <dl className="grid grid-cols-3 gap-3 sm:gap-4">
        {eventStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl border bg-card p-3 text-card-foreground sm:p-5"
          >
            <dt className="text-xs leading-snug text-muted-foreground sm:text-sm">{stat.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
