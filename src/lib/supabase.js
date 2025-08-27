const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE, // service role (solo backend)
  { auth: { persistSession: false } }
);

module.exports = { supabase };
