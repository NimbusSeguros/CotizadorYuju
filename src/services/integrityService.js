const soap = require('soap');
const config = require('../config');

async function cotizarIntegrity(datos) {
    const xml = `
        <DatosCotizacion Emitir="N" Ticket="${config.INTEGRITY_TICKET}" TicketUsuario="${datos.ticketUsuario || '0990009963'}" ActualizarMovimiento="S" ModoEjecucionProcesoCalculo="CompletoSinGestion">
            <DatosCliente>
                <Sexo>${datos.sexo || 'M'}</Sexo>
                <Provincia>${datos.provincia || '01'}</Provincia>
                <Localidad>${datos.localidad || '000716'}</Localidad>
                <SituacionIVA>${datos.situacionIVA || '05'}</SituacionIVA>
                <CondicionIIBB>${datos.condicionIIBB || '4'}</CondicionIIBB>
                <FechaNacimiento>${datos.fechaNacimiento || '08/08/2008'}</FechaNacimiento>
                <ClausulaAjuste>${datos.clausulaAjuste || '1'}</ClausulaAjuste>
                <TipoDocumento>${datos.tipoDocumento || '96'}</TipoDocumento>
                <CodigoPostal>${datos.codigoPostal || '1000'}</CodigoPostal>
            </DatosCliente>
            <DatosVehiculo>
                <Marca>${datos.marca || '18'}</Marca>
                <Modelo>${datos.modelo || '759'}</Modelo>
                <Anio>${datos.anio || '2023'}</Anio>
                <SumaAsegurada>${datos.sumaAsegurada || '47500000'}</SumaAsegurada>
                <Destino>${datos.destino || '1'}</Destino>
                <EsRCM>${datos.esRCM || 'MA'}</EsRCM>
                <AniosSiniestralidad>${datos.aniosSiniestralidad || '0'}</AniosSiniestralidad>
                <Patente>${datos.patente || 'A/D'}</Patente>
                <Motor>${datos.motor || 'A/D'}</Motor>
                <Chasis>${datos.chasis || 'A/D'}</Chasis>
                <Provincia>${datos.provinciaVehiculo || datos.provincia || '01'}</Provincia>
                <Localidad>${datos.localidadVehiculo || datos.localidad || '000716'}</Localidad>
                <Carroceria>${datos.carroceria || '4'}</Carroceria>
            </DatosVehiculo>
            <DatosPropuesta>
                <Producto>${datos.producto || '0053'}</Producto>
                <Productor>${datos.productor || config.INTEGRITY_PRODUCTOR}</Productor>
                <PlanComercial>${datos.planComercial || '14'}</PlanComercial>
                <FormaPago>${datos.formaPago || '1019'}</FormaPago>
                <Franquicia>${datos.franquicia || '1'}</Franquicia>
                <Cuotas>${datos.cuotas || '1'}</Cuotas>
                <FechaVigenciaDesde>${datos.fechaVigenciaDesde || '08-08-2024'}</FechaVigenciaDesde>
                <FechaVigenciaHasta>${datos.fechaVigenciaHasta || '08-11-2024'}</FechaVigenciaHasta>
                <VigenciaContrato>${datos.vigenciaContrato || '109'}</VigenciaContrato>
                <Descuentos/>
                <PorcentajeDescuento>${datos.porcentajeDescuento || '0'}</PorcentajeDescuento>
                <Adicionales>
                    <Item Limite="${datos.limiteG0 || '100062'}">G0</Item>
                    <Item Limite="${datos.limiteIN || '100062'}">IN</Item>
                    <Item Limite="${datos.limitePR || '100062'}">PR</Item>
                    <Item>DP</Item>
                </Adicionales>
                <Accesorios/>
                <DatosServiciosEspeciales CodigoServicio="${datos.codigoServicio || '1'}" LlevaServicio="${datos.llevaServicio || 'SI'}" Prestador="${datos.prestador || '2'}"/>
                <IdentificadorCombo/>
            </DatosPropuesta>
        </DatosCotizacion>
    `;

    return new Promise((resolve, reject) => {
        soap.createClient(config.INTEGRITY_API_URL, (err, client) => {
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
