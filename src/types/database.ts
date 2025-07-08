export interface Database {
  public: {
    Tables: {
      dancers: {
        Row: {
          id: string
          nickname: string
          name: string
          genres: string[]
          sns: string | null
          total_points: number
          rank: number
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nickname: string
          name: string
          genres: string[]
          sns?: string | null
          total_points?: number
          rank?: number
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          name?: string
          genres?: string[]
          sns?: string | null
          total_points?: number
          rank?: number
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crews: {
        Row: {
          id: string
          name: string
          genre: string
          introduction: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          genre: string
          introduction?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          genre?: string
          introduction?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string
          location: string | null
          prize: string | null
          status: string
          poster: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date: string
          location?: string | null
          prize?: string | null
          status?: string
          poster?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string
          location?: string | null
          prize?: string | null
          status?: string
          poster?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dancer_crews: {
        Row: {
          id: string
          dancer_id: string
          crew_id: string
          created_at: string
        }
        Insert: {
          id?: string
          dancer_id: string
          crew_id: string
          created_at?: string
        }
        Update: {
          id?: string
          dancer_id?: string
          crew_id?: string
          created_at?: string
        }
      }
      competition_participants: {
        Row: {
          id: string
          competition_id: string
          dancer_id: string
          position: number | null
          points: number | null
          created_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          dancer_id: string
          position?: number | null
          points?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          dancer_id?: string
          position?: number | null
          points?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 