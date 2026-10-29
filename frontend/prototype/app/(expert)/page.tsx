import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { EventsList } from '@/components/dashboard/events-list'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Мои мероприятия"
        actions={
          <Button render={<Link href="/new" />} nativeButton={false} className="h-9 px-3">
            <Plus aria-hidden="true" />
            Создать мероприятие
          </Button>
        }
      />
      <StatsCards />
      <EventsList />
    </>
  )
}
