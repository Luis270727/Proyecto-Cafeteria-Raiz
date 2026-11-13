/* ==========================================================
   CAFÉ RAÍZ — JavaScript
   Orden del archivo:
   1. Utilidades de localStorage (JSON.stringify / JSON.parse)
   2. Menú hamburguesa
   3. Modo oscuro (se recuerda al recargar)
   4. Carga del menú con fetch (carga y errores)
   5. Tarjetas, buscador y favoritos (SweetAlert2)
   ========================================================== */


/* ----------------------------------------------------------
   1. UTILIDADES DE LOCALSTORAGE
   localStorage solo guarda texto, por eso convertimos con
   JSON.stringify al guardar y JSON.parse al leer.
   ---------------------------------------------------------- */
const CLAVE_TEMA = "cafeRaiz_tema";
const CLAVE_FAVORITOS = "cafeRaiz_favoritos";

function leerJSON(clave, valorPorDefecto) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorPorDefecto;
  } catch (error) {
    // Si el dato está dañado o el navegador bloquea el almacenamiento
    return valorPorDefecto;
  }
}

function guardarJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error);
  }
}


/* ----------------------------------------------------------
   2. MENÚ HAMBURGUESA (pantallas pequeñas)
   ---------------------------------------------------------- */
const btnMenu = document.getElementById("btn-menu");
const menuPrincipal = document.getElementById("menu-principal");

btnMenu.addEventListener("click", function () {
  const abierto = menuPrincipal.classList.toggle("abierto");
  btnMenu.setAttribute("aria-expanded", abierto);
  btnMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});


/* ----------------------------------------------------------
   3. MODO OSCURO
   Al cargar la página se lee la preferencia guardada.
   ---------------------------------------------------------- */
const btnTema = document.getElementById("btn-tema");

function aplicarTema(tema) {
  const oscuro = tema === "oscuro";
  document.body.classList.toggle("oscuro", oscuro);
  btnTema.textContent = oscuro ? "☀️" : "🌙";
  btnTema.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

aplicarTema(leerJSON(CLAVE_TEMA, "claro"));

btnTema.addEventListener("click", function () {
  const nuevoTema = document.body.classList.contains("oscuro") ? "claro" : "oscuro";
  aplicarTema(nuevoTema);
  guardarJSON(CLAVE_TEMA, nuevoTema);
});


/* ----------------------------------------------------------
   4. CARGA DEL MENÚ CON FETCH
   Los datos viven en data/bebidas.json. Mientras llegan se
   muestra "Cargando…"; si falla, un mensaje con botón de reintento.
   ---------------------------------------------------------- */
const URL_BEBIDAS = "../data/bebidas.json";

const contenedorTarjetas = document.getElementById("menu-tarjetas");
const estadoCarga = document.getElementById("estado-carga");
const estadoError = document.getElementById("estado-error");
const textoError = document.getElementById("texto-error");
const btnReintentar = document.getElementById("btn-reintentar");
const buscador = document.getElementById("buscador");
const sinResultados = document.getElementById("sin-resultados");
const listaFavoritos = document.getElementById("lista-favoritos");
const sinFavoritos = document.getElementById("sin-favoritos");

let bebidas = [];                                   // datos recibidos
let favoritos = leerJSON(CLAVE_FAVORITOS, []);      // ids guardados

async function cargarMenu() {
  estadoError.hidden = true;
  estadoCarga.hidden = false;
  contenedorTarjetas.innerHTML = "";

  try {
    const respuesta = await fetch(URL_BEBIDAS);

    // fetch NO lanza error con un 404 o 500: hay que revisarlo
    if (!respuesta.ok) {
      throw new Error("El servidor respondió con el código " + respuesta.status);
    }

    bebidas = await respuesta.json();
    mostrarTarjetas();
    mostrarFavoritos();
  } catch (error) {
    console.error("Error al cargar el menú:", error);
    textoError.textContent =
      "No pudimos cargar el menú. Revisa tu conexión (o que la página se abra desde un servidor) e inténtalo de nuevo.";
    estadoError.hidden = false;
  } finally {
    estadoCarga.hidden = true;   // se ejecuta con éxito o con error
  }
}

btnReintentar.addEventListener("click", cargarMenu);


/* ----------------------------------------------------------
   5. TARJETAS, BUSCADOR Y FAVORITOS
   ---------------------------------------------------------- */
function crearTarjeta(bebida) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";
  tarjeta.dataset.nombre = bebida.nombre.toLowerCase();

  const titulo = document.createElement("h3");
  titulo.textContent = bebida.nombre;

  const descripcion = document.createElement("p");
  descripcion.textContent = bebida.descripcion;

  const pie = document.createElement("div");
  pie.className = "tarjeta-pie";

  const precio = document.createElement("span");
  precio.className = "precio";
  precio.textContent = "$" + bebida.precio + " MXN";

  const boton = document.createElement("button");
  boton.className = "btn-fav";
  boton.type = "button";
  boton.dataset.id = bebida.id;
  actualizarBotonFavorito(boton, favoritos.includes(bebida.id), bebida.nombre);

  pie.append(precio, boton);
  tarjeta.append(titulo, descripcion, pie);
  return tarjeta;
}

function actualizarBotonFavorito(boton, esFavorito, nombre) {
  boton.textContent = esFavorito ? "♥" : "♡";
  boton.setAttribute("aria-pressed", esFavorito);
  boton.setAttribute(
    "aria-label",
    (esFavorito ? "Quitar de favoritos: " : "Agregar a favoritos: ") + nombre
  );
}

function mostrarTarjetas() {
  contenedorTarjetas.innerHTML = "";
  bebidas.forEach(function (bebida) {
    contenedorTarjetas.appendChild(crearTarjeta(bebida));
  });
  filtrarMenu();
}

function mostrarFavoritos() {
  listaFavoritos.innerHTML = "";
  const elegidas = bebidas.filter(function (b) {
    return favoritos.includes(b.id);
  });

  elegidas.forEach(function (b) {
    const item = document.createElement("li");
    item.textContent = b.nombre;
    listaFavoritos.appendChild(item);
  });

  sinFavoritos.hidden = elegidas.length > 0;
}

/* Buscador: oculta las tarjetas que no coinciden */
function filtrarMenu() {
  const texto = buscador.value.trim().toLowerCase();
  let visibles = 0;

  contenedorTarjetas.querySelectorAll(".tarjeta").forEach(function (tarjeta) {
    const coincide = tarjeta.dataset.nombre.includes(texto);
    tarjeta.hidden = !coincide;
    if (coincide) visibles++;
  });

  sinResultados.hidden = visibles > 0 || bebidas.length === 0;
}

buscador.addEventListener("input", filtrarMenu);

/* Un solo listener para todos los corazones (delegación de eventos) */
contenedorTarjetas.addEventListener("click", async function (evento) {
  const boton = evento.target.closest(".btn-fav");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const bebida = bebidas.find(function (b) { return b.id === id; });

  if (favoritos.includes(id)) {
    // SweetAlert2: confirmación antes de quitar
    const resultado = await Swal.fire({
      title: "¿Quitar de favoritos?",
      text: bebida.nombre,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#704104"
    });
    if (!resultado.isConfirmed) return;

    favoritos = favoritos.filter(function (f) { return f !== id; });
  } else {
    favoritos.push(id);
    // SweetAlert2: aviso breve (toast)
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: bebida.nombre + " agregado a favoritos",
      showConfirmButton: false,
      timer: 1800
    });
  }

  guardarJSON(CLAVE_FAVORITOS, favoritos);
  actualizarBotonFavorito(boton, favoritos.includes(id), bebida.nombre);
  mostrarFavoritos();
});


/* ----------------------------------------------------------
   Arranque
   ---------------------------------------------------------- */
cargarMenu();