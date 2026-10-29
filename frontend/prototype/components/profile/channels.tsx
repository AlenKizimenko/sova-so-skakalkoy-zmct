'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ChannelId = 'vk' | 'email'

type Channel = {
  id: ChannelId
  name: string
  description: string
  connectedDetail: string
}

const CHANNELS: Channel[] = [
  {
    id: 'vk',
    name: 'ВКонтакте',
    description: 'Публикация анонсов в сообществе',
    connectedDetail: 'Сообщество «Медитация с Анной»',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Рассылка анонсов подписчикам',
    connectedDetail: 'anna@mail.ru',
  },
]

function ChannelIcon({ id }: { id: ChannelId }) {
  if (id === 'vk') {
    return (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0077FF] text-sm font-bold text-white"
      >
        VK
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
    >
      <Mail className="size-5" />
    </span>
  )
}

export function Channels() {
  const [connected, setConnected] = useState<Record<ChannelId, boolean>>({ vk: true, email: false })
  const [pending, setPending] = useState<ChannelId | null>(null)

  const toggle = async (id: ChannelId) => {
    setPending(id)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }))
    setPending(null)
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {CHANNELS.map((channel) => {
        const isConnected = connected[channel.id]
        const isPending = pending === channel.id
        return (
          <Card key={channel.id} className="py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              <div className="flex items-start gap-3">
                <ChannelIcon id={channel.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{channel.name}</h3>
                    {isConnected ? (
                      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 [@media(prefers-color-scheme:dark)]:text-emerald-400">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                        Подключено
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Не подключено
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {isConnected ? channel.connectedDetail : channel.description}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={isConnected ? 'outline' : 'default'}
                disabled={isPending}
                onClick={() => toggle(channel.id)}
                className="h-9 w-full"
                aria-label={`${isConnected ? 'Отключить' : 'Подключить'} ${channel.name}`}
              >
                {isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
                {isConnected ? 'Отключить' : 'Подключить'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
