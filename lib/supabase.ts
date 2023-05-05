import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"

import { Database } from "./database.types"

export const supabase = createBrowserSupabaseClient<Database>()
