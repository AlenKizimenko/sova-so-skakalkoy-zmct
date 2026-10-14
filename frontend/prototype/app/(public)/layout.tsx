import { Logo } from '@/components/layout/logo'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="flex-1">{children}</div>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-6 text-xs text-muted-foreground sm:px-8">
          <Logo href="/event" />
          <span>Мероприятия с экспертами</span>
        </div>
      </footer>
    </div>
  )
}
