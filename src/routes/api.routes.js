const express = require('express');
const router = express.Router();
const { fetchDataFromAPI } = require('../services/externalService');
const { fetchDataWithJWT } = require('../services/externalJWTService');
const { cotizarRUS } = require('../services/rusService');
const { obtenerCotizacionMercantilAndina } = require('../services/maService');
const { getAuthToken } = require('../services/authService');
const { enviarSolicitudSOAP } = require('../services/integrityService');
const { cotizarTodasLasCompanias } = require('../services/cotizacionService');
const config = require('../config');
const { getMarcas } = require("../services/infoAutoService");
const { getToken } = require("../services/infoAutoService")




//  Probar autenticación de cualquier aseguradora
router.post('/auth/:company', async (req, res) => {
    try {
        const company =  req.params.company.toUpperCase().replace("-", "_"); // Normaliza los nombres
        
        if (!company) {
            return res.status(400).json({ error: "Falta el parámetro company en la URL" });
        }

        const token = await getAuthToken(company.toUpperCase()); 
        res.json({ company, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

///////////////////////////// ESTOS SON PARA PROBAR LAS COTIZACIONES //////////////////////////////////////////

router.post('/cotizar/rus', async (req, res) => {
    try {
        const result = await cotizarRUS();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la cotización con RUS" });
    }
});

const { cotizarConExperta } = require('../services/expertaService');

router.post('/cotizar/experta', async (req, res) => {
    try {
        const result = await cotizarConExperta(req.body);
        res.json(result);
    } catch (error) {
        console.error("❌ Error en cotización con EXPERTA:", error);
        res.status(500).json({ error: "Error al obtener la cotización con EXPERTA" });
    }
});

router.post('/cotizar', async (req, res) => {
    try {
        const cotizaciones = await cotizarTodasLasCompanias(req.body);
        res.json({ cotizaciones });
    } catch (error) {
        console.error("❌ Error general en cotización:", error.message);
        res.status(500).json({ error: "Error al obtener las cotizaciones." });
    }
});

///////////////////////////////////// I N F O      A U T O ////////////////////////////////////////

router.get("/infoauto/modelos/:marcaId", async (req, res) => {
  try {
    const token = await getToken();
    const { marcaId } = req.params;

    const response = await fetch(`https://api.infoauto.com.ar/cars/pub/brands/${marcaId}/models`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log("🧾 Modelos crudos de InfoAuto:", data);

    if (!response.ok) {
      console.error("❌ Error al obtener modelos:", data);
      return res.status(500).json({ error: "Error al obtener modelos" });
    }

    const modelos = data.map((m) => ({
      id: m.codia,
      name: m.description
    }));

    res.json(modelos);
  } catch (error) {
    console.error("❌ Error en /infoauto/modelos:", error);
    res.status(500).json({ error: "Fallo al obtener modelos" });
  }
});

router.get("/infoauto/fake-cotizaciones", (req, res) => {
  res.json([
    {
      id: 1,
      name: "RUS",
      logo: "/logos/rus.png",
      status: "Actualmente el sistema de RUS se encuentra bajo una actualización, probá nuevamente en unos minutos",
      prices: {
        responsabilidad: { min: 5000, max: 10000 },
        terceros: { min: 8000, max: 10000 },
        tercerosCompleto: { min: 9000, max: 10000 },
        todoRiesgo: { min: 10000, max: 10000 },
      },
    },
    {
      id: 2,
      name: "San Cristóbal",
      logo: "/logos/san-cristobal.png",
      prices: {
        responsabilidad: { min: 5000, max: 10000 },
        terceros: { min: 8000, max: 10000 },
        tercerosCompleto: { min: 9000, max: 10000 },
        todoRiesgo: { min: 10000, max: 10000 },
      },
    },
    {
      id: 3,
      name: "Experta",
      logo: "/logos/experta.png",
      prices: {
        responsabilidad: { min: 5000, max: 10000 },
        terceros: { min: 8000, max: 10000 },
        tercerosCompleto: { min: 9000, max: 10000 },
        todoRiesgo: { min: 10000, max: 10000 },
      },
    },
    {
      id: 4,
      name: "Mercantil Andina",
      logo: "/logos/mercantil-andina.png",
      prices: {
        responsabilidad: { min: 5000, max: 10000 },
        terceros: { min: 8000, max: 10000 },
        tercerosCompleto: { min: 9000, max: 10000 },
        todoRiesgo: { min: 10000, max: 10000 },
      },
    },
    {
      id: 5,
      name: "Intégrity",
      logo: "/logos/integrity.png",
      prices: {
        responsabilidad: { min: 5000, max: 10000 },
        terceros: { min: 8000, max: 10000 },
        tercerosCompleto: { min: 9000, max: 10000 },
        todoRiesgo: { min: 10000, max: 10000 },
      },
    }
  ])
})





router.get('/infoauto/marcas', async (req, res) => {
    try {
      const marcas = await getMarcas();
      res.json(marcas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'No se pudo obtener marcas' });
    }
  });


///////////////////////////////////// I N F O      A U T O ////////////////////////////////////////

router.get("/marcas", async (req, res) => {
  try {
    const marcas = await getMarcas()
    res.json(marcas)
  } catch (error) {
    console.error("Error en /api/infoauto/marcas:", error.message)
    res.status(500).json({ error: "Error al obtener marcas desde InfoAuto" })
  }
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/cotizar/auto', async (req, res) => {
    try {
        const params = req.body;

        const [rus, integrity, mercantil, experta, sanCristobal] = await Promise.all([
            cotizarRUS(params),
            cotizarExperta(params)
        ]);

        const cotizaciones = [rus, experta].filter(Boolean);

        res.json({ cotizaciones });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener cotizaciones." });
    }
});


router.post('/mercantil-andina/cotizacion-auto', async (req, res) => {
    const datosCotizacion = req.body; // Recibe el JSON completo desde la petición

    try {
        const cotizacion = await obtenerCotizacionMercantilAndina(datosCotizacion);
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.post('/san-cristobal/cotizacion-auto', async (req, res) => { //Esta URL no es correcta, verificar
//     const datosCotizacion = req.body;

//     try {
//         const cotizacion = await obtenerCotizacionSanCristobal(datosCotizacion);
//         res.json(cotizacion);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.post('/san-cristobal/cotizacion-auto', async (req, res) => {
    const {
        marca, modelo, anio, uso, sumaAsegurada, tipoCobertura,
        tipoDocumento, numeroDocumento, nombre, apellido, email, telefono
    } = req.body;

    // Validar que todos los parámetros requeridos estén presentes
    if (!marca || !modelo || !anio || !uso || !sumaAsegurada || !tipoCobertura ||
        !tipoDocumento || !numeroDocumento || !nombre || !apellido || !email || !telefono) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const datosCotizacion = {
            marca,
            modelo,
            anio,
            uso,
            sumaAsegurada,
            tipoCobertura,
            tipoDocumento,
            numeroDocumento,
            nombre,
            apellido,
            email,
            telefono
        };

        const cotizacion = await obtenerCotizacionSanCristobal(datosCotizacion);
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/datos', async (req, res) => {
    try {
        const data1 = await fetchDataFromAPI(config.EXTERNAL_API_1);
        const data2 = await fetchDataFromAPI(config.EXTERNAL_API_2);

        // 🔹 Formateo de datos para estandarizarlos
        const formattedData = {
            source1: data1,
            source2: data2,
        };

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', (req, res) => {
    res.send('¡La API Gateway está funcionando correctamente!');
});

router.get('/jwt-data', async (req, res) => {
    try {
        const data = await fetchDataWithJWT();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/cotizar/integrity', async (req, res) => {
    try {
        const { sexo, provincia, localidad, marca, modelo, anio, sumaAsegurada } = req.body;

        // Generamos el XML de cotización dinámicamente
        const xmlData = `
        <DatosCotizacion Emitir="N" Ticket="${config.INTEGRITY_TICKET}" ActualizarMovimiento="S" ModoEjecucionProcesoCalculo="CompletoSinGestion">
            <DatosCliente>
                <Sexo>${sexo}</Sexo>
                <Provincia>${provincia}</Provincia>
                <Localidad>${localidad}</Localidad>
            </DatosCliente>
            <DatosVehiculo>
                <Marca>${marca}</Marca>
                <Modelo>${modelo}</Modelo>
                <Anio>${anio}</Anio>
                <SumaAsegurada>${sumaAsegurada}</SumaAsegurada>
            </DatosVehiculo>
            <DatosPropuesta>
                <Productor>${config.INTEGRITY_PRODUCTOR}</Productor>
            </DatosPropuesta>
        </DatosCotizacion>`;

        const response = await enviarSolicitudSOAP(xmlData);
        res.send(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Así se tomarían los parámetros sueltos del front y se armaría la request para Mercantil Andina
router.post('/cotizacion-auto/unificada', async (req, res) => {
    const {
        sucursal, productor, tipoDocumento, numeroDocumento, apellido, nombre, email, telefono,
        anio, marca, modelo, version, uso
    } = req.body;

    try {
        // 🔄 Construcción del objeto para Mercantil Andina
        const datosCotizacion = {
            sucursal: sucursal || "001", // Valor por defecto si no se recibe
            productor: productor || "0000", // Valor por defecto si no se recibe
            tomador: {
                tipoDocumento: tipoDocumento || "DNI",
                numeroDocumento: numeroDocumento || "00000000",
                apellido: apellido || "Apellido",
                nombre: nombre || "Nombre",
                email: email || "correo@example.com",
                telefono: telefono || "123456789"
            },
            vehiculo: {
                anio: anio || 2023,
                marca: marca || "Toyota",
                modelo: modelo || "Corolla",
                version: version || "XEI",
                uso: uso || "particular"
            }
        };

        // 🔥 Enviar solicitud a Mercantil Andina
        const cotizacion = await obtenerCotizacionMercantilAndina(datosCotizacion);
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
