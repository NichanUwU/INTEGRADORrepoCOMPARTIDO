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
        String sql = "SELECT l.*, m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre, " +
                     "c.Norte, c.Sur, c.Este, c.Oeste " +
                     "FROM LOTE l " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo " +
                     "LEFT JOIN COLINDANCIA c ON l.IdLote = c.IdLote";
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
                lote.put("Norte", rs.getString("Norte") != null ? rs.getString("Norte") : "");
                lote.put("Sur", rs.getString("Sur") != null ? rs.getString("Sur") : "");
                lote.put("Este", rs.getString("Este") != null ? rs.getString("Este") : "");
                lote.put("Oeste", rs.getString("Oeste") != null ? rs.getString("Oeste") : "");
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
        String sql = "SELECT l.*, m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre, " +
                     "c.Norte, c.Sur, c.Este, c.Oeste " +
                     "FROM LOTE l " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo " +
                     "LEFT JOIN COLINDANCIA c ON l.IdLote = c.IdLote " +
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
                    lote.put("Norte", rs.getString("Norte") != null ? rs.getString("Norte") : "");
                    lote.put("Sur", rs.getString("Sur") != null ? rs.getString("Sur") : "");
                    lote.put("Este", rs.getString("Este") != null ? rs.getString("Este") : "");
                    lote.put("Oeste", rs.getString("Oeste") != null ? rs.getString("Oeste") : "");
                    ctx.json(lote);
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("error", "Lote no encontrado");
                    ctx.status(404).json(resp);
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
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, String.valueOf(body.get("Numero")));
            pstmt.setString(2, String.valueOf(body.get("Medidas")));
            pstmt.setBigDecimal(3, new java.math.BigDecimal(String.valueOf(body.get("Precio"))));
            pstmt.setString(4, body.get("Estado") != null ? String.valueOf(body.get("Estado")) : "Disponible");
            pstmt.setInt(5, Integer.parseInt(String.valueOf(body.get("IdManzana"))));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            
            try (java.sql.ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    response.put("IdLote", generatedKeys.getInt(1));
                }
            }
            
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

            pstmt.setString(1, String.valueOf(body.get("Numero")));
            pstmt.setString(2, String.valueOf(body.get("Medidas")));
            pstmt.setBigDecimal(3, new java.math.BigDecimal(String.valueOf(body.get("Precio"))));
            pstmt.setString(4, String.valueOf(body.get("Estado")));
            pstmt.setInt(5, Integer.parseInt(String.valueOf(body.get("IdManzana"))));
            pstmt.setInt(6, id);

            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Lote actualizado con ÃƒÂ©xito");
            ctx.json(resp);

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
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Lote eliminado con ÃƒÂ©xito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}
