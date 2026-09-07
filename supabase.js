const SUPABASE_URL =
    "https://qbubumpambnuvjeopttm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_te_JRj8gFLmRtX7q5uxFUg_fh6Jg9IE";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    );


console.log(
    "DΛMZΞΞ NEWS: Supabase client loaded."
);