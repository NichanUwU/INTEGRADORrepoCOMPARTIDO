package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class LoteController {

    // GET /api/lotes
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT l.*, m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre " +
                     "FROM LOTE l " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo";
        ArrayList<Map<String, Object>> lotes = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> lote = new HashMap<>();
                lote.put("IdLote", rs.getInt("IdLote"));
                lote.put("Numero", rs.getString("Numero")); // VARCHAR
                lote.put("Medidas", rs.getString("Medidas"));
                lote.put("Precio", rs.getBigDecimal("Precio"));
                lote.put("Estado", rs.getString("Estado"));
                lote.put("IdManzana", rs.getInt("IdManzana"));
                lote.put("ManzanaNumero", rs.getInt("ManzanaNumero"));
                lote.put("DesarrolloNombre", rs.getString("DesarrolloNombre"));
                lotes.add(lote);
            }
            ctx.json(lotes);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/lotes/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT l.*, m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre " +
                     "FROM LOTE l " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo " +
                     "WHERE l.IdLote = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> lote = new HashMap<>();
                    lote.put("IdLote", rs.getInt("IdLote"));
                    lote.put("Numero", rs.getString("Numero"));
                    lote.put("Medidas", rs.getString("Medidas"));
                    lote.put("Precio", rs.getBigDecimal("Precio"));
                    lote.put("Estado", rs.getString("Estado"));
                    lote.put("IdManzana", rs.getInt("IdManzana"));
                    lote.put("ManzanaNumero", rs.getInt("ManzanaNumero"));
                    lote.put("DesarrolloNombre", rs.getString("DesarrolloNombre"));
                    ctx.json(lote);
                } else {
                    ctx.status(404).json("Lote no encontrado");
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/lotes
    public static void crear(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO LOTE (Numero, Medidas, Precio, Estado, IdManzana) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Numero").toString()); // VARCHAR
            pstmt.setString(2, body.get("Medidas").toString());
            pstmt.setBigDecimal(3, new java.math.BigDecimal(body.get("Precio").toString()));
            pstmt.setString(4, body.get("Estado") != null ? body.get("Estado").toString() : "Disponible");
            pstmt.setInt(5, Integer.parseInt(body.get("IdManzana").toString()));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Lote registrado con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/lotes/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String sql = "UPDATE LOTE SET Numero=?, Medidas=?, Precio=?, Estado=?, IdManzana=? WHERE IdLote=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Numero").toString());
            pstmt.setString(2, body.get("Medidas").toString());
            pstmt.setBigDecimal(3, new java.math.BigDecimal(body.get("Precio").toString()));
            pstmt.setString(4, body.get("Estado").toString());
            pstmt.setInt(5, Integer.parseInt(body.get("IdManzana").toString()));
            pstmt.setInt(6, id);

            pstmt.executeUpdate();
            ctx.json("Lote actualizado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/lotes/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM LOTE WHERE IdLote = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            ctx.json("Lote eliminado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}