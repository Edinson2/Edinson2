document.addEventListener('DOMContentLoaded', () => {
    const botonesAgregarCarrito = document.querySelectorAll('.agregar-carrito');
    const listaCarrito = document.getElementById('lista-de-productos-carrito');
    const cantidadItemsCarrito = document.querySelectorAll('#cantidad-items-carrito, #cantidad-items-carrito-pagar');
    const subtotalElement = document.getElementById('subtotal') || { textContent: '' };
    const totalElement = document.getElementById('total') || { textContent: '' };
    const listaItemsPedido = document.getElementById('lista-items-pedido');
    const subtotalPagarElement = document.getElementById('subtotal-pagar') || { textContent: '' };
    const totalPagarElement = document.getElementById('total-pagar') || { textContent: '' };
    const irAPagarBoton = document.getElementById('ir-a-pagar');

    let carrito = cargarCarrito(); // Cargar el carrito al iniciar

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }
    

    function actualizarCarritoVisual() {
        fetch('http://127.0.0.1:5000/api/carrito')
            .then(response => response.json())
            .then(data => {
                const listaCarrito = document.getElementById('lista-de-productos-carrito');
                const cantidadItemsCarrito = document.getElementById('cantidad-items-carrito');
                const totalElement = document.getElementById('total');

                if (listaCarrito) {
                    listaCarrito.innerHTML = ''; // Clear the current list
                    let total = 0;

                    if (data.items.length === 0) {
                        listaCarrito.innerHTML = '<p>Tu carrito está vacío.</p>';
                    } else {
                        data.items.forEach(item => {
                            const li = document.createElement('div');
                            li.classList.add('item-carrito');
                            li.innerHTML = `
                                <span>${item.nombre} x ${item.cantidad}</span>
                                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                                <button class="eliminar-item" data-id="${item.id}">Eliminar</button>
                            `;

                            const botonEliminar = li.querySelector('.eliminar-item');
                            botonEliminar.addEventListener('click', eliminarDelCarrito);

                            listaCarrito.appendChild(li);
                            total += item.precio * item.cantidad;
                        });
                    }

                    totalElement.textContent = total.toFixed(2); // Update total
                }

                if (cantidadItemsCarrito) {
                    cantidadItemsCarrito.textContent = data.items.reduce((sum, item) => sum + item.cantidad, 0); // Update item count
                }
            })
            .catch(error => console.error('Error al obtener el carrito:', error));
    }

    function calcularCostoEnvio(subtotal) {
        return carrito.length > 0 ? 0.00 : 0.00;
    }

    function agregarAlCarrito(evento) {
        const boton = evento.target;
        const id = boton.dataset.id;
        const nombre = boton.dataset.nombre;
        const precio = parseFloat(boton.dataset.precio);

        fetch('http://127.0.0.1:5000/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, nombre, precio })
        })
        .then(response => response.json())
        .then(data => {
            if (data.carrito) {
                carrito = data.carrito; // Update carrito with the response
                guardarCarrito(); // Save to localStorage
                actualizarCarritoVisual();
            } else {
                console.error('Error al agregar al carrito:', data.mensaje);
            }
        })
        .catch(error => console.error('Error de red:', error));
    }

    function eliminarDelCarrito(evento) {
        const id = evento.target.dataset.id;

        fetch(`http://127.0.0.1:5000/api/carrito/eliminar/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.carrito) {
                carrito = data.carrito; // Update carrito with the response
                guardarCarrito(); // Save to localStorage
                actualizarCarritoVisual();
            } else {
                console.error('Error al eliminar del carrito:', data.mensaje);
            }
        })
        .catch(error => console.error('Error de red:', error));
    }

    botonesAgregarCarrito.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });

    if (irAPagarBoton) {
        irAPagarBoton.addEventListener('click', () => {
            window.location.href = 'pagar.html'; // Asegurate que este sea el nombre correcto del archivo
        });
    }
    
    function actualizarTotalPagar() {
        fetch('http://127.0.0.1:5000/api/carrito')
            .then(response => response.json())
            .then(data => {
                const totalPagarElement = document.getElementById('total-pagar');
                const listaItemsPedido = document.getElementById('lista-items-pedido');
    
                if (listaItemsPedido) {
                    listaItemsPedido.innerHTML = ''; // Clear the current list
                    let total = 0;
    
                    if (data.items.length === 0) {
                        listaItemsPedido.innerHTML = '<p>No hay productos en el carrito.</p>';
                    } else {
                        data.items.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = `${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
                            listaItemsPedido.appendChild(li);
                            total += item.precio * item.cantidad;
                        });
                    }
    
                    if (totalPagarElement) {
                        totalPagarElement.textContent = total.toFixed(2); // Update total to pay
                    }
                }
            })
            .catch(error => console.error('Error al obtener el carrito:', error));
    }

    actualizarCarritoVisual(); // Actualiza el contenido al cargar la página
    
    if (document.getElementById('total-pagar')) {
        actualizarTotalPagar(); // Update the total to pay on the payment page
    }
});

