const STORAGE_KEYS = {
  productos: "foodplus_productos",
  carrito: "foodplus_carrito",
  ventas: "foodplus_ventas",
  cajaInicial: "foodplus_caja_inicial",
};

const PRODUCTOS_INICIALES = [
  {
    id: 1,
    nombre: "limonada",
    cantidad: 1,
    stock: 16,
    desc: "Refrescante y sabrosa",
    precio: 8200,
    img: "img2/5.jpg",
  },
  {
    id: 2,
    nombre: "Salchipapa",
    cantidad: 1,
    stock: 12,
    desc: "Papa y deliciosa salchicha con queso derretido",
    precio: 15000,
    img: "img2/1.jpg",
  },
  {
    id: 3,
    nombre: "Chorizo",
    cantidad: 1,
    stock: 10,
    desc: "Chorizos asados con salsa casera",
    precio: 9700,
    img: "img2/2.jpg",
  },
  {
    id: 4,
    nombre: "Hot Dog",
    cantidad: 1,
    stock: 18,
    desc: "delicioso hot dog estilo americano",
    precio: 10000,
    img: "img2/3.jpg",
  },
  {
    id: 7,
    nombre: "Hamburguesa",
    cantidad: 1,
    stock: 9,
    desc: "Doble queso y tocineta",
    precio: 18000,
    img: "img2/7.jpg",
  },
  {
    id: 8,
    nombre: "Plarillo especial",
    cantidad: 1,
    stock: 7,
    desc: "Rico pollo con arroz mixto",
    precio: 22000,
    img: "img2/8.jpg",
  },
  {
    id: 10,
    nombre: "Chuzo de cerdo",
    cantidad: 1,
    stock: 11,
    desc: "Deleciosa carne con salsa y guiso casero",
    precio: 12000,
    img: "img2/10.jpg",
  },
];

let stockProductos = obtenerProductosAlmacenados();
let carrito = JSON.parse(localStorage.getItem(STORAGE_KEYS.carrito)) || [];

const contenedor = document.querySelector("#contenedor");
const carritoContenedor = document.querySelector("#carritoContenedor");
const vaciarCarrito = document.querySelector("#vaciarCarrito");
const precioTotal = document.querySelector("#precioTotal");
const procesarCompra = document.querySelector("#procesarCompra");
const totalProceso = document.querySelector("#totalProceso");
const formulario = document.querySelector("#procesar-pago");

function obtenerProductosAlmacenados() {
  const productosGuardados = JSON.parse(localStorage.getItem(STORAGE_KEYS.productos) || "null");

  if (!Array.isArray(productosGuardados) || productosGuardados.length === 0) {
    localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(PRODUCTOS_INICIALES));
    return [...PRODUCTOS_INICIALES];
  }

  return productosGuardados;
}

function guardarProductosAlmacenados() {
  localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(stockProductos));
}

function guardarCarrito() {
  localStorage.setItem(STORAGE_KEYS.carrito, JSON.stringify(carrito));
}

function obtenerVentas() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ventas) || "[]");
}

function obtenerCajaInicial() {
  const valor = Number(localStorage.getItem(STORAGE_KEYS.cajaInicial) || 0);
  return Number.isFinite(valor) ? valor : 0;
}

function obtenerCajaActual() {
  const ventasHoy = obtenerVentas().filter((venta) => esMismoDia(new Date(venta.fecha), new Date()));
  const totalHoy = ventasHoy.reduce((total, venta) => total + Number(venta.total || 0), 0);
  return obtenerCajaInicial() + totalHoy;
}

function esMismoDia(fecha1, fecha2) {
  return fecha1.getFullYear() === fecha2.getFullYear()
    && fecha1.getMonth() === fecha2.getMonth()
    && fecha1.getDate() === fecha2.getDate();
}

function getProductoPorId(id) {
  return stockProductos.find((producto) => producto.id === id);
}

function actualizarResumenCaja() {
  const saldoInicial = document.querySelector("#saldoInicial");
  const saldoCajaActual = document.querySelector("#saldoCajaActual");

  if (saldoInicial) {
    saldoInicial.value = obtenerCajaInicial();
  }

  if (saldoCajaActual) {
    saldoCajaActual.textContent = formatearPrecio(obtenerCajaActual());
  }
}

function cargarReporte() {
  if (!document.querySelector("#tabla-ventas") && !document.querySelector("#tabla-inventario")) {
    return;
  }

  const ventasHoy = obtenerVentas().filter((venta) => esMismoDia(new Date(venta.fecha), new Date()));
  const totalVentas = ventasHoy.reduce((total, venta) => total + Number(venta.total || 0), 0);
  const productosVendidos = ventasHoy.reduce((total, venta) => {
    return total + venta.productos.reduce((sum, producto) => sum + Number(producto.cantidad || 0), 0);
  }, 0);
  const stockBajo = stockProductos.filter((producto) => Number(producto.stock || 0) <= 5).length;
  const pagos = obtenerResumenPagos(ventasHoy);

  const totalVentasElemento = document.querySelector("#totalVentasDia");
  const numeroVentasElemento = document.querySelector("#numeroVentasDia");
  const productosVendidosElemento = document.querySelector("#productosVendidosDia");
  const stockBajoElemento = document.querySelector("#stockBajo");
  const efectivoPagoElemento = document.querySelector("#efectivoVentasDia");
  const tarjetaPagoElemento = document.querySelector("#tarjetaVentasDia");
  const nequiPagoElemento = document.querySelector("#nequiVentasDia");
  const tablaVentas = document.querySelector("#tabla-ventas");
  const tablaInventario = document.querySelector("#tabla-inventario");

  if (totalVentasElemento) totalVentasElemento.textContent = formatearPrecio(totalVentas);
  if (numeroVentasElemento) numeroVentasElemento.textContent = ventasHoy.length;
  if (productosVendidosElemento) productosVendidosElemento.textContent = productosVendidos;
  if (stockBajoElemento) stockBajoElemento.textContent = stockBajo;
  if (efectivoPagoElemento) efectivoPagoElemento.textContent = formatearPrecio(pagos.efectivo);
  if (tarjetaPagoElemento) tarjetaPagoElemento.textContent = formatearPrecio(pagos.tarjeta);
  if (nequiPagoElemento) nequiPagoElemento.textContent = formatearPrecio(pagos.nequi);

  if (tablaVentas) {
    tablaVentas.innerHTML = ventasHoy.length
      ? ventasHoy.map((venta) => `
          <tr>
            <td>${new Date(venta.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</td>
            <td>${escaparHtml(venta.cliente)}</td>
            <td>${escaparHtml(venta.metodoPago || "Efectivo")}</td>
            <td>${formatearPrecio(venta.total)}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="4" class="text-center">Sin ventas registradas hoy</td></tr>';
  }

  if (tablaInventario) {
    tablaInventario.innerHTML = stockProductos.map((producto) => `
      <tr>
        <td>${escaparHtml(producto.nombre)}</td>
        <td>${producto.stock}</td>
        <td>${producto.precio ? formatearPrecio(producto.precio) : "-"}</td>
      </tr>
    `).join("");
  }

  actualizarResumenCaja();
}

function guardarSaldoInicial() {
  const saldoInicial = document.querySelector("#saldoInicial");
  if (!saldoInicial) {
    return;
  }

  const valor = Number(saldoInicial.value || 0);
  localStorage.setItem(STORAGE_KEYS.cajaInicial, String(valor));
  actualizarResumenCaja();
  mostrarAlerta("Caja actualizada", "El saldo inicial quedó guardado correctamente.", "success");
}

function obtenerResumenPagos(ventas) {
  return {
    efectivo: ventas.filter((venta) => venta.metodoPago === "Efectivo").reduce((total, venta) => total + Number(venta.total || 0), 0),
    tarjeta: ventas.filter((venta) => venta.metodoPago === "Tarjeta").reduce((total, venta) => total + Number(venta.total || 0), 0),
    nequi: ventas.filter((venta) => venta.metodoPago === "Nequi").reduce((total, venta) => total + Number(venta.total || 0), 0),
  };
}

function renderAdminInventario() {
  const tablaAdmin = document.querySelector("#tabla-admin");
  if (!tablaAdmin) {
    return;
  }

  tablaAdmin.innerHTML = stockProductos.map((producto) => `
    <tr>
      <td>${producto.id}</td>
      <td>
        <input type="text" class="form-control" data-field="nombre" data-id="${producto.id}" value="${escaparHtml(producto.nombre)}" />
      </td>
      <td>
        <input type="number" class="form-control" data-field="precio" data-id="${producto.id}" value="${producto.precio}" min="0" step="100" />
      </td>
      <td>
        <input type="number" class="form-control" data-field="stock" data-id="${producto.id}" value="${producto.stock}" min="0" step="1" />
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarProductoAdmin(${producto.id})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

function guardarInventarioAdmin() {
  const inputs = document.querySelectorAll("#tabla-admin input[data-field]");
  const productosActualizados = stockProductos.map((producto) => {
    const nombre = document.querySelector(`[data-field="nombre"][data-id="${producto.id}"]`)?.value?.trim() || producto.nombre;
    const precio = Number(document.querySelector(`[data-field="precio"][data-id="${producto.id}"]`)?.value || producto.precio);
    const stock = Number(document.querySelector(`[data-field="stock"][data-id="${producto.id}"]`)?.value || producto.stock);

    return {
      ...producto,
      nombre,
      precio: Number.isFinite(precio) ? precio : producto.precio,
      stock: Number.isFinite(stock) ? Math.max(0, stock) : producto.stock,
    };
  });

  stockProductos = productosActualizados;
  guardarProductosAlmacenados();
  renderAdminInventario();
  mostrarAlerta("Inventario actualizado", "Los cambios del inventario se guardaron correctamente.", "success");

  if (contenedor) {
    contenedor.innerHTML = "";
    stockProductos.forEach((producto) => {
      contenedor.innerHTML += `
        <div class="card mt-3" style="width: 18rem;">
          <img class="card-img-top mt-2" src="${producto.img}" alt="${producto.nombre.trim()}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text">Precio: ${formatearPrecio(producto.precio)}</p>
            <p class="card-text">Descripción: ${producto.desc}</p>
            <p class="card-text">Stock: ${producto.stock}</p>
            <button class="btn btn-primary" onclick="agregarProducto(${producto.id})">Comprar Producto</button>
          </div>
        </div>
      `;
    });
  }
}

function eliminarProductoAdmin(id) {
  stockProductos = stockProductos.filter((producto) => producto.id !== id);
  guardarProductosAlmacenados();
  renderAdminInventario();

  if (contenedor) {
    contenedor.innerHTML = "";
    stockProductos.forEach((producto) => {
      contenedor.innerHTML += `
        <div class="card mt-3" style="width: 18rem;">
          <img class="card-img-top mt-2" src="${producto.img}" alt="${producto.nombre.trim()}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text">Precio: ${formatearPrecio(producto.precio)}</p>
            <p class="card-text">Descripción: ${producto.desc}</p>
            <p class="card-text">Stock: ${producto.stock}</p>
            <button class="btn btn-primary" onclick="agregarProducto(${producto.id})">Comprar Producto</button>
          </div>
        </div>
      `;
    });
  }
}

function agregarProductoAdmin() {
  const nombre = document.querySelector("#nuevoNombre")?.value?.trim();
  const precio = Number(document.querySelector("#nuevoPrecio")?.value || 0);
  const stock = Number(document.querySelector("#nuevoStock")?.value || 0);

  if (!nombre || !Number.isFinite(precio) || precio <= 0 || !Number.isFinite(stock) || stock < 0) {
    mostrarAlerta("Datos inválidos", "Completa nombre, precio y stock válidos para agregar un producto.", "error");
    return;
  }

  const nuevoId = stockProductos.length ? Math.max(...stockProductos.map((producto) => producto.id)) + 1 : 1;
  stockProductos.push({
    id: nuevoId,
    nombre,
    cantidad: 1,
    stock,
    desc: "Producto agregado desde administración",
    precio,
    img: "img2/5.jpg",
  });

  guardarProductosAlmacenados();
  renderAdminInventario();
  document.querySelector("#nuevoNombre").value = "";
  document.querySelector("#nuevoPrecio").value = "";
  document.querySelector("#nuevoStock").value = "";

  if (contenedor) {
    contenedor.innerHTML = "";
    stockProductos.forEach((producto) => {
      contenedor.innerHTML += `
        <div class="card mt-3" style="width: 18rem;">
          <img class="card-img-top mt-2" src="${producto.img}" alt="${producto.nombre.trim()}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text">Precio: ${formatearPrecio(producto.precio)}</p>
            <p class="card-text">Descripción: ${producto.desc}</p>
            <p class="card-text">Stock: ${producto.stock}</p>
            <button class="btn btn-primary" onclick="agregarProducto(${producto.id})">Comprar Producto</button>
          </div>
        </div>
      `;
    });
  }

  mostrarAlerta("Producto agregado", "El nuevo producto quedó disponible en el inventario.", "success");
}

document.addEventListener("DOMContentLoaded", () => {
  carrito = JSON.parse(localStorage.getItem(STORAGE_KEYS.carrito)) || [];

  if (document.querySelector("#guardarCajaInicial")) {
    document.querySelector("#guardarCajaInicial").addEventListener("click", guardarSaldoInicial);
  }

  if (document.querySelector("#tabla-ventas") || document.querySelector("#tabla-inventario")) {
    cargarReporte();
  }

  if (document.querySelector("#tabla-admin")) {
    renderAdminInventario();
    const guardarInventario = document.querySelector("#guardarInventario");
    const agregarProductoBtn = document.querySelector("#agregarProductoBtn");

    if (guardarInventario) {
      guardarInventario.addEventListener("click", guardarInventarioAdmin);
    }

    if (agregarProductoBtn) {
      agregarProductoBtn.addEventListener("click", agregarProductoAdmin);
    }
  }

  if (formulario) {
    formulario.addEventListener("submit", enviarCompra);
  }

  if (vaciarCarrito) {
    vaciarCarrito.addEventListener("click", () => {
      carrito = [];
      guardarCarrito();
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
          <p class="card-text">Precio: ${formatearPrecio(producto.precio)}</p>
          <p class="card-text">Descripción: ${producto.desc}</p>
          <p class="card-text">Stock: ${producto.stock}</p>
          <button class="btn btn-primary" onclick="agregarProducto(${producto.id})">Comprar Producto</button>
        </div>
      </div>
    `;
  });

  mostrarCarrito();
  procesarPedido();
});

function agregarProducto(id) {
  const producto = getProductoPorId(id);
  if (!producto) {
    return;
  }

  if (producto.stock <= 0) {
    mostrarAlerta("Sin stock", "Este producto ya no tiene unidades disponibles.", "warning");
    return;
  }

  const productoEnCarrito = carrito.find((item) => item.id === id);
  if (productoEnCarrito && productoEnCarrito.cantidad >= producto.stock) {
    mostrarAlerta("Stock insuficiente", "No puedes agregar más unidades de este producto.", "warning");
    return;
  }

  if (productoEnCarrito) {
    productoEnCarrito.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
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
            <p>Precio: ${formatearPrecio(producto.precio)}</p>
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
    precioTotal.textContent = formatearPrecio(carrito.reduce((total, producto) => total + producto.cantidad * producto.precio, 0));
  }

  guardarCarrito();
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
      <td>${formatearPrecio(producto.precio)}</td>
      <td>${producto.cantidad}</td>
      <td>${formatearPrecio(producto.precio * producto.cantidad)}</td>
    </tr>
  `).join("");

  if (totalProceso) {
    totalProceso.textContent = formatearPrecio(carrito.reduce((total, producto) => total + producto.cantidad * producto.precio, 0));
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
  const telefono = document.querySelector("#telefono").value.trim();
  const metodoPago = document.querySelector("#metodoPago")?.value || "Efectivo";
  const button = document.querySelector("#button");
  const spinner = document.querySelector("#spinner");

  if (carrito.length === 0) {
    mostrarAlerta("Tu carrito está vacío", "Agrega productos antes de finalizar la compra.", "error");
    return;
  }

  if (!cliente || !email || !telefono) {
    mostrarAlerta("Completa tus datos", "Ingresa tu nombre, correo y teléfono móvil.", "error");
    return;
  }

  const stockInsuficiente = carrito.some((item) => {
    const producto = getProductoPorId(item.id);
    return !producto || item.cantidad > producto.stock;
  });

  if (stockInsuficiente) {
    mostrarAlerta("Stock insuficiente", "Hay productos del carrito que ya no tienen disponibilidad. Revisa tu pedido.", "error");
    return;
  }

  const pedido = {
    numero: `FOOD-${Date.now()}`,
    fecha: new Date(),
    cliente,
    email,
    telefono,
    productos: carrito.map((producto) => ({ ...producto })),
    total: carrito.reduce((total, producto) => total + producto.cantidad * producto.precio, 0),
  };

  button.disabled = true;
  button.value = "Enviando...";
  spinner.classList.remove("d-none");
  spinner.classList.add("d-flex");

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    carrito.forEach((productoCarrito) => {
      const producto = getProductoPorId(productoCarrito.id);
      if (producto) {
        producto.stock = Math.max(0, Number(producto.stock || 0) - Number(productoCarrito.cantidad || 0));
      }
    });
    guardarProductosAlmacenados();

    const ventas = obtenerVentas();
    ventas.push({
      id: pedido.numero,
      fecha: pedido.fecha.toISOString(),
      cliente: pedido.cliente,
      email: pedido.email,
      telefono: pedido.telefono,
      metodoPago,
      productos: pedido.productos,
      total: pedido.total,
    });
    localStorage.setItem(STORAGE_KEYS.ventas, JSON.stringify(ventas));

    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    procesarPedido();

    const resultado = await Swal.fire({
      title: "Compra confirmada (demo)",
      html: `
        <p>Comprobante listo para imprimir o guardar como PDF.</p>
        <section class="sms-demo" aria-label="Vista previa de SMS de demostración">
          <strong>SMS simulado para ${escaparHtml(telefono)}</strong>
          <p>FOOD+: recibimos tu pedido ${pedido.numero} por ${formatearPrecio(pedido.total)}. Gracias, ${escaparHtml(cliente)}.</p>
          <small>Demostración con datos ficticios. No se envió un mensaje de texto real.</small>
        </section>
      `,
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Imprimir comprobante",
      cancelButtonText: "Cerrar",
    });

    if (resultado.isConfirmed) {
      imprimirFactura(pedido);
    }

    formulario.reset();
    if (document.querySelector("#tabla-ventas") || document.querySelector("#tabla-inventario")) {
      cargarReporte();
    }
  } catch (error) {
    console.error("No se pudo completar la demostración de compra:", error);
    mostrarAlerta("No se pudo completar la compra", "Inténtalo de nuevo. Tu carrito sigue guardado.", "error");
  } finally {
    button.disabled = false;
    button.value = "Finalizar compra";
    spinner.classList.add("d-none");
    spinner.classList.remove("d-flex");
  }
}

function imprimirFactura(pedido) {
  const factura = document.querySelector("#factura");
  const filas = pedido.productos.map((producto) => `
    <tr>
      <td>${escaparHtml(producto.nombre.trim())}</td>
      <td>${producto.cantidad}</td>
      <td>${formatearPrecio(producto.precio)}</td>
      <td>${formatearPrecio(producto.precio * producto.cantidad)}</td>
    </tr>
  `).join("");

  factura.innerHTML = `
    <header class="factura__encabezado">
      <h1>FOOD+</h1>
      <p>Comprobante de compra</p>
      <p><strong>Restaurante:</strong> FOOD+ Restaurante (datos de demostración)</p>
      <p><strong>Número:</strong> ${pedido.numero}</p>
      <p><strong>Fecha:</strong> ${pedido.fecha.toLocaleString("es-CO")}</p>
    </header>
    <section class="factura__cliente">
      <h2>Datos del cliente</h2>
      <p><strong>Nombre:</strong> ${escaparHtml(pedido.cliente)}</p>
      <p><strong>Correo:</strong> ${escaparHtml(pedido.email)}</p>
      <p><strong>Teléfono:</strong> ${escaparHtml(pedido.telefono)}</p>
    </section>
    <table class="factura__tabla">
      <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
      <tbody>${filas}</tbody>
      <tfoot><tr><th colspan="3">Total</th><th>${formatearPrecio(pedido.total)}</th></tr></tfoot>
    </table>
    <p class="factura__nota">Documento de demostración con datos ficticios. Es un comprobante de pedido y no reemplaza una factura electrónica tributaria.</p>
  `;

  factura.classList.remove("d-none");
  factura.setAttribute("aria-hidden", "false");
  document.body.classList.add("imprimiendo-factura");
  window.addEventListener("afterprint", () => {
    document.body.classList.remove("imprimiendo-factura");
    factura.classList.add("d-none");
    factura.setAttribute("aria-hidden", "true");
  }, { once: true });
  window.print();
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caracter]);
}