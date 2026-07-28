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
                    colindancia.put("MedidaNorte", rs.getString("MedidaNorte") != null ? rs.getString("MedidaNorte") : "");
                    colindancia.put("MedidaSur", rs.getString("MedidaSur") != null ? rs.getString("MedidaSur") : "");
                    colindancia.put("MedidaEste", rs.getString("MedidaEste") != null ? rs.getString("MedidaEste") : "");
                    colindancia.put("MedidaOeste", rs.getString("MedidaOeste") != null ? rs.getString("MedidaOeste") : "");
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
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "INSERT INTO COLINDANCIA (Norte, Sur, Este, Oeste, MedidaNorte, MedidaSur, MedidaEste, MedidaOeste, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE Norte=VALUES(Norte), Sur=VALUES(Sur), Este=VALUES(Este), Oeste=VALUES(Oeste), " +
                     "MedidaNorte=VALUES(MedidaNorte), MedidaSur=VALUES(MedidaSur), MedidaEste=VALUES(MedidaEste), MedidaOeste=VALUES(MedidaOeste)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Norte"));
            pstmt.setString(2, body.get("Sur"));
            pstmt.setString(3, body.get("Este"));
            pstmt.setString(4, body.get("Oeste"));
            pstmt.setString(5, body.get("MedidaNorte"));
            pstmt.setString(6, body.get("MedidaSur"));
            pstmt.setString(7, body.get("MedidaEste"));
            pstmt.setString(8, body.get("MedidaOeste"));
            pstmt.setInt(9, Integer.parseInt(body.get("IdLote")));

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
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "UPDATE COLINDANCIA SET Norte=?, Sur=?, Este=?, Oeste=?, MedidaNorte=?, MedidaSur=?, MedidaEste=?, MedidaOeste=? WHERE IdColindancia=? OR IdLote=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Norte"));
            pstmt.setString(2, body.get("Sur"));
            pstmt.setString(3, body.get("Este"));
            pstmt.setString(4, body.get("Oeste"));
            pstmt.setString(5, body.get("MedidaNorte"));
            pstmt.setString(6, body.get("MedidaSur"));
            pstmt.setString(7, body.get("MedidaEste"));
            pstmt.setString(8, body.get("MedidaOeste"));
            pstmt.setInt(9, id);
            pstmt.setInt(10, id);

            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Colindancia actualizada con éxito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}

