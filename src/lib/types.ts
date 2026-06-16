export type ReadingStatus = 'not_started' | 'currently_reading' | 'finished' | 'did_not_finish'
export type RatingCategory = 'plot' | 'characters' | 'writing' | 'spice'
export type ExternalSource = 'google' | 'openlibrary' | 'manual'

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  series: string | null
  isbn: string | null
  description: string | null
  cover_url: string | null
  external_source: ExternalSource | null
  external_id: string | null
  owned: boolean
  reading_status: ReadingStatus
  date_added: string
  date_started: string | null
  date_finished: string | null
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  book_id: string
  user_id: string
  category: RatingCategory
  score: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  book_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface CollectionBook {
  collection_id: string
  book_id: string
}

export interface ExternalBook {
  title: string
  author: string
  isbn: string | null
  description: string | null
  coverUrl: string | null
  source: ExternalSource
  externalId: string
}
