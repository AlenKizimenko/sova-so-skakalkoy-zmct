import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileEditor } from '@/components/profile/profile-editor'
import { Channels } from '@/components/profile/channels'
import { NotificationSettings } from '@/components/profile/notification-settings'

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Профиль, публичная страница, каналы и уведомления эксперта.',
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Личный кабинет" />

      <ProfileEditor />

      <section aria-labelledby="channels-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="channels-heading" className="text-lg font-semibold text-foreground">
            Подключение каналов
          </h2>
          <p className="text-sm text-muted-foreground">Куда публиковать анонсы мероприятий</p>
        </div>
        <Channels />
      </section>

      <NotificationSettings />
    </>
  )
}
