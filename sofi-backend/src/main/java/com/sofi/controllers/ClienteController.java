package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ClienteController {

    // 1. OBTENER TODOS LOS CLIENTES (GET)
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT * FROM CLIENTE";
        ArrayList<Map<String, Object>> clientes = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> cliente = new HashMap<>();
                cliente.put("IdCliente", rs.getInt("IdCliente"));
                cliente.put("Nombre", rs.getString("Nombre"));
                cliente.put("Direccion", rs.getString("Direccion"));
                cliente.put("Telefono", rs.getString("Telefono"));
                cliente.put("INE", rs.getString("INE"));
                cliente.put("CURP", rs.getString("CURP"));
                clientes.add(cliente);
            }
            ctx.json(clientes);

        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    // 2. CREAR UN NUEVO CLIENTE (POST)
    public static void crear(Context ctx) {
        // Javalin lee el cuerpo JSON enviado desde el Frontend automáticamente como un Map
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO CLIENTE (Nombre, Direccion, Telefono, INE, CURP) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Direccion"));
            pstmt.setString(3, body.get("Telefono"));
            pstmt.setString(4, body.get("INE"));
            pstmt.setString(5, body.get("CURP"));

            pstmt.executeUpdate();
            ctx.status(21).json(Map.of("mensaje", "Cliente registrado con éxito"));

        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
