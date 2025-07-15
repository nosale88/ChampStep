import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = 'https://zmoqltninbbqzqhfufe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb3FsdG5pbmJicXFoZnVmZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUxNTIzNjYwLCJleHAiOjIwNjcwOTk2NjB9.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 