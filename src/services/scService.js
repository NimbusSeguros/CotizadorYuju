const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService');
const config = require('../config');

async function cotizarSanCristobal(datosCotizacion) {
    try {
        const token = await getAuthToken('SAN_CRISTOBAL'); // Obtener el token desde authService.js

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Configuración del payload
        const payload = {
            // Información del asegurado
            InsuredData: {
                AccountNumber: datosCotizacion.accountNumber || null,
                OfficialIDType: "Ext_DNI96", // Según el formato requerido
                TaxID: datosCotizacion.numeroDocumento || "31999553", // Número de documento
                Gender: datosCotizacion.genero || "F", // Género
                Subtype: "person", // Subtipo del asegurado
                ProducerCode: datosCotizacion.productor || "02-006345" // ID del productor
            },

            // Información de la póliza
            PolicyData: {
                StartDate: datosCotizacion.startDate || "2025-03-31T13:15:53.209Z", // Fecha de inicio
                PolicyTermCode: datosCotizacion.policyTermCode || "HalfYear", // Código del periodo
                PaymentMethodCode: datosCotizacion.paymentMethodCode || "creditcard", // Método de pago
                CurrencyCode: "ARS", // Moneda
                PaymentFees: datosCotizacion.paymentFees || "6", // Comisiones
                CommercialAlternative: datosCotizacion.commercialAlternative || "-8", // Alternativa comercial
                AffinityGroupPublicId: datosCotizacion.affinityGroupPublicId || "pc:47701", // ID público de grupo de afinidad
                TypeOfContracting: datosCotizacion.typeOfContracting || "CA7_Traditional", // Tipo de contratación
                Product: datosCotizacion.product || "Seguros Vehículo", // Producto
                PolicyType: datosCotizacion.policyType || "CA7_Car", // Tipo de póliza
                LocationPostalCode: datosCotizacion.codigoPostal || 5000, // Código postal
                LocationState: datosCotizacion.locationState || "AR_13" // Estado de localización
            },

            // Información del vehículo
            VehicleData: {
                //ESTO CORRESPONDE AL NORMAL , UTILIZAMOS LA PARTE NO COMENTADA PARA TESTING, PARA PLENO FUNCIONAMIENTO BORRAR LA SEGUNDA Y DESCOMENTAR ESTA
                // Vehicle: {
                //     AccesoryAmount: datosCotizacion.accesoryAmount || 0, // Monto de accesorios
                //     AdditionalInterestTaxId: null, // Sin valor adicional
                //     AutomaticAdjust: datosCotizacion.automaticAdjust || 20, // Ajuste automático
                //     Category: datosCotizacion.category || "Car4x4", // Categoría del vehículo
                //     FuelType: datosCotizacion.fuelType || "NAF", // Tipo de combustible
                //     Color: datosCotizacion.color || null, // Color
                //     HasGNC: datosCotizacion.gnc || false, // GNC: verdadero o falso
                //     HasGPS: datosCotizacion.hasGPS || false, // GPS
                //     IdVehicle: datosCotizacion.idVehicle || 0, // ID del vehículo
                //     InfoautoCode: datosCotizacion.infoauto || "460913", // Código infoauto
                //     Is0Km: datosCotizacion.is0Km || false, // Si es 0 km
                //     StatedAmount: datosCotizacion.statedAmount || 3252000, // Monto asegurado
                //     Usage: datosCotizacion.uso || "Personal", // Uso del vehículo
                //     Year: datosCotizacion.anio || 2020, // Año del vehículo
                //     IsNational: datosCotizacion.isNational || false, // ¿Es nacional?
                //     RiskLocationPostalCode: datosCotizacion.riskLocationPostalCode || 1407, // Código postal del riesgo
                //     RiskLocationState: datosCotizacion.riskLocationState || "AR_23" // Estado del riesgo
                // },
                Vehicle: {
                    "AccesoryAmount": 0,
                    "AdditionalInterestTaxId": null,
                    "AutomaticAdjust": 20,
                    "Category": "Car4x4",  // Asegúrate de que la categoría sea válida
                    "FuelType": "NAF",  // Tipo de combustible
                    "Color": null,  // Sin valor asignado
                    "HasGNC": false,  // No tiene GNC
                    "HasGPS": false,  // No tiene GPS
                    "IdVehicle": 0,  // No tiene ID de vehículo asignado
                    "InfoautoCode": "460913",  // Un código de Infoauto válido
                    "Is0Km": false,  // No es 0Km
                    "StatedAmount": 3252000,  // Monto asegurado
                    "Usage": "Personal",  // Uso del vehículo
                    "Year": 2020,  // Año del vehículo
                    "IsNational": false,  // No es un vehículo nacional
                    "RiskLocationPostalCode": 1407,  // Código postal de riesgo
                    "RiskLocationState": "AR_23"  // Estado de riesgo
                },                 
                Product: [
                    { ProductCode: datosCotizacion.productCode || "CA7_D" }, // Código del producto
                    { ProductCode: datosCotizacion.productCode || "CA7_CM" } // Código del producto alternativo
                ]
            }
        };

        console.log("\u{1F4E6} Payload San Cristóbal:", payload);

        // Realizar la solicitud a la API de San Cristóbal
        const response = await apiRequest('POST', config.SAN_CRISTOBAL_API_URL, payload, headers);

        return response;
    } catch (error) {
        console.error("❌ Error obteniendo cotización de San Cristóbal:", error.message);
        throw new Error("No se pudo obtener la cotización de San Cristóbal");
    }
}

module.exports = { cotizarSanCristobal };
