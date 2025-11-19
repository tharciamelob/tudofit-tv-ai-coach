import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://czbepdrjixrqrxeyfagc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmVwZHJqaXhycXJ4ZXlmYWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTcwMDMsImV4cCI6MjA3NDMzMzAwM30.H7Z1Ehi_5t12YHZwclZAuIeK3ME__I0_Bn_EYelxN7M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);