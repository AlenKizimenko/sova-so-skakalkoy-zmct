'use client'

import { useState, type FormEvent } from 'react'
import { CircleCheck, Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Errors = Partial<Record<'name' | 'email' | 'consent', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(name: string, email: string, consent: boolean): Errors {
  const errors: Errors = {}
  if (name.trim().length < 2) errors.name = 'Введите имя — минимум 2 символа'
  if (!email.trim()) errors.email = 'Введите email'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Проверьте email — например, name@mail.ru'
  if (!consent) errors.consent = 'Нужно согласие на обработку данных'
  return errors
}

export function RegistrationForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')

  const revalidate = (next: { name?: string; email?: string; consent?: boolean }) => {
    if (!touched) return
    setErrors(validate(next.name ?? name, next.email ?? email, next.consent ?? consent))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)
    const nextErrors = validate(name, email, consent)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = (['name', 'email', 'consent'] as const).find((key) => nextErrors[key])
      if (firstInvalid) document.getElementById(firstInvalid)?.focus()
      return
    }
    setStatus('submitting')
    await new Promise((resolve) => setTimeout(resolve, 700))
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-cta/15 text-accent-cta">
          <CircleCheck aria-hidden="true" className="size-6" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Вы зарегистрированы</h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Подтверждение отправлено на <span className="font-medium text-foreground">{email.trim()}</span>
        </p>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            revalidate({ name: e.target.value })
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="h-11 px-3"
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@mail.ru"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            revalidate({ email: e.target.value })
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="h-11 px-3"
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(checked) => {
              setConsent(checked)
              revalidate({ consent: checked })
            }}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-0.5"
          />
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed text-muted-foreground">
            Я согласен(на) на обработку персональных данных
          </Label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="text-sm text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="h-12 w-full gap-2 rounded-full bg-accent-cta text-base font-semibold text-accent-cta-foreground hover:bg-accent-cta/90"
        >
          {status === 'submitting' && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {status === 'submitting' ? 'Отправляем…' : 'Зарегистрироваться'}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <MailCheck aria-hidden="true" className="size-4 shrink-0" />
          После регистрации вы получите подтверждение на почту
        </p>
      </div>
    </form>
  )
}
