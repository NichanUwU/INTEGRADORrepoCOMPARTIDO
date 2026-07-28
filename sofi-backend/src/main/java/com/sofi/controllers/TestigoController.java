package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class TestigoController {

    // GET /api/testigos
    // Si viene ?IdEmpleado=X se puede filtrar por los testigos de los clientes de ese vendedor
    public static void obtenerTodos(Context ctx) {
        String idEmpleadoParam = ctx.queryParam("IdEmpleado");
        
        String sql = "SELECT t.*, c.Nombre AS ClienteNombre, c.Apellidos AS ClienteApellidos " +
                     "FROM TESTIGO t " +
                     "JOIN CLIENTE c ON t.IdCliente = c.IdCliente";

        if (idEmpleadoParam != null && !idEmpleadoParam.isEmpty()) {
            sql += " WHERE c.IdEmpleado = ?";
        }

        ArrayList<Map<String, Object>> testigos = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            if (idEmpleadoParam != null && !idEmpleadoParam.isEmpty()) {
                pstmt.setInt(1, Integer.parseInt(idEmpleadoParam));
            }

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> testigo = new HashMap<>();
                    testigo.put("IdTestigo", rs.getInt("IdTestigo"));
                    testigo.put("Nombre", rs.getString("Nombre"));
                    testigo.put("Apellidos", rs.getString("Apellidos"));
                    testigo.put("Direccion", rs.getString("Direccion"));
                    testigo.put("Casa_Apartamento", rs.getString("Casa_Apartamento"));
                    testigo.put("Codigo_Postal", rs.getString("Codigo_Postal"));
                    testigo.put("Ciudad", rs.getString("Ciudad"));
                    testigo.put("Estado", rs.getString("Estado"));
                    testigo.put("Telefono", rs.getString("Telefono"));
                    testigo.put("IdCliente", rs.getInt("IdCliente"));
                    testigo.put("Cliente", rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos"));
                    testigos.add(testigo);
                }
                ctx.json(testigos);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/testigos/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT * FROM TESTIGO WHERE IdTestigo = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> testigo = new HashMap<>();
                    testigo.put("IdTestigo", rs.getInt("IdTestigo"));
                    testigo.put("Nombre", rs.getString("Nombre"));
                    testigo.put("Apellidos", rs.getString("Apellidos"));
                    testigo.put("Direccion", rs.getString("Direccion"));
                    testigo.put("Casa_Apartamento", rs.getString("Casa_Apartamento"));
                    testigo.put("Codigo_Postal", rs.getString("Codigo_Postal"));
                    testigo.put("Ciudad", rs.getString("Ciudad"));
                    testigo.put("Estado", rs.getString("Estado"));
                    testigo.put("Telefono", rs.getString("Telefono"));
                    testigo.put("IdCliente", rs.getInt("IdCliente"));
                    ctx.json(testigo);
                } else {
                    ctx.status(404).result("Testigo no encontrado");
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/testigos
    public static void crear(Context ctx) {
        try {
            Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class);
            Map<String, String> body = new HashMap<>();
            if (bodyObj != null) {
                for (Map.Entry<String, Object> e : bodyObj.entrySet()) {
                    if (e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue()));
                }
            }

            String idCliente = body.get("IdCliente");
            if (idCliente == null || idCliente.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "El campo IdCliente es requerido");
                ctx.status(400).json(err);
                return;
            }

            String sql = "INSERT INTO TESTIGO (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, IdCliente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

                pstmt.setString(1, body.get("Nombre"));
                pstmt.setString(2, body.get("Apellidos"));
                pstmt.setString(3, body.get("Direccion") != null ? body.get("Direccion") : body.get("Dirección"));
                pstmt.setString(4, body.get("Casa_Apartamento"));
                pstmt.setString(5, body.get("Codigo_Postal"));
                pstmt.setString(6, body.get("Ciudad"));
                pstmt.setString(7, body.get("Estado"));
                pstmt.setString(8, body.get("Telefono") != null ? body.get("Telefono") : body.get("Teléfono"));
                pstmt.setInt(9, Integer.parseInt(idCliente));

                pstmt.executeUpdate();
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("mensaje", "Testigo creado");
                        response.put("id", rs.getInt(1));
                        ctx.status(201).json(response);
                    }
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/testigos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        try {
            Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class);
            Map<String, String> body = new HashMap<>();
            if (bodyObj != null) {
                for (Map.Entry<String, Object> e : bodyObj.entrySet()) {
                    if (e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue()));
                }
            }
            
            String idCliente = body.get("IdCliente");
            if (idCliente == null || idCliente.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "El campo IdCliente es requerido");
                ctx.status(400).json(err);
                return;
            }

            String sql = "UPDATE TESTIGO SET Nombre = ?, Apellidos = ?, Direccion = ?, Casa_Apartamento = ?, Codigo_Postal = ?, Ciudad = ?, Estado = ?, Telefono = ?, IdCliente = ? WHERE IdTestigo = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {

                pstmt.setString(1, body.get("Nombre"));
                pstmt.setString(2, body.get("Apellidos"));
                pstmt.setString(3, body.get("Direccion") != null ? body.get("Direccion") : body.get("Dirección"));
                pstmt.setString(4, body.get("Casa_Apartamento"));
                pstmt.setString(5, body.get("Codigo_Postal"));
                pstmt.setString(6, body.get("Ciudad"));
                pstmt.setString(7, body.get("Estado"));
                pstmt.setString(8, body.get("Telefono") != null ? body.get("Telefono") : body.get("Teléfono"));
                pstmt.setInt(9, Integer.parseInt(idCliente));
                pstmt.setInt(10, id);

                pstmt.executeUpdate();
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Testigo actualizado");
                ctx.json(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/testigos/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM TESTIGO WHERE IdTestigo = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Testigo eliminado");
            ctx.json(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}
