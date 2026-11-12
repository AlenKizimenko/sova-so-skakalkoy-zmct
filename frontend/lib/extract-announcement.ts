export type PriceOption = {
  amount: number | null
  label: string
}

export type ExtractedAnnouncement = {
  date: { day: string | null; time: string | null }
  place: string | null
  prices: PriceOption[]
}

const WEEKDAYS: Record<string, string> = {
  понедельник: 'Понедельник',
  вторник: 'Вторник',
  сред: 'Среда',
  четверг: 'Четверг',
  пятниц: 'Пятница',
  суббот: 'Суббота',
  воскресень: 'Воскресенье',
}

const MONTHS =
  'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря'

const PLACE_NOUNS =
  'кафе|бар[еу]?|ресторан[еу]?|клуб[еу]?|парк[еу]?|офис[еу]?|зал[еу]?|галере[еи]|студи[ии]|антикафе|музе[ею]|театр[еу]?|библиотек[еу]|коворкинг[еу]?|кинотеатр[еу]?|лофт[еу]?|пространств[еу]|центр[еу]?|сквер[еу]?|набережной|площади'

const NOMINATIVE: Record<string, string> = {
  баре: 'бар',
  ресторане: 'ресторан',
  клубе: 'клуб',
  парке: 'парк',
  офисе: 'офис',
  зале: 'зал',
  музее: 'музей',
  театре: 'театр',
  кинотеатре: 'кинотеатр',
  лофте: 'лофт',
  коворкинге: 'коворкинг',
  центре: 'центр',
  сквере: 'сквер',
  галерее: 'галерея',
  студии: 'студия',
  библиотеке: 'библиотека',
  пространстве: 'пространство',
}

function toNominative(place: string) {
  const [first, ...rest] = place.split(' ')
  const normalized = NOMINATIVE[first.toLowerCase()]
  return normalized ? [normalized, ...rest].join(' ') : place
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function extractDay(text: string): string | null {
  const lower = text.toLowerCase()

  const explicit = lower.match(new RegExp(`(\\d{1,2})\\s+(${MONTHS})`))
  if (explicit) return `${explicit[1]} ${explicit[2]}`

  const numeric = lower.match(/\b(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?\b/)
  if (numeric && Number(numeric[1]) <= 31 && Number(numeric[2]) <= 12) {
    return [numeric[1].padStart(2, '0'), numeric[2].padStart(2, '0'), numeric[3]]
      .filter(Boolean)
      .join('.')
  }

  if (/послезавтра/.test(lower)) return 'Послезавтра'
  if (/завтра/.test(lower)) return 'Завтра'
  if (/сегодня/.test(lower)) return 'Сегодня'

  for (const [stem, label] of Object.entries(WEEKDAYS)) {
    if (lower.includes(stem)) return label
  }

  return null
}

function extractTime(text: string): string | null {
  const clock = text.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b(?!\.\d)/)
  if (clock) return `${clock[1].padStart(2, '0')}:${clock[2]}`

  const hours = text.toLowerCase().match(/(?<!\p{L})в\s+(\d{1,2})\s*(?:час|ч(?!\p{L}))/u)
  if (hours) return `${hours[1].padStart(2, '0')}:00`

  return null
}

function extractPlace(text: string): string | null {
  const labeled = text.match(/(?:место|адрес)\s*[:—-]\s*([^.\n;!?]+)/i)
  if (labeled) return capitalize(labeled[1].trim())

  const noun = text.match(
    new RegExp(`(?<!\\p{L})(?:в|во|на)\\s+((?:${PLACE_NOUNS})(?!\\p{L})[^.,\\n;!?]*)`, 'iu'),
  )
  if (noun) return capitalize(toNominative(noun[1].trim()))

  const street = text.match(
    /(?<!\p{L})(?:на|по адресу)\s+((?:ул\.|улице|проспекте|пр\.|Невском|[А-ЯЁ][а-яё]+ской|[А-ЯЁ][а-яё]+ском)[^.,\n;!?]*)/u,
  )
  if (street) return capitalize(street[1].trim())

  return null
}

function extractPrices(text: string): PriceOption[] {
  if (/бесплатн|вход свободный/i.test(text)) {
    return [{ amount: 0, label: 'Вход' }]
  }

  const pattern = /(\d[\d\s]{0,8}\d|\d)\s*(?:₽|р\.|руб(?:лей|ля|ль)?\.?)/gi
  const results: PriceOption[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const amount = Number(match[1].replace(/\s/g, ''))
    const context = text
      .slice(lastIndex, match.index)
      .split(/[.!?\n]/)
      .pop()!
      .replace(/стоимость|цена|билет[ы]?|вход|[:—,–-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const label =
      results.length === 0
        ? context.length > 0 && context.length < 30
          ? capitalize(context)
          : 'Стандартный'
        : context.length > 0
          ? capitalize(context)
          : 'Другой тариф'

    results.push({ amount, label })
    lastIndex = match.index + match[0].length
  }

  return results
}

export function extractAnnouncement(text: string): ExtractedAnnouncement {
  return {
    date: { day: extractDay(text), time: extractTime(text) },
    place: extractPlace(text),
    prices: extractPrices(text),
  }
}

export function formatPrice(amount: number | null) {
  if (amount === null) return '—'
  if (amount === 0) return 'Бесплатно'
  return `${amount.toLocaleString('ru-RU')} ₽`
}

export const EXAMPLE_RESULT: ExtractedAnnouncement = {
  date: { day: 'Суббота', time: '19:00' },
  place: 'Кафе на Невском',
  prices: [
    { amount: 2500, label: 'Стандартный' },
    { amount: 2000, label: 'Для своих' },
  ],
}
