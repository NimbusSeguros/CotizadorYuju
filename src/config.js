require('dotenv').config();

console.log("🔍 Configuración cargada:");
console.log("JWT_API_LOGIN:", process.env.JWT_API_LOGIN);
console.log("JWT_API_DATA:", process.env.JWT_API_DATA);
console.log("JWT_USER:", process.env.JWT_USER);
console.log("JWT_PASS:", process.env.JWT_PASS);

module.exports = {
    JWT_API_LOGIN: process.env.JWT_API_LOGIN,
    JWT_API_DATA: process.env.JWT_API_DATA,
    JWT_USER: process.env.JWT_USER,
    JWT_PASS: process.env.JWT_PASS,
    RUS_API_URL: process.env.RUS_API_URL,
    RUS_API_USERNAME: process.env.RUS_API_USERNAME,
    RUS_API_PASSWORD: process.env.RUS_API_PASSWORD,

    INTEGRITY_API_URL: process.env.INTEGRITY_API_URL,
    INTEGRITY_PRODUCTOR: process.env.INTEGRITY_PRODUCTOR,
    INTEGRITY_TICKET: process.env.INTEGRITY_TICKET,
};
