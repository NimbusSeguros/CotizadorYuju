const axios = require('axios');
const config = require('../config'); // donde tengas user y pass
let tokenCache = null;

async function getInfoautoToken() {
  if (tokenCache) return tokenCache;

  const credentials = Buffer.from(`${config.INFOAUTO_USER}:${config.INFOAUTO_PASS}`).toString('base64');
  const response = await axios.post('https://api.infoauto.com.ar/cars/auth/login', {}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    }
  });

  tokenCache = response.data.access_token;

  // Vence en 1 hora
  setTimeout(() => tokenCache = null, 1000 * 60 * 60);
  return tokenCache;
}

module.exports = { getInfoautoToken };
