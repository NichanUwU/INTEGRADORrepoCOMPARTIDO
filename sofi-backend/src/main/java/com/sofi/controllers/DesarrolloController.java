package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class DesarrolloController {
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT * FROM DESARROLLO";
        ArrayList<Map<String, Object>> desarrollos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> d = new HashMap<>();
                d.put("IdDesarrollo", rs.getInt("IdDesarrollo"));
                d.put("Nombre", rs.getString("Nombre"));
                d.put("Ubicacion", rs.getString("Ubicacion"));
                d.put("Fecha_inicio", rs.getTimestamp("Fecha_inicio"));
                desarrollos.add(d);
            }
            ctx.json(desarrollos);
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO DESARROLLO (Nombre, Ubicacion) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Ubicacion"));
            pstmt.executeUpdate();
            ctx.status(201).json(Map.of("mensaje", "Desarrollo creado con éxito"));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
