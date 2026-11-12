import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RegistrationForm } from '@/components/register/registration-form'

export const metadata: Metadata = {
  title: 'Регистрация на мероприятие — Медитация для начинающих',
  description: 'Зарегистрируйтесь на мероприятие «Медитация для начинающих», 19 октября, 19:00.',
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link
          href="/event"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />К мероприятию
        </Link>

        <Card className="w-full">
          <CardHeader className="gap-2">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              Регистрация на мероприятие
            </h1>
            <p className="flex items-start gap-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-cta" />
              Медитация для начинающих, 19 октября, 19:00
            </p>
          </CardHeader>
          <CardContent>
            <RegistrationForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
