package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ContratoController {

    // GET /api/contratos
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT c.IdContrato, c.Folio, c.Fecha, c.Hora, c.TipoPago, c.MontoTotal, c.Estatus, " +
                     "cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, " +
                     "e.Nombre AS VendedorNombre, " +
                     "l.Numero AS LoteNumero, d.Nombre AS DesarrolloNombre " +
                     "FROM CONTRATO c " +
                     "JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente " +
                     "JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado " +
                     "JOIN LOTE l ON c.IdLote = l.IdLote " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo";

        ArrayList<Map<String, Object>> contratos = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> c = new HashMap<>();
                c.put("IdContrato", rs.getInt("IdContrato"));
                c.put("Folio", rs.getString("Folio"));
                c.put("Fecha", rs.getDate("Fecha").toString());
                c.put("Hora", rs.getTime("Hora").toString());
                c.put("TipoPago", rs.getString("TipoPago"));
                c.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
                c.put("Estatus", rs.getString("Estatus"));
                c.put("Cliente", rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos"));
                c.put("Vendedor", rs.getString("VendedorNombre"));
                c.put("Lote", rs.getString("LoteNumero"));
                c.put("Desarrollo", rs.getString("DesarrolloNombre"));
                contratos.add(c);
            }
            ctx.json(contratos);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/cliente/{clienteId}
    public static void obtenerPorCliente(Context ctx) {
        int clienteId = Integer.parseInt(ctx.pathParam("clienteId"));
        String sql = "SELECT * FROM CONTRATO WHERE IdCliente = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, clienteId);
            try (ResultSet rs = pstmt.executeQuery()) {
                ArrayList<Map<String, Object>> contratos = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> c = new HashMap<>();
                    c.put("IdContrato", rs.getInt("IdContrato"));
                    c.put("Folio", rs.getString("Folio"));
                    c.put("Fecha", rs.getDate("Fecha").toString());
                    c.put("Hora", rs.getTime("Hora").toString());
                    c.put("TipoPago", rs.getString("TipoPago"));
                    c.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
                    c.put("Estatus", rs.getString("Estatus"));
                    c.put("IdCliente", rs.getInt("IdCliente"));
                    c.put("IdEmpleado", rs.getInt("IdEmpleado"));
                    c.put("IdLote", rs.getInt("IdLote"));
                    contratos.add(c);
                }
                ctx.json(contratos);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/contratos
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO CONTRATO (Folio, Fecha, Hora, TipoPago, MontoTotal, Enganche, PlazoMeses, Mensualidad, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Folio"));
            pstmt.setDate(2, Date.valueOf(body.get("Fecha")));
            pstmt.setTime(3, Time.valueOf(body.get("Hora") + ":00"));
            pstmt.setString(4, body.get("TipoPago"));
            pstmt.setBigDecimal(5, new java.math.BigDecimal(body.get("MontoTotal")));
            pstmt.setBigDecimal(6, body.get("Enganche") != null ? new java.math.BigDecimal(body.get("Enganche")) : new java.math.BigDecimal("0"));
            pstmt.setInt(7, body.get("PlazoMeses") != null ? Integer.parseInt(body.get("PlazoMeses")) : 0);
            pstmt.setBigDecimal(8, body.get("Mensualidad") != null ? new java.math.BigDecimal(body.get("Mensualidad")) : new java.math.BigDecimal("0"));
            pstmt.setInt(9, Integer.parseInt(body.get("IdCliente")));
            pstmt.setInt(10, Integer.parseInt(body.get("IdEmpleado")));
            pstmt.setInt(11, Integer.parseInt(body.get("IdLote")));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Contrato creado con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/contratos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "UPDATE CONTRATO SET Fecha=?, Hora=?, TipoPago=?, MontoTotal=?, Estatus=? WHERE IdContrato=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, Date.valueOf(body.get("Fecha")));
            pstmt.setTime(2, Time.valueOf(body.get("Hora") + ":00"));
            pstmt.setString(3, body.get("TipoPago"));
            pstmt.setBigDecimal(4, new java.math.BigDecimal(body.get("MontoTotal")));
            pstmt.setString(5, body.get("Estatus"));
            pstmt.setInt(6, id);

            pstmt.executeUpdate();
            ctx.json("Contrato actualizado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/contratos/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM CONTRATO WHERE IdContrato = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            ctx.json("Contrato eliminado con éxito");

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}