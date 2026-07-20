package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ClienteController {

    private static boolean tieneColumna(Connection conn, String tabla, String columna) throws SQLException {
        try (ResultSet rs = conn.getMetaData().getColumns(null, null, tabla, columna)) {
            return rs.next();
        }
    }

    public static String construirSqlInsert(boolean conEmail) {
        if (conEmail) {
            return "INSERT INTO CLIENTE (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, Email, INE, CURP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
        return "INSERT INTO CLIENTE (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, INE, CURP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    }

    public static String construirSqlUpdate(boolean conEmail) {
        if (conEmail) {
            return "UPDATE CLIENTE SET Nombre=?, Apellidos=?, Direccion=?, Casa_Apartamento=?, Codigo_Postal=?, Ciudad=?, Estado=?, Telefono=?, Email=?, INE=?, CURP=? WHERE IdCliente=?";
        }
        return "UPDATE CLIENTE SET Nombre=?, Apellidos=?, Direccion=?, Casa_Apartamento=?, Codigo_Postal=?, Ciudad=?, Estado=?, Telefono=?, INE=?, CURP=? WHERE IdCliente=?";
    }

    // GET /api/clientes
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT * FROM CLIENTE";
        ArrayList<Map<String, Object>> clientes = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            boolean conEmail = tieneColumna(conn, "CLIENTE", "Email");
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
                if (conEmail) {
                    cliente.put("Email", rs.getString("Email"));
                }
                cliente.put("INE", rs.getString("INE"));
                cliente.put("CURP", rs.getString("CURP"));
                clientes.add(cliente);
            }
            ctx.json(clientes);

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
                boolean conEmail = tieneColumna(conn, "CLIENTE", "Email");
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
                    if (conEmail) {
                        cliente.put("Email", rs.getString("Email"));
                    }
                    cliente.put("INE", rs.getString("INE"));
                    cliente.put("CURP", rs.getString("CURP"));
                    ctx.json(cliente);
                } else {
                    ctx.status(404).json("Cliente no encontrado");
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
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            boolean conEmail = tieneColumna(conn, "CLIENTE", "Email");
            String sql = construirSqlInsert(conEmail);

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, body.get("Nombre") != null ? body.get("Nombre").toString() : "");
                pstmt.setString(2, body.get("Apellidos") != null ? body.get("Apellidos").toString() : "");
                pstmt.setString(3, body.get("Direccion") != null ? body.get("Direccion").toString() : "");
                pstmt.setString(4, body.get("Casa_Apartamento") != null ? body.get("Casa_Apartamento").toString() : "");
                pstmt.setString(5, body.get("Codigo_Postal") != null ? body.get("Codigo_Postal").toString() : "");
                pstmt.setString(6, body.get("Ciudad") != null ? body.get("Ciudad").toString() : "");
                pstmt.setString(7, body.get("Estado") != null ? body.get("Estado").toString() : "");
                pstmt.setString(8, body.get("Telefono") != null ? body.get("Telefono").toString() : "");

                if (conEmail) {
                    pstmt.setString(9, body.get("Email") != null ? body.get("Email").toString() : null);
                    pstmt.setString(10, body.get("INE") != null ? body.get("INE").toString() : "");
                    pstmt.setString(11, body.get("CURP") != null ? body.get("CURP").toString() : "");
                } else {
                    pstmt.setString(9, body.get("INE") != null ? body.get("INE").toString() : "");
                    pstmt.setString(10, body.get("CURP") != null ? body.get("CURP").toString() : "");
                }

                pstmt.executeUpdate();
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Cliente registrado con éxito");
                ctx.status(201).json(response);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/clientes/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            boolean conEmail = tieneColumna(conn, "CLIENTE", "Email");
            String sql = construirSqlUpdate(conEmail);

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, body.get("Nombre") != null ? body.get("Nombre").toString() : "");
                pstmt.setString(2, body.get("Apellidos") != null ? body.get("Apellidos").toString() : "");
                pstmt.setString(3, body.get("Direccion") != null ? body.get("Direccion").toString() : "");
                pstmt.setString(4, body.get("Casa_Apartamento") != null ? body.get("Casa_Apartamento").toString() : "");
                pstmt.setString(5, body.get("Codigo_Postal") != null ? body.get("Codigo_Postal").toString() : "");
                pstmt.setString(6, body.get("Ciudad") != null ? body.get("Ciudad").toString() : "");
                pstmt.setString(7, body.get("Estado") != null ? body.get("Estado").toString() : "");
                pstmt.setString(8, body.get("Telefono") != null ? body.get("Telefono").toString() : "");

                if (conEmail) {
                    pstmt.setString(9, body.get("Email") != null ? body.get("Email").toString() : null);
                    pstmt.setString(10, body.get("INE") != null ? body.get("INE").toString() : "");
                    pstmt.setString(11, body.get("CURP") != null ? body.get("CURP").toString() : "");
                    pstmt.setInt(12, id);
                } else {
                    pstmt.setString(9, body.get("INE") != null ? body.get("INE").toString() : "");
                    pstmt.setString(10, body.get("CURP") != null ? body.get("CURP").toString() : "");
                    pstmt.setInt(11, id);
                }

                pstmt.executeUpdate();
                ctx.json("Cliente actualizado con éxito");
            }

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
            ctx.json("Cliente eliminado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}