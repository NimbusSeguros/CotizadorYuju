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
};
