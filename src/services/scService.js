const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService');
const config = require('../config');

async function cotizarSanCristobal(datosCotizacion) {
    try {
        const token = await getAuthToken('SAN_CRISTOBAL'); // Obtener el token desde authService.js

        // Configurar los headers necesarios
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Configurar el payload para la solicitud
        const payload = {
            // Información del asegurado
            InsuredData: {
                AccountNumber: datosCotizacion.accountNumber || null,  // Si no se proporciona, se asigna null
                OfficialIDType: "Ext_DNI96",  // Este valor es fijo según la documentación
                TaxID: datosCotizacion.numeroDocumento || "31999553",  // Usamos el número de documento como TaxID
                Gender: datosCotizacion.genero || "F",  // Género, si no se pasa se asigna "F"
                Subtype: datosCotizacion.subtype || "person",  // Subtipo de asegurado
                ProducerCode: datosCotizacion.productor || "02-006345"  // ID del productor
            },

            // Información de la póliza
            PolicyData: {
                StartDate: datosCotizacion.startDate || "2025-03-31T13:15:53.209Z",  // Fecha de inicio
                PolicyTermCode: datosCotizacion.policyTermCode || "HalfYear",  // Código del periodo
                PaymentMethodCode: datosCotizacion.paymentMethodCode || "creditcard",  // Método de pago
                CurrencyCode: "ARS",  // Moneda
                PaymentFees: datosCotizacion.paymentFees || "6",  // Comisiones
                CommercialAlternative: datosCotizacion.commercialAlternative || "-8",  // Alternativa comercial
                AffinityGroupPublicId: datosCotizacion.affinityGroupPublicId || "pc:403",  // ID público de grupo de afinidad
                TypeOfContracting: datosCotizacion.typeOfContracting || "CA7_Traditional",  // Tipo de contratación
                Product: datosCotizacion.product || "Seguros Vehículo",  // Producto
                PolicyType: datosCotizacion.policyType || "CA7_Car",  // Tipo de póliza
                LocationPostalCode: datosCotizacion.codigoPostal || 5000,  // Código postal
                LocationState: datosCotizacion.locationState || "AR_13"  // Estado de localización
            },

            // Información del vehículo
            VehicleData: {
                Vehicle: {
                    AccesoryAmount: datosCotizacion.accesoryAmount || 0,  // Monto de accesorios
                    AdditionalInterestTaxId: null,  // No se ha definido un valor adicional
                    AutomaticAdjust: datosCotizacion.automaticAdjust || 20,  // Ajuste automático
                    Category: datosCotizacion.category || "Car4x4",  // Categoría del vehículo
                    FuelType: datosCotizacion.fuelType || "NAF",  // Tipo de combustible
                    Color: datosCotizacion.color || null,  // Color
                    HasGNC: datosCotizacion.gnc || false,  // GNC: verdadero o falso
                    HasGPS: datosCotizacion.hasGPS || false,  // GPS
                    IdVehicle: datosCotizacion.idVehicle || 0,  // ID del vehículo
                    InfoautoCode: datosCotizacion.infoauto || "460913",  // Código de infoauto (verificado)
                    Is0Km: datosCotizacion.is0Km || false,  // Si es 0 km
                    StatedAmount: datosCotizacion.statedAmount || 3252000,  // Monto asegurado
                    Usage: datosCotizacion.uso || "Personal",  // Uso del vehículo
                    Year: datosCotizacion.anio || 2020,  // Año del vehículo
                    IsNational: datosCotizacion.isNational || false,  // ¿Es nacional?
                    RiskLocationPostalCode: datosCotizacion.riskLocationPostalCode || 1407,  // Código postal del riesgo
                    RiskLocationState: datosCotizacion.riskLocationState || "AR_23"  // Estado del riesgo
                },
                Product: [
                    { ProductCode: datosCotizacion.productCode || "CA7_D" },
                    { ProductCode: datosCotizacion.productCode || "CA7_CM" }
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
