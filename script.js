mapboxgl.accessToken = 'pk.eyJ1Ijoic29sb3lveWplaG92YSIsImEiOiJjbWsyZ3FheXcwZnE5M2ZxNHduOTBnM3c2In0.c6ZiIV6kck5DH-pY9ftlTg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-100.309, 25.673],
  zoom: 11
});

// Colores por línea
const coloresLineas = {
  1: "#0066FF", // Azul (más visible)
  2: "#FFC400", // Amarillo
  3: "#FF2D2D"  // Rojo
};

// Estaciones con línea asignada (ajusta según tu red real)
const estaciones = [
  { nombre: "Talleres", lat: 25.75389, lng: -100.36528, linea: 1 },
  { nombre: "San Bernabé", lat: 25.74833, lng: -100.36167, linea: 1 },
  { nombre: "Unidad Modelo", lat: 25.74194, lng: -100.35500, linea: 1 },
  { nombre: "Aztlán", lat: 25.73222, lng: -100.34750, linea: 1 },
  { nombre: "Penitenciaría", lat: 25.72333, lng: -100.34250, linea: 1 },
  { nombre: "Alfonso Reyes", lat: 25.71556, lng: -100.33611, linea: 1 },
  { nombre: "Mitras", lat: 25.70694, lng: -100.33000, linea: 1 },
  { nombre: "Simón Bolívar", lat: 25.69833, lng: -100.32333, linea: 1 },
  { nombre: "Hospital", lat: 25.68972, lng: -100.31667, linea: 1 },
  { nombre: "Edison", lat: 25.68111, lng: -100.31000, linea: 1 },
  { nombre: "Central", lat: 25.67250, lng: -100.30333, linea: 1 },
  { nombre: "Cuauhtémoc", lat: 25.67300, lng: -100.30900, linea: 1 }, // nodo de transbordo L1-L2
  { nombre: "Del Golfo", lat: 25.67472, lng: -100.31444, linea: 2 },
  { nombre: "Félix U. Gómez", lat: 25.67639, lng: -100.31972, linea: 2 },
  { nombre: "Parque Fundidora", lat: 25.67806, lng: -100.32500, linea: 2 },
  { nombre: "Y Griega", lat: 25.67972, lng: -100.33028, linea: 2 },
  { nombre: "Eloy Cavazos", lat: 25.68139, lng: -100.33556, linea: 2 },
  { nombre: "Lerdo de Tejada", lat: 25.68306, lng: -100.34083, linea: 2 },
  { nombre: "Exposición", lat: 25.68472, lng: -100.34611, linea: 2 },
  { nombre: "General I. Zaragoza", lat: 25.71167, lng: -100.22333, linea: 3 }, // nodo L2-L3
  { nombre: "Hospital Metropolitano", lat: 25.70500, lng: -100.21833, linea: 3 },
  { nombre: "Los Ángeles", lat: 25.69833, lng: -100.21333, linea: 3 },
  { nombre: "Ruiz Cortines", lat: 25.69167, lng: -100.20833, linea: 3 },
  { nombre: "Col. Moderna", lat: 25.68500, lng: -100.20333, linea: 3 },
  { nombre: "Metalúrgica", lat: 25.67833, lng: -100.19833, linea: 3 },
  { nombre: "Col. Obrera", lat: 25.67167, lng: -100.19333, linea: 3 },
  { nombre: "Santa Lucía", lat: 25.66500, lng: -100.18833, linea: 3 }
];

// Utilidad: crear un marcador SVG tipo gota con hoyo
function crearGota(colorHex) {
  const el = document.createElement('div');
  el.style.width = '28px';
  el.style.height = '28px';
  el.style.transform = 'translate(-14px, -28px)'; // ajustar anclaje
  el.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <!-- Gota -->
      <path d="M14 0 C9 7 4 11 4 17 C4 22.5 8.5 27 14 27 C19.5 27 24 22.5 24 17 C24 11 19 7 14 0 Z" fill="${colorHex}" stroke="white" stroke-width="2"/>
      <!-- Hoyo -->
      <circle cx="14" cy="17" r="5" fill="white"/>
    </svg>
  `;
  return el;
}

map.on('load', () => {
  estaciones.forEach(est => {
    const color = coloresLineas[est.linea] || '#FF8C00';
    const el = crearGota(color);

    new mapboxgl.Marker(el)
      .setLngLat([est.lng, est.lat])
      .setPopup(new mapboxgl.Popup().setText(est.nombre))
      .addTo(map);
  });
});

// Selects de origen/destino
const origenSelect = document.getElementById('origen');
const destinoSelect = document.getElementById('destino');
estaciones.forEach(est => {
  origenSelect.add(new Option(est.nombre, est.nombre));
  destinoSelect.add(new Option(est.nombre, est.nombre));
});

function calcularRuta() {
  const origenIndex = estaciones.findIndex(e => e.nombre === origenSelect.value);
  const destinoIndex = estaciones.findIndex(e => e.nombre === destinoSelect.value);
  if (origenIndex === -1 || destinoIndex === -1) return;

  // Evento personalizado en Google Analytics
  gtag('event', 'calcular_ruta', {
    event_category: 'interaccion',
    event_label: `${origenSelect.value} → ${destinoSelect.value}`
  });

  const tramo = origenIndex < destinoIndex
    ? estaciones.slice(origenIndex, destinoIndex + 1)
    : estaciones.slice(destinoIndex, origenIndex + 1).reverse();

  const coords = tramo.map(e => [e.lng, e.lat]);

  const ruta = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } };
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
  map.addSource('route', { type: 'geojson', data: ruta });
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#ff0000', 'line-width': 4 }
  });

  // Tiempo y transbordos
  const estacionesTotales = tramo.length;
  const minutosPorEstacion = 2;
  const minutosPorTransbordo = 3;
  const puntosTransbordo = ["Cuauhtémoc", "General I. Zaragoza"];
  const transbordos = tramo.filter(e => puntosTransbordo.includes(e.nombre)).length;
  const tiempoEstimado = (estacionesTotales - 1) * minutosPorEstacion + transbordos * minutosPorTransbordo;

  document.getElementById('info').innerText =
    `Trayecto: ${estacionesTotales} estaciones — ${transbordos} transbordo(s) — Tiempo estimado: ${tiempoEstimado} minutos`;

  // Descripción narrativa
  const origenNombre = tramo[0].nombre;
  const destinoNombre = tramo[tramo.length - 1].nombre;
  const intermedias = tramo.slice(1, -1).map(e => e.nombre);
  const listadoCorto = intermedias.slice(0, 6).join(', ');
  const hayMas = intermedias.length > 6 ? `, entre otras` : '';

  let descripcion = `<h3>📍 Detalles del recorrido</h3>
    <p><b>Líneas involucradas:</b></p>
    <p>Sales de <b>${origenNombre}</b> en la línea correspondiente.</p>`;

  if (tramo.some(e => e.nombre === "Cuauhtémoc")) {
    descripcion += `<p>Transbordas en <b>Cuauhtémoc</b> hacia la Línea 2.</p>`;
  }
  if (tramo.some(e => e.nombre === "General I. Zaragoza")) {
    descripcion += `<p>Continúas hasta <b>General I. Zaragoza</b>, donde conectas con la Línea 3.</p>`;
  }

  if (intermedias.length) {
    descripcion += `<p>En el trayecto atraviesas estaciones como <b>${listadoCorto}</b>${hayMas}.</p>`;
  }

  descripcion += `<p>Finalmente llegas a <b>${destinoNombre}</b>.</p>
    <p><b>Número de estaciones:</b> ${estacionesTotales} en total.</p>
    <p><b>Tiempo promedio:</b> 1.5–2 minutos por tramo + ${minutosPorTransbordo} minutos por transbordo.</p>
    <p><b>Tiempo estimado del viaje:</b> ${tiempoEstimado} minutos.</p>`;

  document.getElementById('descripcion').innerHTML = descripcion;
}
