import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "./database_gen.types";

export const supabase = createBrowserSupabaseClient<Database>();
