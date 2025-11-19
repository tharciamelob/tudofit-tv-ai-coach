import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://czbepdrjixrqrxeyfagc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmVwZHJqaXhycXJ4ZXlmYWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjMxMTEsImV4cCI6MjA3MzUzOTExMX0.GIFH3IHGfch399dIj1QWfg6m2-zyR_qe45vN0Aqkg0M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);