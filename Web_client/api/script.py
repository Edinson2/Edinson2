from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilitar CORS para que tu frontend pueda acceder al backend
app.secret_key = 'tu_clave_secreta'  # ¡Importante para las sesiones!

class ItemCarrito:
    def __init__(self, id, nombre, precio, cantidad=1):
        self.id = id
        self.nombre = nombre
        self.precio = precio
        self.cantidad = cantidad

    def calcular_subtotal(self):
        return self.precio * self.cantidad

class Carrito:
    def __init__(self):
        self.items = []

    def agregar_item(self, id, nombre, precio):
        item_existente = self.buscar_item(id)
        if item_existente:
            item_existente.cantidad += 1
        else:
            self.items.append(ItemCarrito(id, nombre, precio))

    def eliminar_item(self, id):
        self.items = [item for item in self.items if item.id != id]

    def buscar_item(self, id):
        for item in self.items:
            if item.id == id:
                return item
        return None

    def obtener_items(self):
        return [{"id": item.id, "nombre": item.nombre, "precio": item.precio, "cantidad": item.cantidad} for item in self.items]

    def calcular_subtotal(self):
        return sum(item.calcular_subtotal() for item in self.items)

# Simulación de un carrito por sesión (necesitarías un manejo de usuarios real en una app real)
carrito_sesion = Carrito()

@app.route('/api/carrito', methods=['GET'])
def obtener_carrito():
    return jsonify({"items": carrito_sesion.obtener_items()})

@app.route('/api/carrito/agregar', methods=['POST'])
def agregar_al_carrito():
    data = request.get_json()
    id = data.get('id')
    nombre = data.get('nombre')
    precio = data.get('precio')

    if id and nombre and precio is not None:
        carrito_sesion.agregar_item(id, nombre, float(precio))
        return jsonify({
            "mensaje": f"{nombre} agregado al carrito",
            "carrito": carrito_sesion.obtener_items()
        }), 201
    return jsonify({"error": "Faltan datos del producto"}), 400

@app.route('/api/carrito/eliminar/<item_id>', methods=['DELETE'])
def eliminar_del_carrito(item_id):
    carrito_sesion.eliminar_item(item_id)
    return jsonify({
        "mensaje": f"Item {item_id} eliminado del carrito",
        "carrito": carrito_sesion.obtener_items()
    }), 200

if __name__ == '__main__':
    app.run(debug=True)