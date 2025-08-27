// utils/fechas.js
function toISODate(input, { exigirManiana = true } = {}) {
  // Acepta 'DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY' o Date.
  const today = new Date();
  const baseHoy = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let d = null;
  if (typeof input === 'string') {
    let m;
    if ((m = input.match(/^(\d{2})-(\d{2})-(\d{4})$/))) {         // DD-MM-YYYY
      d = new Date(+m[3], +m[2]-1, +m[1]);
    } else if ((m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {  // YYYY-MM-DD
      d = new Date(+m[1], +m[2]-1, +m[3]);
    } else if ((m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) { // DD/MM/YYYY
      d = new Date(+m[3], +m[2]-1, +m[1]);
    }
  } else if (input instanceof Date) {
    d = new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  if (!d) d = baseHoy;
  if (exigirManiana && d <= baseHoy) d = new Date(baseHoy.getFullYear(), baseHoy.getMonth(), baseHoy.getDate() + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function sumarDiasISO(isoYYYYMMDD, dias) {
  const [y,m,d] = isoYYYYMMDD.split('-').map(Number);
  const base = new Date(y, m-1, d);
  base.setDate(base.getDate() + dias);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth()+1).padStart(2,'0');
  const dd = String(base.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = { toISODate, sumarDiasISO };
