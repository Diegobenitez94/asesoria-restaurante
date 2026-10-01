const stockProductos = [
  {
    id: 1,
    nombre: "limonada",
    cantidad: 1,
    desc: "Refrescante y sabrosa",
    precio: 8200,
    img: "img2/5.jpg",
  },
  {
    id: 2,
    nombre: "Salchipapa",
    cantidad: 1,
    desc: "Papa y deliciosa salchicha con queso derretido",
    precio: 15000,
    img: "img2/1.jpg",
  },
  {
    id: 3,
    nombre: "Chorizo",
    cantidad: 1,
    desc: "Chorizos asados con salsa casera",
    precio: 9700,
    img: "img2/2.jpg",
  },
  {
    id: 4,
    nombre: " Hot Dog",
    cantidad: 1,
    desc: "delicioso hot dog estilo americano",
    precio: 10000,
    img: "img2/3.jpg",
  },

  {
    id: 7,
    nombre: "Hamburguesa",
    cantidad: 1,
    desc: "Doble queso y tocineta",
    precio: 18000,
    img: "img2/7.jpg",
  },
  {
    id: 8,
    nombre: "Plarillo especial",
    cantidad: 1,
    desc: "Rico pollo con arroz mixto",
    precio: 22000,
    img: "img2/8.jpg",
  },

  {
    id: 10,
    nombre: "Chuzo de cerdo",
    cantidad: 1,
    desc: "Deleciosa carne con salsa y guiso casero",
    precio: 12000,
    img: "img2/10.jpg",
  },
];
let carrito = [];

const contenedor = document.querySelector("#contenedor");
const carritoContenedor = document.querySelector("#carritoContenedor");
const vaciarCarrito = document.querySelector("#vaciarCarrito");
const precioTotal = document.querySelector("#precioTotal");
const procesarCompra = document.querySelector("#procesarCompra");
const totalProceso = document.querySelector("#totalProceso");
const formulario = document.querySelector('#procesar-pago')

document.addEventListener("DOMContentLoaded", () => {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  mostrarCarrito();
  procesarPedido();
});
if(formulario){
  formulario.addEventListener('submit', enviarCompra)
}


if (vaciarCarrito) {
  vaciarCarrito.addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
  });
}

if (procesarCompra) {
  procesarCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
      mostrarAlerta("Tu carrito está vacío", "Agrega productos antes de continuar.", "error");
      return;
    }
    location.href = "compra.html";
  });
}

stockProductos.forEach((producto) => {
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML += `
    <div class="card mt-3" style="width: 18rem;">
      <img class="card-img-top mt-2" src="${producto.img}" alt="${producto.nombre.trim()}">
      <div class="card-body">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text">Precio: ${producto.precio}</p>
        <p class="card-text">Descripción: ${producto.desc}</p>
        <p class="card-text">Cantidad: 1</p>
        <button class="btn btn-primary" onclick="agregarProducto(${producto.id})">Comprar Producto</button>
      </div>
    </div>
  `;
});

function agregarProducto(id) {
  const producto = carrito.find((item) => item.id === id);
  if (producto) {
    producto.cantidad += 1;
  } else {
    const nuevoProducto = stockProductos.find((item) => item.id === id);
    if (nuevoProducto) {
      carrito.push({ ...nuevoProducto });
    }
  }
  mostrarCarrito();
}

function mostrarCarrito() {
  const modalBody = document.querySelector(".modal .modal-body");
  if (modalBody) {
    modalBody.innerHTML = carrito.length
      ? carrito.map((producto) => `
        <div class="modal-contenedor">
          <div><img class="img-fluid img-carrito" src="${producto.img}" alt="${producto.nombre.trim()}"></div>
          <div>
            <p>Producto: ${producto.nombre}</p>
            <p>Precio: ${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar producto</button>
          </div>
        </div>
      `).join("")
      : '<p class="text-center text-primary parrafo">¡Aún no agregaste nada!</p>';
  }

  if (carritoContenedor) {
    carritoContenedor.textContent = carrito.length;
  }
  if (precioTotal) {
    precioTotal.textContent = carrito.reduce((total, producto) => total + producto.cantidad * producto.precio, 0);
  }
  guardarStorage();
}

function guardarStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function eliminarProducto(id) {
  carrito = carrito.filter((producto) => producto.id !== id);
  mostrarCarrito();
}

function procesarPedido() {
  const listaCompra = document.querySelector("#lista-compra tbody");
  if (!listaCompra) {
    return;
  }

  listaCompra.innerHTML = carrito.map((producto) => `
    <tr>
      <td><img class="img-fluid img-carrito" src="${producto.img}" alt="${producto.nombre.trim()}"></td>
      <td>${producto.nombre}</td>
      <td>${producto.precio}</td>
      <td>${producto.cantidad}</td>
      <td>${producto.precio * producto.cantidad}</td>
    </tr>
  `).join("");

  if (totalProceso) {
    totalProceso.textContent = carrito.reduce((total, producto) => total + producto.cantidad * producto.precio, 0);
  }
}

function mostrarAlerta(title, text, icon) {
  if (typeof Swal !== "undefined") {
    Swal.fire({ title, text, icon, confirmButtonText: "Aceptar" });
  } else {
    alert(`${title}\n${text}`);
  }
}

async function enviarCompra(event) {
  event.preventDefault();
  const cliente = document.querySelector("#cliente").value.trim();
  const email = document.querySelector("#correo").value.trim();
  const button = document.querySelector("#button");
  const spinner = document.querySelector("#spinner");

  if (carrito.length === 0) {
    mostrarAlerta("Tu carrito está vacío", "Agrega productos antes de finalizar la compra.", "error");
    return;
  }
  if (!cliente || !email) {
    mostrarAlerta("Completa tus datos", "Ingresa tu nombre y un correo válido.", "error");
    return;
  }

  button.disabled = true;
  button.value = "Enviando...";
  spinner.classList.remove("d-none");
  spinner.classList.add("d-flex");

  try {
    if (typeof emailjs === "undefined") {
      throw new Error("El servicio de correo no está disponible.");
    }

    await emailjs.sendForm("default_service", "template_qxwi0jn", formulario);
    carrito = [];
    mostrarCarrito();
    procesarPedido();
    formulario.reset();
    mostrarAlerta("Compra realizada", "Recibirás la confirmación en tu correo.", "success");
  } catch (error) {
    console.error("No se pudo enviar la compra:", error);
    mostrarAlerta("No se pudo completar la compra", "Revisa la conexión e inténtalo de nuevo. Tu carrito sigue guardado.", "error");
  } finally {
    button.disabled = false;
    button.value = "Finalizar compra";
    spinner.classList.add("d-none");
    spinner.classList.remove("d-flex");
  }
}