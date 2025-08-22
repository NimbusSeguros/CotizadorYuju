//BASE DE DATOS
const { createClient } = require('@supabase/supabase-js');
const config = require('./config'); // 👈 ahora sí, mismo nivel de carpeta

if (!config.SUPABASE_URL) {
  throw new Error('❌ Falta SUPABASE_URL en config.js / .env');
}
if (!config.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en config.js / .env');
}

const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = { supabase };
