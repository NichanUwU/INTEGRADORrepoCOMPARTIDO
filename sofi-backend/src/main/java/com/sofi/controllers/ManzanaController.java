package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ManzanaController {

    // GET /api/manzanas
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT m.*, d.Nombre AS DesarrolloNombre FROM MANZANA m JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo";
        ArrayList<Map<String, Object>> manzanas = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> manzana = new HashMap<>();
                manzana.put("IdManzana", rs.getInt("IdManzana"));
                manzana.put("Numero", rs.getInt("Numero"));
                manzana.put("Calles_Colindantes", rs.getString("Calles_Colindantes"));
                manzana.put("IdDesarrollo", rs.getInt("IdDesarrollo"));
                manzana.put("DesarrolloNombre", rs.getString("DesarrolloNombre"));
                manzanas.add(manzana);
            }
            ctx.json(manzanas);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/manzanas/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT m.*, d.Nombre AS DesarrolloNombre FROM MANZANA m JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo WHERE m.IdManzana = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> manzana = new HashMap<>();
                    manzana.put("IdManzana", rs.getInt("IdManzana"));
                    manzana.put("Numero", rs.getInt("Numero"));
                    manzana.put("Calles_Colindantes", rs.getString("Calles_Colindantes"));
                    manzana.put("IdDesarrollo", rs.getInt("IdDesarrollo"));
                    manzana.put("DesarrolloNombre", rs.getString("DesarrolloNombre"));
                    ctx.json(manzana);
                } else {
                    ctx.status(404).json("Manzana no encontrada");
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/manzanas/desarrollo/{desarrolloId}
    public static void obtenerPorDesarrollo(Context ctx) {
        int desarrolloId = Integer.parseInt(ctx.pathParam("desarrolloId"));
        String sql = "SELECT * FROM MANZANA WHERE IdDesarrollo = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, desarrolloId);
            try (ResultSet rs = pstmt.executeQuery()) {
                ArrayList<Map<String, Object>> manzanas = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> manzana = new HashMap<>();
                    manzana.put("IdManzana", rs.getInt("IdManzana"));
                    manzana.put("Numero", rs.getInt("Numero"));
                    manzana.put("Calles_Colindantes", rs.getString("Calles_Colindantes"));
                    manzana.put("IdDesarrollo", rs.getInt("IdDesarrollo"));
                    manzanas.add(manzana);
                }
                ctx.json(manzanas);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/manzanas
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO MANZANA (Numero, Calles_Colindantes, IdDesarrollo) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, Integer.parseInt(body.get("Numero")));
            pstmt.setString(2, body.get("Calles_Colindantes"));
            pstmt.setInt(3, Integer.parseInt(body.get("IdDesarrollo")));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Manzana creada con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/manzanas/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "UPDATE MANZANA SET Numero=?, Calles_Colindantes=?, IdDesarrollo=? WHERE IdManzana=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, Integer.parseInt(body.get("Numero")));
            pstmt.setString(2, body.get("Calles_Colindantes"));
            pstmt.setInt(3, Integer.parseInt(body.get("IdDesarrollo")));
            pstmt.setInt(4, id);

            pstmt.executeUpdate();
            ctx.json("Manzana actualizada con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/manzanas/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM MANZANA WHERE IdManzana = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            ctx.json("Manzana eliminada con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}