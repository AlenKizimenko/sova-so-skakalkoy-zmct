export type EventStatus = 'published' | 'draft' | 'error'

export type ExpertEvent = {
  id: string
  title: string
  dateTime: string
  place: string
  price: string
  status: EventStatus
}

export const eventStats = [
  { label: 'Всего мероприятий', value: 12 },
  { label: 'Опубликовано', value: 8 },
  { label: 'Черновики', value: 4 },
] as const

export const events: ExpertEvent[] = [
  {
    id: '1',
    title: 'Медитация для начинающих',
    dateTime: '19 октября, 19:00',
    place: 'Кафе на Невском',
    price: '2500₽',
    status: 'published',
  },
  {
    id: '2',
    title: 'Дыхательные практики',
    dateTime: '22 октября, 18:30',
    place: 'Студия «Пространство»',
    price: '1800₽',
    status: 'published',
  },
  {
    id: '3',
    title: 'Йога-нидра: глубокое расслабление',
    dateTime: '26 октября, 20:00',
    place: 'Онлайн',
    price: '1200₽',
    status: 'draft',
  },
  {
    id: '4',
    title: 'Мастер-класс по осознанности',
    dateTime: '2 ноября, 12:00',
    place: 'Лофт на Фонтанке',
    price: '3500₽',
    status: 'error',
  },
  {
    id: '5',
    title: 'Чайная церемония и медитация',
    dateTime: '9 ноября, 17:00',
    place: 'Чайный дом «Лист»',
    price: '2000₽',
    status: 'published',
  },
  {
    id: '6',
    title: 'Ретрит выходного дня',
    dateTime: '16 ноября, 10:00',
    place: 'Загородный клуб «Сосны»',
    price: '9900₽',
    status: 'draft',
  },
]
