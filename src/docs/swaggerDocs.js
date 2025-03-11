const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Configuración de Swagger con YAML
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Gateway - Aseguradora",
            version: "1.0.0",
            description: "API para consultar seguros de distintas aseguradoras.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor Local",
            },
        ],
    },
    apis: [path.join(__dirname, "routes.yaml")], // Enlace al archivo YAML
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    console.log("📄 Swagger UI disponible en: http://localhost:3000/api-docs");
};

module.exports = setupSwagger;
