'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Check, Copy, ExternalLink, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Profile = {
  name: string
  bio: string
  photo: string
}

const PUBLIC_URL = 'event-platform.ru/expert/anna'
const BIO_LIMIT = 280

const initialProfile: Profile = {
  name: 'Анна Соколова',
  bio: 'Преподаю медитацию более 10 лет. Провожу групповые занятия для начинающих и помогаю находить спокойствие в повседневной жизни.',
  photo: '/images/expert.png',
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

function Avatar({ photo, name, className }: { photo: string; name: string; className: string }) {
  if (!photo) {
    return (
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ${className}`}
      >
        {getInitials(name)}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- previews local blob URLs from file uploads
    <img src={photo} alt={`Фото: ${name || 'эксперт'}`} className={`rounded-full object-cover ${className}`} />
  )
}

export function ProfileEditor() {
  const [draft, setDraft] = useState<Profile>(initialProfile)
  const [saved, setSaved] = useState<Profile>(initialProfile)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [nameError, setNameError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const isDirty = draft.name !== saved.name || draft.bio !== saved.bio || draft.photo !== saved.photo

  const update = (patch: Partial<Profile>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    setSaveState('idle')
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    update({ photo: url })
    event.target.value = ''
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.name.trim().length < 2) {
      setNameError('Введите имя — минимум 2 символа')
      document.getElementById('expert-name')?.focus()
      return
    }
    setNameError('')
    setSaveState('saving')
    await new Promise((resolve) => setTimeout(resolve, 600))
    const next = { ...draft, name: draft.name.trim(), bio: draft.bio.trim() }
    setDraft(next)
    setSaved(next)
    setSaveState('saved')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${PUBLIC_URL}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Профиль эксперта</CardTitle>
          <CardDescription>Эти данные видят участники на вашей странице</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar photo={draft.photo} name={draft.name} className="size-20 shrink-0 text-xl" />
              <div className="flex flex-col gap-1.5">
                <input
                  ref={fileInputRef}
                  id="expert-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload aria-hidden="true" />
                  Загрузить
                </Button>
                <p className="text-xs text-muted-foreground">JPG или PNG, квадратное фото</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="expert-name">Имя</Label>
              <Input
                id="expert-name"
                value={draft.name}
                autoComplete="name"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? 'expert-name-error' : undefined}
                onChange={(event) => {
                  update({ name: event.target.value })
                  if (nameError && event.target.value.trim().length >= 2) setNameError('')
                }}
                className="h-10"
              />
              {nameError && (
                <p id="expert-name-error" className="text-sm text-destructive">
                  {nameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="expert-bio">О себе</Label>
                <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
                  {draft.bio.length}/{BIO_LIMIT}
                </span>
              </div>
              <Textarea
                id="expert-bio"
                value={draft.bio}
                maxLength={BIO_LIMIT}
                rows={4}
                placeholder="Расскажите коротко о себе и своём опыте"
                onChange={(event) => update({ bio: event.target.value })}
                className="min-h-28 resize-y leading-relaxed"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Button
                type="submit"
                disabled={!isDirty || saveState === 'saving'}
                className="h-10 w-full bg-accent-cta px-5 text-accent-cta-foreground hover:bg-accent-cta/90 sm:w-fit"
              >
                {saveState === 'saving' && <Loader2 aria-hidden="true" className="animate-spin" />}
                {saveState === 'saving' ? 'Сохраняем…' : 'Сохранить'}
              </Button>
              <p role="status" className="text-sm text-muted-foreground">
                {saveState === 'saved' && !isDirty ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check aria-hidden="true" className="size-4 text-accent-cta" />
                    Изменения сохранены
                  </span>
                ) : isDirty ? (
                  'Есть несохранённые изменения'
                ) : null}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Карточка-сайт</CardTitle>
          <CardDescription>Публичная страница, которой можно делиться</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="public-url">Ссылка на страницу</Label>
            <div className="flex gap-2">
              <Input
                id="public-url"
                readOnly
                value={PUBLIC_URL}
                onFocus={(event) => event.currentTarget.select()}
                className="h-10 min-w-0 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={handleCopy}
                aria-label="Скопировать ссылку"
              >
                {copied ? <Check aria-hidden="true" className="text-accent-cta" /> : <Copy aria-hidden="true" />}
              </Button>
            </div>
            <Button type="button" variant="secondary" className="h-10 w-full" onClick={handleCopy}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
            </Button>
            <span className="sr-only" role="status">
              {copied ? 'Ссылка скопирована в буфер обмена' : ''}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Превью</p>
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="h-16 bg-gradient-to-br from-accent-cta/80 to-accent-cta-soft/60" />
              <div className="-mt-9 flex flex-col items-center gap-2 px-4 pb-5 text-center">
                <Avatar
                  photo={saved.photo}
                  name={saved.name}
                  className="size-[4.5rem] border-4 border-background text-lg"
                />
                <p className="text-balance font-semibold text-foreground">{saved.name}</p>
                <p className="line-clamp-3 text-pretty text-xs leading-relaxed text-muted-foreground">
                  {saved.bio || 'Расскажите о себе — описание появится здесь'}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent-cta/15 px-3 py-1 text-xs font-medium text-accent-cta">
                  <ExternalLink aria-hidden="true" className="size-3" />
                  Ближайшие мероприятия
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Превью обновится после сохранения профиля</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
