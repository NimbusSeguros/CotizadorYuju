const { apiRequest } = require('../services/externalService');
const config = require('../config');

const AUTH_CONFIG = {
    RUS: {
        url: `${config.RUS_API_URL_TEST}/api-rus/login/token`,
        payload: () => ({
            userName: config.RUS_API_USERNAME,
            password: config.RUS_API_PASSWORD
        }),
        tokenPath: "message", // El token viene dentro de "message"
        headers: { "Content-Type": "application/json" }
    },
    INTEGRITY: {
        url: `${config.INTEGRITY_API_URL}/auth`,
        payload: () => ({
            usuario: config.INTEGRITY_PRODUCTOR,
            clave: config.INTEGRITY_TICKET
        }),
        tokenPath: "token",
        headers: { "Content-Type": "application/json" }
    },
    MERCANTIL_ANDINA: {
        url: config.MERCANTIL_ANDINA_API_LOGIN_URL,
        payload: () => new URLSearchParams({
            client_id: config.MERCANTIL_ANDINA_API_CLIENT_ID,
            username: config.MERCANTIL_ANDINA_API_USERNAME,
            password: config.MERCANTIL_ANDINA_API_PASSWORD,
            grant_type: "password"
        }).toString(),
        tokenPath: "access_token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Ocp-Apim-Subscription-Key": config.MERCANTIL_ANDINA_API_SUBSCRIPTION_PRIMARY_KEY
        }
    },
    SAN_CRISTOBAL: {
        url: `${config.SAN_CRISTOBAL_API_LOGIN_URL}`,
        payload: () => ({
            username: config.SAN_CRISTOBAL_API_USERNAME,
            password: config.SAN_CRISTOBAL_API_PASSWORD
        }),
        tokenPath: "Auth_Token",
        headers: { "Content-Type": "application/json" }
    },
    EXPERTA: {  // 🚀 Ajuste para Experta
        url: `${config.EXPERTA_API_URL}/login`,
        payload: () => ({
            user: config.EXPERTA_API_USERNAME,
            password: config.EXPERTA_API_PASSWORD
        }),
        tokenPath: "jwt",  // ✅ Tomamos solo el `jwt`
        headers: { "Content-Type": "application/json" }
    }
};

let tokenCache = {}; // Cache para guardar tokens temporalmente

async function getAuthToken(company) {
    if (tokenCache[company]) {
        console.log(`🛠 Usando token en caché para ${company}`);
        return tokenCache[company];
    }

    const authConfig = AUTH_CONFIG[company];

    if (!authConfig) {
        throw new Error(`No hay configuración de autenticación para ${company}`);
    }

    try {
        console.log(`Autenticando en ${company}...`);
        const response = await apiRequest('POST', authConfig.url, authConfig.payload(), authConfig.headers);

        console.log(`Respuesta de ${company}:`, response);

        const token = response?.[authConfig.tokenPath];

        if (!token) {
            throw new Error(`No se pudo autenticar en ${company}`);
        }

        console.log(`Token JWT obtenido para ${company}:`, token);
        tokenCache[company] = token; // Guardamos el token en caché
        return token;
    } catch (error) {
        console.error(`❌ Error en autenticación con ${company}:`, error.response?.data || error.message);
        throw new Error(`Error en autenticación con ${company}`);
    }
}

module.exports = { getAuthToken };
