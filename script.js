window.calcularRuta = function() {
  const origen = origenSelect.value;
  const destino = destinoSelect.value;

  const linea1 = ["Talleres","San Bernabé","Unidad Modelo","Aztlán","Penitenciaría","Alfonso Reyes","Mitras","Simón Bolívar","Hospital","Edison","Central","Cuauhtémoc","Del Golfo","Félix Gómez","Parque Fundidora","Y Griega","Eloy Cavazos","Lerdo de Tejada","Exposición"];
  const linea2 = ["Sendero","Tapia","San Nicolás","Anáhuac","Universidad","Niños Héroes","Regina","General Anaya","Cuauhtémoc","Alameda","Fundadores","Padre Mier","General I. Zaragoza","Hospital Metropolitano","Los Ángeles","Ruiz Cortines","Col. Moderna","Metalúrgica","Col. Obrera","Santa Lucía"];
  const linea3 = ["Hospital Metropolitano","General I. Zaragoza","Félix U. Gómez","Santa Lucía"];

  let ruta = [];
  let tiempo = 0;

  // Caso: misma línea
  if (linea1.includes(origen) && linea1.includes(destino)) {
    const i1 = linea1.indexOf(origen);
    const i2 = linea1.indexOf(destino);
    ruta = linea1.slice(Math.min(i1,i2), Math.max(i1,i2)+1);
    tiempo = Math.abs(i2 - i1) * 2;
  } else if (linea2.includes(origen) && linea2.includes(destino)) {
    const i1 = linea2.indexOf(origen);
    const i2 = linea2.indexOf(destino);
    ruta = linea2.slice(Math.min(i1,i2), Math.max(i1,i2)+1);
    tiempo = Math.abs(i2 - i1) * 2;
  } else if (linea3.includes(origen) && linea3.includes(destino)) {
    const i1 = linea3.indexOf(origen);
    const i2 = linea3.indexOf(destino);
    ruta = linea3.slice(Math.min(i1,i2), Math.max(i1,i2)+1);
    tiempo = Math.abs(i2 - i1) * 2;
  } else {
    document.getElementById("info").innerHTML = `
      Ruta calculada de ${origen} a ${destino}:<br>
      Necesitas hacer transbordo en una estación de intercambio (ej. Cuauhtémoc, Félix Gómez, General I. Zaragoza).
    `;
    return;
  }

  // Tiempo y transbordos
  const estacionesTotales = ruta.length;
  const minutosPorEstacion = 2;
  const minutosPorTransbordo = 3;
  const puntosTransbordo = ["Cuauhtémoc", "General I. Zaragoza", "Félix Gómez"];
  const transbordos = ruta.filter(e => puntosTransbordo.includes(e)).length;
  const tiempoEstimado = (estacionesTotales - 1) * minutosPorEstacion + transbordos * minutosPorTransbordo;

  // Info rápida
  document.getElementById("info").innerText =
    `Trayecto: ${estacionesTotales} estaciones — ${transbordos} transbordo(s) — Tiempo estimado: ${tiempoEstimado} minutos`;

  // Narrativa detallada
  const origenNombre = ruta[0];
  const destinoNombre = ruta[ruta.length - 1];
  const intermedias = ruta.slice(1, -1);

  const listadoCorto = intermedias.slice(0, 6).join(', ');
  const hayMas = intermedias.length > 6 ? `, entre otras` : '';

  let descripcion = `<h3>📍 Detalles del recorrido</h3>
    <p>Sales de <b>${origenNombre}</b>.</p>`;

  if (ruta.includes("Cuauhtémoc")) {
    descripcion += `<p>Transbordas en <b>Cuauhtémoc</b> hacia otra línea.</p>`;
  }
  if (ruta.includes("General I. Zaragoza")) {
    descripcion += `<p>Conectas en <b>General I. Zaragoza</b> hacia la Línea 3.</p>`;
  }
  if (ruta.includes("Félix Gómez")) {
    descripcion += `<p>Conectas en <b>Félix Gómez</b> hacia la Línea 3.</p>`;
  }

  if (intermedias.length) {
    descripcion += `<p>En el trayecto atraviesas estaciones como <b>${listadoCorto}</b>${hayMas}.</p>`;
  }

  descripcion += `<p>Finalmente llegas a <b>${destinoNombre}</b>.</p>
    <p><b>Número de estaciones:</b> ${estacionesTotales}.</p>
    <p><b>Tiempo estimado del viaje:</b> ${tiempoEstimado} minutos.</p>`;

  document.getElementById('descripcion').innerHTML = descripcion;

  // Dibujar línea en el mapa siguiendo todas las estaciones del tramo
  const coordsRuta = ruta.map(nombre => estaciones.find(e => e.nombre === nombre).coords);

  if (map.getSource("ruta")) {
    map.removeLayer("ruta");
    map.removeSource("ruta");
  }

  map.addSource("ruta", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coordsRuta }
    }
  });

  map.addLayer({
    id: "ruta",
    type: "line",
    source: "ruta",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff6f00", "line-width": 4 }
  });
};
