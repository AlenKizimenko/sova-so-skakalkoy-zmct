'use client'

import { Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ExtractedPreview } from '@/components/announcement/extracted-preview'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  EXAMPLE_RESULT,
  extractAnnouncement,
  type ExtractedAnnouncement,
} from '@/lib/extract-announcement'

export function AnnouncementForm() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ExtractedAnnouncement | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) return
    setResult(extractAnnouncement(text))
  }

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="announcement" className="sr-only">
            Текст анонса
          </Label>
          <Textarea
            id="announcement"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="В субботу в 19:00 встречаемся в кафе на Невском. Стоимость 2500₽, для своих 2000₽"
            aria-describedby="announcement-hint"
            className="min-h-56 resize-y p-4 text-base leading-relaxed md:text-base"
          />
          <p id="announcement-hint" className="text-sm text-muted-foreground">
            Напишите анонс в свободной форме — система сама извлечёт дату, место и цену
          </p>
        </div>

        <Button type="submit" size="lg" disabled={!text.trim()} className="self-start">
          <Sparkles aria-hidden="true" />
          Извлечь данные
        </Button>
      </form>

      <ExtractedPreview data={result ?? EXAMPLE_RESULT} isExample={result === null} />
    </div>
  )
}
