import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "4da92189bf76b01488f9ef9554f9c7b640bcf975407dde2476d250005b9bbbe2";
const SUPABASE_ANON_KEY = "475e0d195af4d4264794d88f5ac385d3343fd75e89bceae49d01c337db7d464b";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);