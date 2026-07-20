package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ClienteController {

    // GET /api/clientes
    public static void obtenerTodos(Context ctx) {
        String idEmpleadoParam = ctx.queryParam("IdEmpleado");
        String sql = "SELECT * FROM CLIENTE";
        
        if (idEmpleadoParam != null && !idEmpleadoParam.isEmpty()) {
            sql += " WHERE IdEmpleado = ?";
        }
        
        ArrayList<Map<String, Object>> clientes = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            if (idEmpleadoParam != null && !idEmpleadoParam.isEmpty()) {
                pstmt.setInt(1, Integer.parseInt(idEmpleadoParam));
            }

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                Map<String, Object> cliente = new HashMap<>();
                cliente.put("IdCliente", rs.getInt("IdCliente"));
                cliente.put("Nombre", rs.getString("Nombre"));
                cliente.put("Apellidos", rs.getString("Apellidos"));
                cliente.put("Direccion", rs.getString("Direccion"));
                cliente.put("Casa_Apartamento", rs.getString("Casa_Apartamento"));
                cliente.put("Codigo_Postal", rs.getString("Codigo_Postal"));
                cliente.put("Ciudad", rs.getString("Ciudad"));
                cliente.put("Estado", rs.getString("Estado"));
                cliente.put("Telefono", rs.getString("Telefono"));
                cliente.put("Email", rs.getString("Email"));
                cliente.put("INE", rs.getString("INE"));
                cliente.put("CURP", rs.getString("CURP"));
                cliente.put("Estatus", rs.getString("Estatus"));
                cliente.put("IdEmpleado", rs.getInt("IdEmpleado"));
                clientes.add(cliente);
            }
            ctx.json(clientes);
            } // CIERRE DEL INNER TRY (ResultSet)

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/clientes/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT * FROM CLIENTE WHERE IdCliente = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> cliente = new HashMap<>();
                    cliente.put("IdCliente", rs.getInt("IdCliente"));
                    cliente.put("Nombre", rs.getString("Nombre"));
                    cliente.put("Apellidos", rs.getString("Apellidos"));
                    cliente.put("Direccion", rs.getString("Direccion"));
                    cliente.put("Casa_Apartamento", rs.getString("Casa_Apartamento"));
                    cliente.put("Codigo_Postal", rs.getString("Codigo_Postal"));
                    cliente.put("Ciudad", rs.getString("Ciudad"));
                    cliente.put("Estado", rs.getString("Estado"));
                    cliente.put("Telefono", rs.getString("Telefono"));
                    cliente.put("Email", rs.getString("Email"));
                    cliente.put("INE", rs.getString("INE"));
                    cliente.put("CURP", rs.getString("CURP"));
                    cliente.put("Estatus", rs.getString("Estatus"));
                    cliente.put("IdEmpleado", rs.getInt("IdEmpleado"));
                    ctx.json(cliente);
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("error", "Cliente no encontrado");
                    ctx.status(404).json(resp);
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/clientes
    public static void crear(Context ctx) {
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "INSERT INTO CLIENTE (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, Email, INE, CURP, IdEmpleado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Apellidos"));
            pstmt.setString(3, body.get("Direccion"));
            pstmt.setString(4, body.get("Casa_Apartamento"));
            pstmt.setString(5, body.get("Codigo_Postal"));
            pstmt.setString(6, body.get("Ciudad"));
            pstmt.setString(7, body.get("Estado"));
            pstmt.setString(8, body.get("Telefono"));
            pstmt.setString(9, body.get("Email"));
            pstmt.setString(10, body.get("INE"));
            pstmt.setString(11, body.get("CURP"));
            
            String idEmpleado = body.get("IdEmpleado");
            if (idEmpleado != null && !idEmpleado.isEmpty()) {
                pstmt.setInt(12, Integer.parseInt(idEmpleado));
            } else {
                pstmt.setNull(12, java.sql.Types.INTEGER);
            }

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Cliente registrado con Ã©xito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/clientes/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "UPDATE CLIENTE SET Nombre=?, Apellidos=?, Direccion=?, Casa_Apartamento=?, Codigo_Postal=?, Ciudad=?, Estado=?, Telefono=?, Email=?, INE=?, CURP=?, Estatus=? WHERE IdCliente=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Nombre"));
            pstmt.setString(2, body.get("Apellidos"));
            pstmt.setString(3, body.get("Direccion"));
            pstmt.setString(4, body.get("Casa_Apartamento"));
            pstmt.setString(5, body.get("Codigo_Postal"));
            pstmt.setString(6, body.get("Ciudad"));
            pstmt.setString(7, body.get("Estado"));
            pstmt.setString(8, body.get("Telefono"));
            pstmt.setString(9, body.get("Email"));
            pstmt.setString(10, body.get("INE"));
            pstmt.setString(11, body.get("CURP"));
            pstmt.setString(12, body.get("Estatus"));
            pstmt.setInt(13, id);

            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Cliente actualizado con Ã©xito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/clientes/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM CLIENTE WHERE IdCliente = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Cliente eliminado con Ã©xito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}

