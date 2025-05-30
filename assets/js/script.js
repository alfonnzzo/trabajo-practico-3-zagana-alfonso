const inputBusqueda  = document.getElementById('input-busqueda');
const contenedorData = document.getElementById('contenedor-data');
const API_BASE       = 'https://dragonball-api.com/api/characters';

// --- Función invocada desde onsubmit en el formulario ---
async function buscar(event) {
  event.preventDefault();
  const q = inputBusqueda.value.trim();
  clearResults();
  mostrarLoading(q ? 'Buscando personajes…' : 'Cargando personajes…');

  const endpoint = q 
    ? `${API_BASE}?name=${encodeURIComponent(q)}`
    : API_BASE;

  const personajes = await cargarDatos(endpoint);
  if (personajes.length === 0) {
    mostrarMensaje(q 
      ? `No se encontraron personajes para “${q}”.`
      : 'No hay personajes disponibles.');
  } else {
    renderizarPersonajes(personajes);
  }
}

// --- Inicialización al cargar la página ---
window.addEventListener('DOMContentLoaded', async () => {
  mostrarLoading('Cargando personajes…');
  const personajes = await cargarDatos(API_BASE);
  personajes.length
    ? renderizarPersonajes(personajes)
    : mostrarMensaje('No se encontraron personajes.');
});

// --- Delegación para “Ver más” ---
contenedorData.addEventListener('click', e => {
  if (e.target.classList.contains('btn-ver-detalles')) {
    const card = e.target.closest('[data-id]');
    verDetalles(card.dataset.id);
  }
});

// --- Helpers de UI ---
function clearResults() {
  contenedorData.innerHTML = '';
}

function mostrarLoading(texto) {
  contenedorData.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">${texto}</p>
    </div>`;
}

function mostrarMensaje(texto) {
  contenedorData.innerHTML = `
    <div class="col-12">
      <div class="alert alert-warning" role="alert">
        ${texto}
      </div>
    </div>`;
}

// --- Comunicación con la API ---
async function cargarDatos(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.items)
      ? json.items
      : (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error('API error:', err);
    mostrarMensaje('Error al conectar con la API.');
    return [];
  }
}

// --- Renderizado de tarjetas ---
function renderizarPersonajes(personajes) {
  clearResults();
  const fragment = document.createDocumentFragment();

  personajes.forEach(personaje => {
    const { id, name, image, race, gender } = personaje;
    const col = document.createElement('div');
    col.classList.add('col-md-3', 'mb-4');
    col.dataset.id = id;
    col.innerHTML = `
      <div class="card shadow-sm p-3 border rounded text-center bg-light h-100">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <img
            src="${image}"
            alt="${name}"
            class="img-fluid rounded mb-2"
            style="max-height: 200px;"
          />
          <p><strong>Raza:</strong> ${race}</p>
          <p><strong>Género:</strong> ${gender}</p>
          <button class="btn btn-success btn-ver-detalles">Ver más</button>
        </div>
      </div>`;
    fragment.appendChild(col);
  });

  contenedorData.appendChild(fragment);
}
// --- Alerta de "Ver más" ---
async function verDetalles(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    alert(data.description || 'Sin descripción disponible.');
  } catch (err) {
    console.error('Detalle error:', err);
    alert('No se pudo obtener detalles del personaje.');
  }
}