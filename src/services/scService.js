const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService');
const config = require('../config');

async function cotizarSanCristobal(datosCotizacion) {
    try {
        const token = await getAuthToken('SAN_CRISTOBAL');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const url = `${config.SAN_CRISTOBAL_API_URL}/api/Quoted/QuoteCA7`;

        // Validación de fecha de vigencia (no más de 30 días atrás)
        const hoy = new Date();
        const hace30dias = new Date();
        hace30dias.setDate(hoy.getDate() - 30);
        const fechaVigencia = new Date(datosCotizacion.fechaVigencia || hoy);
        const fechaFinal = (fechaVigencia >= hace30dias && fechaVigencia <= hoy)
            ? fechaVigencia.toISOString()
            : hoy.toISOString();

        const payload = {
            InsuredData: {
                AccountNumber: datosCotizacion.accountNumber || null,
                OfficialIDType: "Ext_DNI96",
                TaxID: datosCotizacion.numeroDocumento || "31999553",
                Gender: datosCotizacion.genero || "F",
                Subtype: "person",
                ProducerCode: datosCotizacion.productor || "02-006345"
            },
            PolicyData: {
                StartDate: fechaFinal,
                PolicyTermCode: datosCotizacion.policyTermCode || "HalfYear",
                PaymentMethodCode: datosCotizacion.paymentMethodCode || "creditcard",
                CurrencyCode: "ARS",
                PaymentFees: datosCotizacion.paymentFees || "6",
                CommercialAlternative: datosCotizacion.commercialAlternative || "-8",
                AffinityGroupPublicId: datosCotizacion.affinityGroupPublicId || "pc:47701",
                TypeOfContracting: datosCotizacion.typeOfContracting || "CA7_Traditional",
                Product: datosCotizacion.product || "Seguros Vehículo",
                PolicyType: datosCotizacion.policyType || "CA7_Car",
                LocationPostalCode: datosCotizacion.codigoPostal || 5000,
                LocationState: datosCotizacion.locationState || "AR_13"
            },
            VehicleData: {
                Vehicle: {
                    AccesoryAmount: datosCotizacion.accesoryAmount || 0,
                    AdditionalInterestTaxId: null,
                    AutomaticAdjust: datosCotizacion.automaticAdjust || 20,
                    Category: datosCotizacion.category || "Sedan",
                    FuelType: datosCotizacion.fuelType || "NAF",
                    Color: datosCotizacion.color || null,
                    HasGNC: Boolean(datosCotizacion.gnc) || false,
                    HasGPS: datosCotizacion.hasGPS || false,
                    IdVehicle: datosCotizacion.idVehicle || 0,
                    InfoautoCode: datosCotizacion.infoauto || "170837",
                    Is0Km: datosCotizacion.is0Km || false,
                    StatedAmount: datosCotizacion.statedAmount || 23940000,
                    Usage: datosCotizacion.uso || "Personal",
                    Year: datosCotizacion.anio || 2022,
                    IsNational: datosCotizacion.isNational || true,
                    RiskLocationPostalCode: datosCotizacion.riskLocationPostalCode || 1407,
                    RiskLocationState: datosCotizacion.riskLocationState || "AR_23"
                },
                Product: [
                    { ProductCode: "CA7_D" },
                    { ProductCode: "CA7_CM" }
                ]
            }
        };

        console.log("\u{1F4E6} Payload San Cristóbal:", payload);

        const response = await apiRequest('POST', url, payload, headers);
        return response;
    } catch (error) {
        console.error("❌ Error obteniendo cotización de San Cristóbal:", error.message);
        throw new Error("No se pudo obtener la cotización de San Cristóbal");
    }
}

module.exports = { cotizarSanCristobal };
