export interface Database {
  public: {
    Tables: {
      dancers: {
        Row: {
          id: string
          user_id: string | null
          nickname: string
          name: string
          crew: string | null
          genres: string[]
          sns: string | null
          total_points: number
          rank: number
          avatar: string | null
          background_image: string | null
          profile_image: string | null
          email: string | null
          phone: string | null
          birth_date: string | null
          bio: string | null
          instagram_url: string | null
          youtube_url: string | null
          twitter_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          nickname: string
          name: string
          crew?: string | null
          genres: string[]
          sns?: string | null
          total_points?: number
          rank?: number
          avatar?: string | null
          background_image?: string | null
          profile_image?: string | null
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          bio?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          nickname?: string
          name?: string
          crew?: string | null
          genres?: string[]
          sns?: string | null
          total_points?: number
          rank?: number
          avatar?: string | null
          background_image?: string | null
          profile_image?: string | null
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          bio?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crews: {
        Row: {
          id: string
          name: string
          description: string | null
          founded_year: number | null
          location: string | null
          member_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          founded_year?: number | null
          location?: string | null
          member_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          founded_year?: number | null
          location?: string | null
          member_count?: number | null
          created_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          event_name: string | null
          manager_name: string | null
          manager_contact: string | null
          manager_email: string | null
          genres: string[]
          location: string | null
          venue: string | null
          date: string | null
          event_start_date: string | null
          event_end_date: string | null
          registration_start_date: string | null
          registration_end_date: string | null
          participation_type: string | null
          participant_limit: string | null
          is_participant_list_public: boolean | null
          use_preliminaries: boolean | null
          prelim_format: string | null
          finalist_count: number | null
          prize: string | null
          prize_details: string | null
          age_requirement: string | null
          region_requirement: string | null
          entry_fee: string | null
          audience_limit: string | null
          audience_fee: string | null
          date_memo: string | null
          description: string | null
          detailed_description: string | null
          poster: string | null
          link: string | null
          team_size: number | null
          is_prelim_group_tournament: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          event_name?: string | null
          manager_name?: string | null
          manager_contact?: string | null
          manager_email?: string | null
          genres?: string[]
          location?: string | null
          venue?: string | null
          date?: string | null
          event_start_date?: string | null
          event_end_date?: string | null
          registration_start_date?: string | null
          registration_end_date?: string | null
          participation_type?: string | null
          participant_limit?: string | null
          is_participant_list_public?: boolean | null
          use_preliminaries?: boolean | null
          prelim_format?: string | null
          finalist_count?: number | null
          prize?: string | null
          prize_details?: string | null
          age_requirement?: string | null
          region_requirement?: string | null
          entry_fee?: string | null
          audience_limit?: string | null
          audience_fee?: string | null
          date_memo?: string | null
          description?: string | null
          detailed_description?: string | null
          poster?: string | null
          link?: string | null
          team_size?: number | null
          is_prelim_group_tournament?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          event_name?: string | null
          manager_name?: string | null
          manager_contact?: string | null
          manager_email?: string | null
          genres?: string[]
          location?: string | null
          venue?: string | null
          date?: string | null
          event_start_date?: string | null
          event_end_date?: string | null
          registration_start_date?: string | null
          registration_end_date?: string | null
          participation_type?: string | null
          participant_limit?: string | null
          is_participant_list_public?: boolean | null
          use_preliminaries?: boolean | null
          prelim_format?: string | null
          finalist_count?: number | null
          prize?: string | null
          prize_details?: string | null
          age_requirement?: string | null
          region_requirement?: string | null
          entry_fee?: string | null
          audience_limit?: string | null
          audience_fee?: string | null
          date_memo?: string | null
          description?: string | null
          detailed_description?: string | null
          poster?: string | null
          link?: string | null
          team_size?: number | null
          is_prelim_group_tournament?: boolean | null
          created_at?: string
        }
      }
      crew_schedules: {
        Row: {
          id: string
          crew_name: string
          title: string
          description: string | null
          date: string
          start_time: string
          end_time: string | null
          location: string | null
          type: string
          is_public: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          crew_name: string
          title: string
          description?: string | null
          date: string
          start_time: string
          end_time?: string | null
          location?: string | null
          type: string
          is_public?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          crew_name?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string
          end_time?: string | null
          location?: string | null
          type?: string
          is_public?: boolean
          created_by?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          author_name: string
          author_email: string | null
          target_type: string
          target_id: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          author_name: string
          author_email?: string | null
          target_type: string
          target_id: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_name?: string
          author_email?: string | null
          target_type?: string
          target_id?: string
          is_public?: boolean
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