import Link from 'next/link'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
      <span aria-hidden="true" className="size-2.5 rounded-full bg-accent-cta" />
      Площадка
    </Link>
  )
}
