package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class ColindanciaController {

    // GET /api/colindancias/lote/{loteId}
    public static void obtenerPorLote(Context ctx) {
        int loteId = Integer.parseInt(ctx.pathParam("loteId"));
        String sql = "SELECT * FROM COLINDANCIA WHERE IdLote = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, loteId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> colindancia = new HashMap<>();
                    colindancia.put("IdColindancia", rs.getInt("IdColindancia"));
                    colindancia.put("Norte", rs.getString("Norte"));
                    colindancia.put("Sur", rs.getString("Sur"));
                    colindancia.put("Este", rs.getString("Este"));
                    colindancia.put("Oeste", rs.getString("Oeste"));
                    colindancia.put("IdLote", rs.getInt("IdLote"));
                    ctx.json(colindancia);
                } else {
                    ctx.json(new HashMap<>());
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/colindancias
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO COLINDANCIA (Norte, Sur, Este, Oeste, IdLote) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Norte"));
            pstmt.setString(2, body.get("Sur"));
            pstmt.setString(3, body.get("Este"));
            pstmt.setString(4, body.get("Oeste"));
            pstmt.setInt(5, Integer.parseInt(body.get("IdLote")));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Colindancia registrada con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/colindancias/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "UPDATE COLINDANCIA SET Norte=?, Sur=?, Este=?, Oeste=? WHERE IdColindancia=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Norte"));
            pstmt.setString(2, body.get("Sur"));
            pstmt.setString(3, body.get("Este"));
            pstmt.setString(4, body.get("Oeste"));
            pstmt.setInt(5, id);

            pstmt.executeUpdate();
            ctx.json("Colindancia actualizada con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}