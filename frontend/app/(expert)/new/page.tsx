import type { Metadata } from 'next'
import { AnnouncementForm } from '@/components/announcement/announcement-form'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Новый анонс',
  description: 'Напишите анонс мероприятия в свободной форме — система извлечёт дату, место и цену',
}

export default function NewAnnouncementPage() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <PageHeader title="Новый анонс" />
      <AnnouncementForm />
    </div>
  )
}
