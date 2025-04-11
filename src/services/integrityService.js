const axios = require('axios');
const config = require('../config');
const { parseStringPromise } = require('xml2js');

async function cotizarIntegrity(datos) {
    const url = config.INTEGRITY_API_URL;

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <CotizarString xmlns="http://libertyargentina.com.ar/">
                <XMLString>
        <DatosCotizacion Emitir="N" Ticket="${config.INTEGRITY_TICKET}" TicketUsuario="" ActualizarMovimiento="S" ModoEjecucionProcesoCalculo="CompletoSinGestion">
            <DatosCliente>
                <Sexo>${datos.sexo || 'M'}</Sexo>
                <Provincia>${datos.provincia || '01'}</Provincia>
                <Localidad>${datos.localidad || '000716'}</Localidad>
                <SituacionIVA>${datos.iva || '05'}</SituacionIVA>
                <CondicionIIBB>${datos.iibb || '4'}</CondicionIIBB>
                <FechaNacimiento>${datos.fechaNacimiento || '08/08/2008'}</FechaNacimiento>
                <ClausulaAjuste>${datos.ajuste || '1'}</ClausulaAjuste>
                <TipoDocumento>${datos.tipoDocumento || '96'}</TipoDocumento>
                <CodigoPostal>${datos.codigoPostal || '1000'}</CodigoPostal>
            </DatosCliente>
            <DatosVehiculo>
                <Marca>${datos.marca || '18'}</Marca>
                <Modelo>${datos.modelo || '759'}</Modelo>
                <Anio>${datos.anio || '2023'}</Anio>
                <SumaAsegurada>${datos.sumaAsegurada || '47500000'}</SumaAsegurada>
                <Destino>${datos.destino || '1'}</Destino>
                <EsRCM>${datos.rcm || 'MA'}</EsRCM>
                <AniosSiniestralidad>0</AniosSiniestralidad>
                <Patente>${datos.patente || 'A/D'}</Patente>
                <Motor>${datos.motor || 'A/D'}</Motor>
                <Chasis>${datos.chasis || 'A/D'}</Chasis>
                <Provincia>${datos.provincia || '01'}</Provincia>
                <Localidad>${datos.localidad || '000716'}</Localidad>
                <Carroceria>${datos.carroceria || '4'}</Carroceria>
            </DatosVehiculo>
            <DatosPropuesta>
                <Producto>${datos.producto || '0053'}</Producto>
                <Productor>${config.INTEGRITY_PRODUCTOR}</Productor>
                <PlanComercial>${datos.plan || '14'}</PlanComercial>
                <FormaPago>${datos.formaPago || '1019'}</FormaPago>
                <Franquicia>${datos.franquicia || '1'}</Franquicia>
                <Cuotas>${datos.cuotas || '1'}</Cuotas>
                <FechaVigenciaDesde>${datos.fechaVigenciaDesde || '08-08-2024'}</FechaVigenciaDesde>
                <FechaVigenciaHasta>${datos.fechaVigenciaHasta || '08-11-2024'}</FechaVigenciaHasta>
                <VigenciaContrato>${datos.vigenciaContrato || '109'}</VigenciaContrato>
                <Descuentos/>
                <PorcentajeDescuento>${datos.descuento || '0'}</PorcentajeDescuento>
                <Adicionales>
                    <Item Limite="100062">PR</Item>
                    <Item>DP</Item>
                    <Item Limite="100062">G0</Item>
                    <Item Limite="100062">IN</Item>
                </Adicionales>
                <Accesorios/>
                <DatosServiciosEspeciales CodigoServicio="1" LlevaServicio="SI" Prestador="2"/>
                <IdentificadorCombo/>
            </DatosPropuesta>
        </DatosCotizacion>
                </XMLString>
            </CotizarString>
        </soap:Body>
    </soap:Envelope>`;

    try {
        const { data } = await axios.post(url, soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8'
            }
        });

        const parsed = await parseStringPromise(data, { explicitArray: false });
        const response = parsed['soap:Envelope']['soap:Body']['CotizarStringResponse']['CotizarStringResult'];

        console.log("✅ Respuesta Integrity XML:", response);
        return response;
    } catch (error) {
        console.error("❌ Error cotizando con Integrity:", error.message);
        throw new Error('No se pudo obtener cotización con Integrity');
    }
}

module.exports = { cotizarIntegrity };
