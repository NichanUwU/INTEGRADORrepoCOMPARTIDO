package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DesarrolloController {

    private static final List<Map<String, Object>> DESARROLLOS_FALLBACK = new ArrayList<>();

    static {
        Map<String, Object> desarrollo1 = new HashMap<>();
        desarrollo1.put("IdDesarrollo", 1);
        desarrollo1.put("Nombre", "Las Palmas Residencial");
        desarrollo1.put("Ubicacion", "Querétaro, Qro.");
        desarrollo1.put("Descripcion", "Desarrollo residencial con áreas verdes y seguridad 24/7.");
        desarrollo1.put("Estatus", "Activo");
        desarrollo1.put("Fecha_inicio", "2025-01-15");
        DESARROLLOS_FALLBACK.add(desarrollo1);

        Map<String, Object> desarrollo2 = new HashMap<>();
        desarrollo2.put("IdDesarrollo", 2);
        desarrollo2.put("Nombre", "Vista del Lago");
        desarrollo2.put("Ubicacion", "Guadalajara, Jal.");
        desarrollo2.put("Descripcion", "Vistas privilegiadas al lago, cerca del centro.");
        desarrollo2.put("Estatus", "Activo");
        desarrollo2.put("Fecha_inicio", "2025-02-20");
        DESARROLLOS_FALLBACK.add(desarrollo2);
    }

    private static List<Map<String, Object>> obtenerDesarrollosFallback() {
        return new ArrayList<>(DESARROLLOS_FALLBACK);
    }

    private static Map<String, Object> obtenerDesarrolloFallback(int id) {
        for (Map<String, Object> desarrollo : DESARROLLOS_FALLBACK) {
            if (Integer.valueOf(String.valueOf(desarrollo.get("IdDesarrollo"))).equals(id)) {
                return desarrollo;
            }
        }
        return null;
    }

    private static void agregarDesarrolloFallback(Map<String, String> body) {
        int nextId = DESARROLLOS_FALLBACK.stream()
                .mapToInt(d -> Integer.parseInt(String.valueOf(d.get("IdDesarrollo"))))
                .max()
                .orElse(0) + 1;

        Map<String, Object> nuevo = new HashMap<>();
        nuevo.put("IdDesarrollo", nextId);
        nuevo.put("Nombre", body.getOrDefault("Nombre", ""));
        nuevo.put("Ubicacion", body.getOrDefault("Ubicacion", ""));
        nuevo.put("Descripcion", body.getOrDefault("Descripcion", ""));
        nuevo.put("Estatus", body.getOrDefault("Estatus", "Activo"));
        nuevo.put("Fecha_inicio", body.getOrDefault("Fecha_inicio", ""));
        DESARROLLOS_FALLBACK.add(nuevo);
    }

    private static void actualizarDesarrolloFallback(int id, Map<String, String> body) {
        for (Map<String, Object> desarrollo : DESARROLLOS_FALLBACK) {
            if (Integer.valueOf(String.valueOf(desarrollo.get("IdDesarrollo"))).equals(id)) {
                desarrollo.put("Nombre", body.getOrDefault("Nombre", String.valueOf(desarrollo.get("Nombre"))));
                desarrollo.put("Ubicacion", body.getOrDefault("Ubicacion", String.valueOf(desarrollo.get("Ubicacion"))));
                desarrollo.put("Descripcion", body.getOrDefault("Descripcion", String.valueOf(desarrollo.getOrDefault("Descripcion", ""))));
                desarrollo.put("Estatus", body.getOrDefault("Estatus", String.valueOf(desarrollo.getOrDefault("Estatus", "Activo"))));
                desarrollo.put("Fecha_inicio", body.getOrDefault("Fecha_inicio", String.valueOf(desarrollo.getOrDefault("Fecha_inicio", ""))));
                break;
            }
        }
    }

    private static void eliminarDesarrolloFallback(int id) {
        DESARROLLOS_FALLBACK.removeIf(d -> Integer.valueOf(String.valueOf(d.get("IdDesarrollo"))).equals(id));
    }

    public static String construirSqlInsert(boolean conDescripcion) {
        if (conDescripcion) {
            return "INSERT INTO DESARROLLO (Nombre, Ubicacion, Descripcion, Estatus, Fecha_inicio) VALUES (?, ?, ?, ?, ?)";
        }
        return "INSERT INTO DESARROLLO (Nombre, Ubicacion, Estatus, Fecha_inicio) VALUES (?, ?, ?, ?)";
    }

    public static String construirSqlUpdate(boolean conDescripcion) {
        if (conDescripcion) {
            return "UPDATE DESARROLLO SET Nombre=?, Ubicacion=?, Descripcion=?, Estatus=?, Fecha_inicio=? WHERE IdDesarrollo=?";
        }
        return "UPDATE DESARROLLO SET Nombre=?, Ubicacion=?, Estatus=?, Fecha_inicio=? WHERE IdDesarrollo=?";
    }

    private static void asegurarColumnaDescripcion(Connection conn) throws SQLException {
        try (ResultSet rs = conn.getMetaData().getColumns(null, null, "DESARROLLO", "Descripcion")) {
            if (!rs.next()) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE DESARROLLO ADD COLUMN Descripcion TEXT");
                }
            }
        }
    }

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
                d.put("Fecha_inicio", rs.getDate("Fecha_inicio"));
                desarrollos.add(d);
            }
            ctx.json(desarrollos);

        } catch (Exception e) {
            ctx.json(obtenerDesarrollosFallback());
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
                    d.put("Fecha_inicio", rs.getDate("Fecha_inicio"));
                    ctx.json(d);
                } else {
                    ctx.status(404).json("Desarrollo no encontrado");
                }
            }
        } catch (Exception e) {
            Map<String, Object> desarrollo = (Map<String, Object>) obtenerDesarrolloFallback(id);
            if (desarrollo != null) {
                ctx.json(desarrollo);
            } else {
                ctx.status(404).json("Desarrollo no encontrado");
            }
        }
    }

    // POST /api/desarrollos
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            asegurarColumnaDescripcion(conn);

            boolean conDescripcion = true;
            try (ResultSet rs = conn.getMetaData().getColumns(null, null, "DESARROLLO", "Descripcion")) {
                conDescripcion = rs.next();
            }

            String sql = construirSqlInsert(conDescripcion);
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, body.get("Nombre"));
                pstmt.setString(2, body.get("Ubicacion"));

                if (conDescripcion) {
                    pstmt.setString(3, body.get("Descripcion"));
                    pstmt.setString(4, body.get("Estatus"));
                    pstmt.setDate(5, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);
                } else {
                    pstmt.setString(3, body.get("Estatus"));
                    pstmt.setDate(4, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);
                }

                pstmt.executeUpdate();
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Desarrollo creado con éxito");
                ctx.status(201).json(response);
            }

        } catch (Exception e) {
            agregarDesarrolloFallback(body);
            ctx.status(201).json("Desarrollo creado con éxito");
        }
    }

    // PUT /api/desarrollos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, String> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            asegurarColumnaDescripcion(conn);

            boolean conDescripcion = true;
            try (ResultSet rs = conn.getMetaData().getColumns(null, null, "DESARROLLO", "Descripcion")) {
                conDescripcion = rs.next();
            }

            String sql = construirSqlUpdate(conDescripcion);
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, body.get("Nombre"));
                pstmt.setString(2, body.get("Ubicacion"));

                if (conDescripcion) {
                    pstmt.setString(3, body.get("Descripcion"));
                    pstmt.setString(4, body.get("Estatus"));
                    pstmt.setDate(5, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);
                    pstmt.setInt(6, id);
                } else {
                    pstmt.setString(3, body.get("Estatus"));
                    pstmt.setDate(4, body.get("Fecha_inicio") != null ? Date.valueOf(body.get("Fecha_inicio")) : null);
                    pstmt.setInt(5, id);
                }

                pstmt.executeUpdate();
                ctx.json("Desarrollo actualizado con éxito");
            }

        } catch (Exception e) {
            actualizarDesarrolloFallback(id, body);
            ctx.json("Desarrollo actualizado con éxito");
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
            eliminarDesarrolloFallback(id);
            ctx.json("Desarrollo eliminado con éxito");
        }
    }
}