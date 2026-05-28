export type Category = 'restaurant' | 'cafe' | 'bar' | 'other'

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: '料理店',
  cafe: 'カフェ',
  bar: 'バー',
  other: 'その他',
}

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = (
  Object.keys(CATEGORY_LABELS) as Category[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }))

export const PRICE_RANGE_LABELS: Record<number, string> = {
  1: '¥（〜1,000円）',
  2: '¥¥（〜3,000円）',
  3: '¥¥¥（〜6,000円）',
  4: '¥¥¥¥（〜15,000円）',
  5: '¥¥¥¥¥（15,000円〜）',
}

export type ReservationMethod =
  | 'phone'
  | 'online'
  | 'ikyu'
  | 'omakase'
  | 'tablecheck'
  | 'pocket_concierge'
  | 'tabelog'
  | 'invitation_only'
  | 'walk_in'

export const RESERVATION_METHOD_OPTIONS: { value: ReservationMethod; label: string }[] = [
  { value: 'phone', label: '電話' },
  { value: 'online', label: 'ネット予約' },
  { value: 'ikyu', label: '一休.com' },
  { value: 'omakase', label: 'OMAKASE' },
  { value: 'tablecheck', label: 'TableCheck' },
  { value: 'pocket_concierge', label: 'Pocket Concierge' },
  { value: 'tabelog', label: '食べログ' },
  { value: 'invitation_only', label: '完全紹介制' },
  { value: 'walk_in', label: '予約不要' },
]

export const RESERVATION_METHOD_LABEL: Record<ReservationMethod, string> = Object.fromEntries(
  RESERVATION_METHOD_OPTIONS.map((o) => [o.value, o.label])
) as Record<ReservationMethod, string>

export type Spot = {
  id: string
  user_id: string
  name: string
  category: Category
  genre: string | null
  prefecture: string | null
  city: string | null
  address: string | null
  price_range: number | null
  price_range_lunch: number | null
  price_range_dinner: number | null
  url: string | null
  map_url: string | null
  notes: string | null
  want_to_visit: boolean
  cover_image_url: string | null
  cover_image_exterior: string | null
  cover_image_food: string | null
  photo_urls: string[]
  reservation_methods: ReservationMethod[]
  meal_times: string[]
  is_featured: boolean
  lat: number | null
  lng: number | null
  chef_id: string | null
  created_at: string
  updated_at: string
}

export const MEAL_TIME_OPTIONS = ['朝', '昼', '夜', 'その他']

export type Chef = {
  id: string
  user_id: string
  name: string
  name_kana: string | null
  specialty: string | null
  birth_year: number | null
  hometown: string | null
  bio: string | null
  training_history: string | null
  awards: string | null
  cover_image_url: string | null
  photo_urls: string[]
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type Hotel = {
  id: string
  user_id: string
  name: string
  brand: string | null
  prefecture: string | null
  address: string | null
  url: string | null
  map_url: string | null
  lat: number | null
  lng: number | null
  cover_image_url: string | null
  photo_urls: string[]
  price_range: number | null
  notes: string | null
  rating: number | null
  reservation_methods: string[]
  want_to_visit: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type Stay = {
  id: string
  user_id: string
  hotel_id: string
  check_in_date: string
  check_out_date: string | null
  price: number | null
  rating: number | null
  comment: string | null
  photo_urls: string[]
  created_at: string
}

export type Sake = {
  id: string
  user_id: string
  name: string
  model: string | null
  brewery: string | null
  region: string | null
  sake_type: string | null
  rice_polishing_pct: number | null
  alcohol_pct: number | null
  price_yen: number | null
  notes: string | null
  cover_image_url: string | null
  photo_urls: string[]
  rating: number | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type EventType = 'dining_meetup' | 'sake_meetup' | 'sake_distribution'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  dining_meetup: '店への同行募集',
  sake_meetup: '日本酒会',
  sake_distribution: '日本酒配布',
}

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = (
  Object.keys(EVENT_TYPE_LABELS) as EventType[]
).map((v) => ({ value: v, label: EVENT_TYPE_LABELS[v] }))

export type EventStatus = 'open' | 'closed' | 'cancelled'

export type AppEvent = {
  id: string
  organizer_id: string
  event_type: EventType
  title: string
  description: string | null
  cover_image_url: string | null
  event_date: string | null
  event_time: string | null
  location_text: string | null
  spot_id: string | null
  sake_id: string | null
  max_participants: number | null
  budget_yen: number | null
  deadline: string | null
  status: EventStatus
  created_at: string
  updated_at: string
  spot?: Pick<Spot, 'id' | 'name' | 'city'> | null
  sake?: Pick<Sake, 'id' | 'name' | 'model' | 'brewery'> | null
}

export type EventParticipant = {
  id: string
  event_id: string
  user_id: string
  joined_at: string
  comment: string | null
}

export type VisitPhoto =
  | string
  | { url: string; caption?: string | null; ingredients?: string[] | null }

export type BlogBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string | null; ingredients?: string[] | null }

export type Visit = {
  id: string
  user_id: string
  spot_id: string
  visited_at: string
  rating: number | null
  price: number | null
  title: string | null
  comment: string | null
  body_blocks: BlogBlock[]
  photo_urls: VisitPhoto[]
  created_at: string
}

export type TripPlan = {
  id: string
  user_id: string
  title: string
  city: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export type TripPlanItem = {
  id: string
  trip_plan_id: string
  spot_id: string | null
  custom_name: string | null
  day_number: number
  display_order: number
  estimated_price: number | null
  notes: string | null
  created_at: string
  spot?: Spot | null
}
