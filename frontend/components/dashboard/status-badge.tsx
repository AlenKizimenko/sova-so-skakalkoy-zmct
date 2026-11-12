import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EventStatus } from '@/lib/events'

const statusConfig: Record<EventStatus, { label: string; className: string; dot: string }> = {
  published: {
    label: 'Опубликовано',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 [@media(prefers-color-scheme:dark)]:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Черновик',
    className: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  error: {
    label: 'Ошибка',
    className: 'border-red-500/30 bg-red-500/10 text-red-600 [@media(prefers-color-scheme:dark)]:text-red-400',
    dot: 'bg-red-500',
  },
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
      <span className={cn('size-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
