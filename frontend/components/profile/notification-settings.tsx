'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const OPTIONS = [
  {
    id: 'notify-registrations',
    label: 'Уведомления о регистрациях',
    hint: 'Письмо, когда кто-то записывается на ваше мероприятие',
  },
  {
    id: 'notify-reminders',
    label: 'Напоминания о мероприятиях',
    hint: 'За день и за час до начала',
  },
] as const

type OptionId = (typeof OPTIONS)[number]['id']

export function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<OptionId, boolean>>({
    'notify-registrations': true,
    'notify-reminders': false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Настройки уведомлений</CardTitle>
        <CardDescription>Выберите, о чём сообщать на почту</CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset className="flex flex-col divide-y">
          <legend className="sr-only">Уведомления</legend>
          {OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Checkbox
                id={option.id}
                checked={enabled[option.id]}
                onCheckedChange={(checked) =>
                  setEnabled((prev) => ({ ...prev, [option.id]: checked === true }))
                }
                aria-describedby={`${option.id}-hint`}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor={option.id} className="cursor-pointer leading-snug">
                  {option.label}
                </Label>
                <p id={`${option.id}-hint`} className="text-sm text-muted-foreground">
                  {option.hint}
                </p>
              </div>
            </div>
          ))}
        </fieldset>
      </CardContent>
    </Card>
  )
}
