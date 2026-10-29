export type PublicEvent = {
  title: string
  tagline: string
  date: string
  weekday: string
  time: string
  duration: string
  venue: string
  address: string
  isOnline: boolean
  price: string
  friendsPrice: string
  seatsLeft: number
  description: string[]
  expert: {
    name: string
    role: string
    bio: string
    photo: string
  }
}

export const publicEvent: PublicEvent = {
  title: 'Медитация для начинающих',
  tagline: 'Вечер тишины и простых практик, которые легко повторить дома',
  date: '19 октября',
  weekday: 'суббота',
  time: '19:00',
  duration: '2 часа',
  venue: 'Кафе на Невском',
  address: 'Санкт-Петербург, Невский проспект, 28',
  isOnline: false,
  price: '2500₽',
  friendsPrice: '2000₽',
  seatsLeft: 6,
  description: [
    'Это встреча для тех, кто давно хотел попробовать медитацию, но не знал, с чего начать. Мы разберём, что на самом деле происходит во время практики, развеем популярные мифы и научимся спокойно возвращать внимание к дыханию.',
    'В программе — три коротких практики по 10–15 минут: осознанное дыхание, сканирование тела и медитация на звуки. Между ними — время для вопросов и обсуждения ощущений в небольшой группе.',
    'Специальной подготовки не нужно. Приходите в удобной одежде — коврики, пледы и травяной чай будут на месте. Вы уйдёте с понятной инструкцией для ежедневной практики на 10 минут.',
  ],
  expert: {
    name: 'Анна Соколова',
    role: 'Преподаватель медитации',
    bio: 'Практикует медитацию более 10 лет, прошла обучение программе MBSR. Провела более 300 групповых занятий и помогла сотням людей найти спокойствие в повседневной жизни.',
    photo: '/images/expert.png',
  },
}
