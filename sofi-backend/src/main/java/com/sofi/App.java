    package com.sofi;

    import io.javalin.Javalin;
    import io.javalin.http.Context;
    import io.javalin.http.staticfiles.Location;
    import com.sofi.controllers.*;
    import java.io.File;
    import java.nio.file.Files;
    import java.nio.file.Paths;

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

            Javalin app = null;
            int selectedPort = port;

            String frontendPath = Paths.get("").toAbsolutePath().resolve("..").normalize().toString();
            for (int candidate = port; candidate <= port + 10; candidate++) {
                try {
                    app = Javalin.create(config -> config.addStaticFiles(frontendPath, Location.EXTERNAL)).start(candidate);
                    selectedPort = candidate;
                    break;
                } catch (Exception e) {
                    if (candidate == port + 10) {
                        throw new RuntimeException("No se pudo iniciar el servidor en ningún puerto disponible", e);
                    }
                }
            }

            System.out.println("HOLA TILIN SOFI iniciado en http://localhost:" + selectedPort);

            app.before(ctx -> {
                ctx.header("Access-Control-Allow-Origin", "*");
                ctx.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
                ctx.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

                if (ctx.method().equals("OPTIONS")) {
                    ctx.status(204).result("");
                }
            });

            app.options("/*", ctx -> ctx.status(204));
            app.get("/", ctx -> ctx.redirect("/index.html"));

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
            app.get("/api/contratos/{id}", ContratoController::obtenerPorId);
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

            // FRONTEND ESTÁTICO
            app.get("/*", ctx -> {
                String requestPath = ctx.path();
                if (requestPath.equals("/")) {
                    requestPath = "/index.html";
                }
                String normalizedPath = requestPath.startsWith("/") ? requestPath.substring(1) : requestPath;
                normalizedPath = normalizedPath.replace("/", File.separator);
                String filePath = Paths.get(frontendPath, normalizedPath).toString();

                if (Files.isDirectory(Paths.get(filePath))) {
                    filePath = Paths.get(filePath, "index.html").toString();
                }

                if (!Files.exists(Paths.get(filePath))) {
                    ctx.status(404).result("Not found");
                    return;
                }

                String contentType = "application/octet-stream";
                if (filePath.endsWith(".html")) contentType = "text/html";
                else if (filePath.endsWith(".css")) contentType = "text/css";
                else if (filePath.endsWith(".js")) contentType = "application/javascript";
                else if (filePath.endsWith(".json")) contentType = "application/json";
                else if (filePath.endsWith(".svg")) contentType = "image/svg+xml";
                else if (filePath.endsWith(".png")) contentType = "image/png";
                else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (filePath.endsWith(".woff")) contentType = "font/woff";
                else if (filePath.endsWith(".woff2")) contentType = "font/woff2";

                ctx.contentType(contentType).result(Files.readAllBytes(Paths.get(filePath)));
            });

            System.out.println("   Todos los endpoints registrados correctamente");
            System.out.println("   Endpoints disponibles:");
            System.out.println("   GET    /api/clientes, /api/lotes, /api/manzanas, /api/desarrollos, /api/contratos, /api/pagos, /api/empleados");
            System.out.println("   POST   /api/clientes, /api/lotes, /api/manzanas, /api/desarrollos, /api/contratos, /api/pagos, /api/colindancias");
            System.out.println("   PUT    /api/clientes/{id}, /api/lotes/{id}, /api/manzanas/{id}, /api/desarrollos/{id}, /api/contratos/{id}, /api/colindancias/{id}");
            System.out.println("   DELETE /api/clientes/{id}, /api/lotes/{id}, /api/manzanas/{id}, /api/desarrollos/{id}, /api/contratos/{id}");
        }
    }