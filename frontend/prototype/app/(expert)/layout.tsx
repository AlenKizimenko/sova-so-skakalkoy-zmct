import { ExpertNav } from '@/components/layout/expert-nav'
import { Logo } from '@/components/layout/logo'

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-0">
          <Logo />
          <ExpertNav />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
