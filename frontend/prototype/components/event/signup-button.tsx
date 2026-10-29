import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SignupButton({ className }: { className?: string }) {
  return (
    <Button
      render={<a href="/register" />}
      nativeButton={false}
      className={cn(
        'h-12 gap-2 rounded-full bg-accent-cta px-7 text-base font-semibold text-accent-cta-foreground shadow-sm hover:bg-accent-cta/90',
        className,
      )}
    >
      Записаться
      <ArrowRight aria-hidden="true" className="size-4" />
    </Button>
  )
}
