package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class LoteController {

    // 1. OBTENER TODOS LOS LOTES (GET)
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT * FROM LOTE";
        ArrayList<Map<String, Object>> lotes = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> lote = new HashMap<>();
                lote.put("IdLote", rs.getInt("IdLote"));
                lote.put("Numero", rs.getInt("Numero"));
                lote.put("Medidas", rs.getString("Medidas"));
                lote.put("Precio", rs.getBigDecimal("Precio"));
                lote.put("Estado", rs.getString("Estado"));
                lote.put("IdManzana", rs.getInt("IdManzana"));
                lotes.add(lote);
            }
            ctx.json(lotes);

        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    // 2. CREAR UN NUEVO LOTE (POST)
    public static void crear(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO LOTE (Numero, Medidas, Precio, Estado, IdManzana) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, Integer.parseInt(body.get("Numero").toString()));
            pstmt.setString(2, body.get("Medidas").toString());
            pstmt.setBigDecimal(3, new java.math.BigDecimal(body.get("Precio").toString()));
            pstmt.setString(4, body.get("Estado") != null ? body.get("Estado").toString() : "Disponible");
            pstmt.setInt(5, Integer.parseInt(body.get("IdManzana").toString()));

            pstmt.executeUpdate();
            ctx.status(21).json(Map.of("mensaje", "Lote registrado con éxito"));

        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
