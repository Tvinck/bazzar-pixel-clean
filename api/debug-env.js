export default function handler(req, res) {
    // Return connection details (safe for Anon key, NEVER do this for Service key)
    res.status(200).json({
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        // Check if VITE_ prefix variants exist on server (unlikely but checking)
        viteUrl: process.env.VITE_SUPABASE_URL,
        viteKey: process.env.VITE_SUPABASE_ANON_KEY
    });
}
