'use client'

import { Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ExtractedPreview } from '@/components/announcement/extracted-preview'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toExtractedAnnouncement } from '@/lib/adapters'
import { extractAnnouncement } from '@/lib/api'
import { EXAMPLE_RESULT, type ExtractedAnnouncement } from '@/lib/extract-announcement'

export function AnnouncementForm() {
  const [text, setText] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedAnnouncement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      setExtractedData(toExtractedAnnouncement(await extractAnnouncement(text)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось извлечь данные')
    } finally {
      setIsLoading(false)
    }
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
            maxLength={1500}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="В субботу в 19:00 встречаемся в кафе на Невском. Стоимость 2500₽, для своих 2000₽"
            aria-describedby="announcement-hint"
            className="min-h-56 resize-y p-4 text-base leading-relaxed md:text-base"
          />
          <p id="announcement-hint" className="text-sm text-muted-foreground">
            До 1500 символов. Система извлечёт дату, место и цену. Первый запрос может занять несколько минут.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={!text.trim() || isLoading} className="self-start">
          <Sparkles aria-hidden="true" />
          {isLoading ? 'Извлекаем…' : 'Извлечь данные'}
        </Button>
      </form>

      <ExtractedPreview data={extractedData ?? EXAMPLE_RESULT} isExample={extractedData === null} />
    </div>
  )
}
