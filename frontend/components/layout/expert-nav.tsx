'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Мероприятия' },
  { href: '/new', label: 'Новый анонс' },
  { href: '/profile', label: 'Кабинет' },
]

export function ExpertNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Основная навигация" className="-mx-1 overflow-x-auto">
      <ul className="flex items-center gap-1 px-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-8 items-center whitespace-nowrap rounded-md px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
