export interface AIPersona {
  username: string
  interests: string
  tone: string
  opinionated_neutral: string
  emotional_temperament: string
  expertise: string
  activity_level: string
  social_behavior: string
  quirks_catchphrases: string
}

export interface Tweet {
  username: string
  content: string
  created_at: string
}

export interface TweetRow {
  id: string
  created_at: string
  username: string
  content: string
  user_id?: string | null
  reply_to_id?: string | null
}

export interface ProfileRow {
  id: string
  username: string
}
