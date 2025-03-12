require('dotenv').config();
const app = require('./src/app');
const setupSwagger = require('./src/docs/swaggerDocs');


const PORT = process.env.PORT || 3000;

// Inicializar Swagger
setupSwagger(app);

app.listen(PORT, () => {
    console.log(`API Gateway corriendo en http://localhost:${PORT}`);
});
