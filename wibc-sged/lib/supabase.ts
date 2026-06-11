import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client (uses anon key).
 * Safe to use in Client Components.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase client (uses service role key).
 * Only use in API Routes and Server Components — NEVER expose to the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
