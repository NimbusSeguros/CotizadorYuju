const soap = require('soap');
const config = require('../config'); // Asegurate que tenga config.INTEGRITY_WSDL_URL y config.INTEGRITY_TICKET

async function cotizarIntegrity(datos) {
    const wsdlUrl = config.INTEGRITY_WSDL_URL || 'https://test.integritynet.com.ar/LibertyWS/service.asmx?WSDL';

    const xml = `
        <DatosCotizacion Emitir="N" Ticket="${config.INTEGRITY_TICKET}" ModoEjecucionProcesoCalculo="CompletoSinGestion">
            <DatosCliente>
                <Sexo>${datos.sexo || 'M'}</Sexo>
                <Provincia>${datos.provincia || '01'}</Provincia>
                <Localidad>${datos.localidad || '000716'}</Localidad>
                <CodigoPostal>${datos.codigoPostal || '1155'}</CodigoPostal>
                <SituacionIVA>${datos.situacionIVA || '05'}</SituacionIVA>
                <CondicionIIBB>${datos.condicionIIBB || '4'}</CondicionIIBB>
                <FechaNacimiento>${datos.fechaNacimiento || '03/09/1966'}</FechaNacimiento>
                <ClausulaAjuste>${datos.clausulaAjuste || '1'}</ClausulaAjuste>
            </DatosCliente>
            <DatosVehiculo>
                <Marca>${datos.marca || '12'}</Marca>
                <Modelo>${datos.modelo || '463'}</Modelo>
                <Anio>${datos.anio || '2021'}</Anio>
                <SumaAsegurada>${datos.sumaAsegurada || '155000'}</SumaAsegurada>
                <Destino>${datos.destino || '1'}</Destino>
                <EsRCM>${datos.esRCM || 'MA'}</EsRCM>
                <AniosSiniestralidad>${datos.aniosSiniestralidad || '0'}</AniosSiniestralidad>
            </DatosVehiculo>
            <DatosPropuesta>
                <Producto>${datos.producto || '0995'}</Producto>
                <Productor>${datos.productor || config.INTEGRITY_PRODUCTOR}</Productor>
                <PlanComercial>${datos.planComercial || '0014'}</PlanComercial>
                <FormaPago>${datos.formaPago || '1010'}</FormaPago>
                <Franquicia>${datos.franquicia || '1'}</Franquicia>
                <Cuotas>${datos.cuotas || '1'}</Cuotas>
                <FechaVigenciaDesde>${datos.fechaVigenciaDesde || '08-08-2024'}</FechaVigenciaDesde>
                <VigenciaContrato>${datos.vigenciaContrato || '4'}</VigenciaContrato>
                <PorcentajeDescuento>${datos.porcentajeDescuento || '0'}</PorcentajeDescuento>
                <Adicionales>
                    <Item>DP</Item>
                    <Item>PR</Item>
                    <Item>PD</Item>
                </Adicionales>
            </DatosPropuesta>
        </DatosCotizacion>
    `;

    return new Promise((resolve, reject) => {
        soap.createClient(wsdlUrl, (err, client) => {
            if (err) return reject(err);

            client.CotizarString({ cotizacion: xml }, (err, result) => {
                if (err) return reject(err);

                try {
                    const rawResponse = result?.CotizarStringResult;
                    resolve({ raw: rawResponse });
                } catch (e) {
                    reject(new Error("Error interpretando respuesta de Integrity"));
                }
            });
        });
    });
}

module.exports = { cotizarIntegrity };
