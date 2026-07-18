    package com.sofi;

    import io.javalin.Javalin;
    import io.javalin.http.Context;
    import com.sofi.controllers.*;

    public class App {
        public static void main(String[] args) {

            int port = 8080;
            try {
                String envPort = System.getenv("PORT");
                if (envPort != null && !envPort.isEmpty()) {
                    port = Integer.parseInt(envPort);
                }
            } catch (NumberFormatException ignored) {
                port = 8080;
            }

            Javalin app = Javalin.create().start(port);

            System.out.println("HOLA TILIN SOFI iniciado en http://localhost:" + port);

            // AUTENTICACIÓN
            app.post("/api/login", UsuarioController::login);
            app.post("/api/usuarios", UsuarioController::crear);

            // CLIENTES
            app.get("/api/clientes", ClienteController::obtenerTodos);
            app.get("/api/clientes/{id}", ClienteController::obtenerPorId);
            app.post("/api/clientes", ClienteController::crear);
            app.put("/api/clientes/{id}", ClienteController::actualizar);
            app.delete("/api/clientes/{id}", ClienteController::eliminar);

            // LOTES
            app.get("/api/lotes", LoteController::obtenerTodos);
            app.get("/api/lotes/{id}", LoteController::obtenerPorId);
            app.post("/api/lotes", LoteController::crear);
            app.put("/api/lotes/{id}", LoteController::actualizar);
            app.delete("/api/lotes/{id}", LoteController::eliminar);

            // MANZANAS
            app.get("/api/manzanas", ManzanaController::obtenerTodos);
            app.get("/api/manzanas/{id}", ManzanaController::obtenerPorId);
            app.get("/api/manzanas/desarrollo/{desarrolloId}", ManzanaController::obtenerPorDesarrollo);
            app.post("/api/manzanas", ManzanaController::crear);
            app.put("/api/manzanas/{id}", ManzanaController::actualizar);
            app.delete("/api/manzanas/{id}", ManzanaController::eliminar);

            // DESARROLLOS
            app.get("/api/desarrollos", DesarrolloController::obtenerTodos);
            app.get("/api/desarrollos/{id}", DesarrolloController::obtenerPorId);
            app.post("/api/desarrollos", DesarrolloController::crear);
            app.put("/api/desarrollos/{id}", DesarrolloController::actualizar);
            app.delete("/api/desarrollos/{id}", DesarrolloController::eliminar);

            // CONTRATOS
            app.get("/api/contratos", ContratoController::obtenerTodos);
            app.get("/api/contratos/cliente/{clienteId}", ContratoController::obtenerPorCliente);
            app.post("/api/contratos", ContratoController::crear);
            app.put("/api/contratos/{id}", ContratoController::actualizar);
            app.delete("/api/contratos/{id}", ContratoController::eliminar);

            // PAGOS
            app.get("/api/pagos", PagoController::obtenerTodos);
            app.post("/api/pagos", PagoController::crear);

            // COLINDANCIA
            app.get("/api/colindancias/lote/{loteId}", ColindanciaController::obtenerPorLote);
            app.post("/api/colindancias", ColindanciaController::crear);
            app.put("/api/colindancias/{id}", ColindanciaController::actualizar);

            // EMPLEADOS
            app.get("/api/empleados", EmpleadoController::obtenerTodos);

            System.out.println("   Todos los endpoints registrados correctamente");
            System.out.println("   Endpoints disponibles:");
            System.out.println("   GET    /api/clientes, /api/lotes, /api/manzanas, /api/desarrollos, /api/contratos, /api/pagos, /api/empleados");
            System.out.println("   POST   /api/clientes, /api/lotes, /api/manzanas, /api/desarrollos, /api/contratos, /api/pagos, /api/colindancias");
            System.out.println("   PUT    /api/clientes/{id}, /api/lotes/{id}, /api/manzanas/{id}, /api/desarrollos/{id}, /api/contratos/{id}, /api/colindancias/{id}");
            System.out.println("   DELETE /api/clientes/{id}, /api/lotes/{id}, /api/manzanas/{id}, /api/desarrollos/{id}, /api/contratos/{id}");
        }
    }