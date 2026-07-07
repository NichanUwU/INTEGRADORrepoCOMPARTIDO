package com.sofi;

import io.javalin.Javalin;
import com.sofi.controllers.*;

public class App {
    public static void main(String[] args) {
        
        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> it.anyHost());
            });
        }).start(3000);

        // --- ENDPOINTS DE SOFI ---

        // Autenticación
        app.post("/api/login", UsuarioController::login);

        // Clientes
        app.get("/api/clientes", ClienteController::obtenerTodos);
        app.post("/api/clientes", ClienteController::crear);

        // Lotes
        app.get("/api/lotes", LoteController::obtenerTodos);
        app.post("/api/lotes", LoteController::crear);

        // Desarrollos
        app.get("/api/desarrollos", DesarrolloController::obtenerTodos);
        app.post("/api/desarrollos", DesarrolloController::crear);

        // Contratos
        app.get("/api/contratos", ContratoController::obtenerTodos);

        System.out.println("🚀 Backend de SOFI al 100%. Todos los endpoints listos para producción.");
    }
}
