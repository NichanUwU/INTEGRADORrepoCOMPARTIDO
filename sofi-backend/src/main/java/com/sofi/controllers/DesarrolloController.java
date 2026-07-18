package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class DesarrolloController {

    // GET /api/desarrollos
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
                d.put("Descripcion", rs.getString("Descripcion"));
                d.put("Estatus", rs.getString("Estatus"));
                d.put("Fecha_inicio", rs.getDate("Fecha_inicio"));
                desarrollos.add(d);
            }
            ctx.json(desarrollos);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/desarrollos/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT * FROM DESARROLLO WHERE IdDesarrollo = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> d = new HashMap<>();
                    d.put("IdDesarrollo", rs.getInt("IdDesarrollo"));
                    d.put("Nombre", rs.getString("Nombre"));
                    d.put("Ubicacion", rs.getString("Ubicacion"));
                    d.put("Descripcion", rs.getString("Descripcion"));
                    d.put("Estatus", rs.getString("Estatus"));
                    d.put("Fecha_inicio", rs.getDate("Fecha_inicio"));
                    ctx.json(d);
                } else {
                    ctx.status(404).json("Desarrollo no encontrado");
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/desarrollos
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO DESARROLLO (Nombre, Ubicacion, Descripcion, Estatus, Fecha_inicio) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Ubicacion"));
            pstmt.setString(3, body.get("Descripcion"));
            pstmt.setString(4, body.get("Estatus"));
            pstmt.setDate(5, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Desarrollo creado con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/desarrollos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "UPDATE DESARROLLO SET Nombre=?, Ubicacion=?, Descripcion=?, Estatus=?, Fecha_inicio=? WHERE IdDesarrollo=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Ubicacion"));
            pstmt.setString(3, body.get("Descripcion"));
            pstmt.setString(4, body.get("Estatus"));
            pstmt.setDate(5, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);
            pstmt.setInt(6, id);

            pstmt.executeUpdate();
            ctx.json("Desarrollo actualizado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/desarrollos/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM DESARROLLO WHERE IdDesarrollo = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            ctx.json("Desarrollo eliminado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}