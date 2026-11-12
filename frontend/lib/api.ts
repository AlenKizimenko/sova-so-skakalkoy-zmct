const EXTRACTOR_URL = '/api/extractor'
const COMPOSER_URL = '/api/composer'

export type ExtractResponse = {
  title: string
  date: string | null
  location: string | null
  price: number | null
}

export type PageBlock = {
  type: string
  order: number
  data: Record<string, unknown>
}

export type ComposeResponse = {
  event_id: string
  blocks: PageBlock[]
}

export type RegisterResponse = {
  status: string
  message: string
}

export class ApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Сервис недоступен. Проверьте соединение и попробуйте ещё раз.')
  }

  if (!response.ok) {
    let detail = `Ошибка сервера (${response.status})`
    try {
      const data = await response.json()
      if (typeof data?.detail === 'string') detail = data.detail
    } catch {
      // тело ответа не JSON — оставляем сообщение по умолчанию
    }
    throw new ApiError(detail, response.status)
  }

  return (await response.json()) as T
}

export function extractAnnouncement(rawText: string): Promise<ExtractResponse> {
  return post<ExtractResponse>(`${EXTRACTOR_URL}/extract`, { raw_text: rawText })
}

export function registerForEvent(
  eventId: string,
  email: string,
  name: string,
): Promise<RegisterResponse> {
  return post<RegisterResponse>(`${EXTRACTOR_URL}/register`, {
    event_id: eventId,
    email,
    name,
  })
}

export function composePage(eventId: string): Promise<ComposeResponse> {
  return post<ComposeResponse>(`${COMPOSER_URL}/compose`, { event_id: eventId })
}

/** id мероприятия из ?event=... в адресе страницы; "demo" — если не указан. */
export function getCurrentEventId(): string {
  if (typeof window === 'undefined') return 'demo'
  return new URLSearchParams(window.location.search).get('event') || 'demo'
}
