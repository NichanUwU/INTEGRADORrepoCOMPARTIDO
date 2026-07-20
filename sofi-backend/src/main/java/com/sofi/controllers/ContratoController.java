package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ContratoController {

    private static boolean tieneColumna(Connection conn, String tabla, String columna) throws SQLException {
        try (ResultSet rs = conn.getMetaData().getColumns(null, null, tabla, columna)) {
            return rs.next();
        }
    }

    private static boolean tieneColumna(ResultSetMetaData metadata, String columna) throws SQLException {
        for (int i = 1; i <= metadata.getColumnCount(); i++) {
            String name = metadata.getColumnLabel(i);
            if (name != null && name.equalsIgnoreCase(columna)) {
                return true;
            }
            String columnName = metadata.getColumnName(i);
            if (columnName != null && columnName.equalsIgnoreCase(columna)) {
                return true;
            }
        }
        return false;
    }

    public static String construirSqlInsert(boolean conFolio) {
        return construirSqlInsert(conFolio, true);
    }

    public static String construirSqlInsert(boolean conFolio, boolean conMontoTotal) {
        if (conFolio && conMontoTotal) {
            return "INSERT INTO CONTRATO (Folio, Fecha, Hora, TipoPago, MontoTotal, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        }
        if (conFolio) {
            return "INSERT INTO CONTRATO (Folio, Fecha, Hora, TipoPago, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?)";
        }
        if (conMontoTotal) {
            return "INSERT INTO CONTRATO (Fecha, Hora, TipoPago, MontoTotal, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?)";
        }
        return "INSERT INTO CONTRATO (Fecha, Hora, TipoPago, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?)";
    }

    public static String construirSqlUpdate(boolean conFolio) {
        return construirSqlUpdate(conFolio, true);
    }

    public static String construirSqlUpdate(boolean conFolio, boolean conMontoTotal) {
        if (conFolio && conMontoTotal) {
            return "UPDATE CONTRATO SET Folio=?, Fecha=?, Hora=?, TipoPago=?, MontoTotal=?, IdCliente=?, IdEmpleado=?, IdLote=? WHERE IdContrato=?";
        }
        if (conFolio) {
            return "UPDATE CONTRATO SET Folio=?, Fecha=?, Hora=?, TipoPago=?, IdCliente=?, IdEmpleado=?, IdLote=? WHERE IdContrato=?";
        }
        if (conMontoTotal) {
            return "UPDATE CONTRATO SET Fecha=?, Hora=?, TipoPago=?, MontoTotal=?, IdCliente=?, IdEmpleado=?, IdLote=? WHERE IdContrato=?";
        }
        return "UPDATE CONTRATO SET Fecha=?, Hora=?, TipoPago=?, IdCliente=?, IdEmpleado=?, IdLote=? WHERE IdContrato=?";
    }

    private static void poblarContrato(Map<String, Object> contrato, ResultSet rs, ResultSetMetaData metadata) throws SQLException {
        contrato.put("IdContrato", rs.getInt("IdContrato"));
        contrato.put("Folio", tieneColumna(metadata, "Folio") ? rs.getString("Folio") : "");
        if (tieneColumna(metadata, "Fecha")) {
            contrato.put("Fecha", rs.getDate("Fecha").toString());
        }
        if (tieneColumna(metadata, "Hora")) {
            contrato.put("Hora", rs.getTime("Hora").toString());
        }
        if (tieneColumna(metadata, "TipoPago")) {
            contrato.put("TipoPago", rs.getString("TipoPago"));
        }
        if (tieneColumna(metadata, "MontoTotal")) {
            contrato.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
        }
        if (tieneColumna(metadata, "Estatus")) {
            contrato.put("Estatus", rs.getString("Estatus"));
        }
        if (tieneColumna(metadata, "IdCliente")) {
            contrato.put("IdCliente", rs.getInt("IdCliente"));
        }
        if (tieneColumna(metadata, "IdEmpleado")) {
            contrato.put("IdEmpleado", rs.getInt("IdEmpleado"));
        }
        if (tieneColumna(metadata, "IdLote")) {
            contrato.put("IdLote", rs.getInt("IdLote"));
        }
        if (tieneColumna(metadata, "ClienteNombre") || tieneColumna(metadata, "ClienteApellidos")) {
            String nombre = null;
            String apellido = null;
            if (tieneColumna(metadata, "ClienteNombre")) {
                nombre = rs.getString("ClienteNombre");
            }
            if (tieneColumna(metadata, "ClienteApellidos")) {
                apellido = rs.getString("ClienteApellidos");
            }
            contrato.put("Cliente", (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "").trim());
        }
        if (tieneColumna(metadata, "VendedorNombre") || tieneColumna(metadata, "VendedorApellidos")) {
            String nombre = null;
            String apellido = null;
            if (tieneColumna(metadata, "VendedorNombre")) {
                nombre = rs.getString("VendedorNombre");
            }
            if (tieneColumna(metadata, "VendedorApellidos")) {
                apellido = rs.getString("VendedorApellidos");
            }
            contrato.put("Vendedor", (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "").trim());
        }
        if (tieneColumna(metadata, "LoteNumero")) {
            contrato.put("Lote", rs.getString("LoteNumero"));
        }
        if (tieneColumna(metadata, "DesarrolloNombre")) {
            contrato.put("Desarrollo", rs.getString("DesarrolloNombre"));
        }
    }

    // GET /api/contratos
    public static void obtenerTodos(Context ctx) {
        ArrayList<Map<String, Object>> contratos = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection()) {
            String sql = "SELECT c.*, cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, e.Nombre AS VendedorNombre, e.Apellidos AS VendedorApellidos, l.Numero AS LoteNumero, d.Nombre AS DesarrolloNombre FROM CONTRATO c JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado JOIN LOTE l ON c.IdLote = l.IdLote JOIN MANZANA m ON l.IdManzana = m.IdManzana JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo";

            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                ResultSetMetaData metadata = rs.getMetaData();
                while (rs.next()) {
                    Map<String, Object> contrato = new HashMap<>();
                    poblarContrato(contrato, rs, metadata);
                    contratos.add(contrato);
                }
                ctx.json(contratos);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));

        try (Connection conn = DatabaseConnection.getConnection()) {
            String sql = "SELECT c.*, cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, e.Nombre AS VendedorNombre, e.Apellidos AS VendedorApellidos, l.Numero AS LoteNumero, d.Nombre AS DesarrolloNombre FROM CONTRATO c JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado JOIN LOTE l ON c.IdLote = l.IdLote JOIN MANZANA m ON l.IdManzana = m.IdManzana JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo WHERE c.IdContrato = ?";

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, id);
                try (ResultSet rs = pstmt.executeQuery()) {
                    ResultSetMetaData metadata = rs.getMetaData();
                    if (rs.next()) {
                        Map<String, Object> contrato = new HashMap<>();
                        poblarContrato(contrato, rs, metadata);
                        ctx.json(contrato);
                    } else {
                        ctx.status(404).json("Contrato no encontrado");
                    }
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/cliente/{clienteId}
    public static void obtenerPorCliente(Context ctx) {
        int clienteId = Integer.parseInt(ctx.pathParam("clienteId"));

        try (Connection conn = DatabaseConnection.getConnection()) {
            String sql = "SELECT c.* FROM CONTRATO c WHERE c.IdCliente = ?";

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, clienteId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    ResultSetMetaData metadata = rs.getMetaData();
                    ArrayList<Map<String, Object>> contratos = new ArrayList<>();
                    while (rs.next()) {
                        Map<String, Object> contrato = new HashMap<>();
                        poblarContrato(contrato, rs, metadata);
                        contratos.add(contrato);
                    }
                    ctx.json(contratos);
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/contratos
    public static void crear(Context ctx) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            boolean conFolio = tieneColumna(conn, "CONTRATO", "Folio");
            boolean conMontoTotal = tieneColumna(conn, "CONTRATO", "MontoTotal");
            String sql = construirSqlInsert(conFolio, conMontoTotal);
            String folio = body.get("Folio") != null ? body.get("Folio").toString() : "C-" + System.currentTimeMillis();

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                if (conFolio && conMontoTotal) {
                    pstmt.setString(1, folio);
                    pstmt.setDate(2, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(3, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(4, body.get("TipoPago").toString());
                    pstmt.setBigDecimal(5, new java.math.BigDecimal(body.get("MontoTotal").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(8, Integer.parseInt(body.get("IdLote").toString()));
                } else if (conFolio) {
                    pstmt.setString(1, folio);
                    pstmt.setDate(2, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(3, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(4, body.get("TipoPago").toString());
                    pstmt.setInt(5, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdLote").toString()));
                } else if (conMontoTotal) {
                    pstmt.setDate(1, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(2, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(3, body.get("TipoPago").toString());
                    pstmt.setBigDecimal(4, new java.math.BigDecimal(body.get("MontoTotal").toString()));
                    pstmt.setInt(5, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdLote").toString()));
                } else {
                    pstmt.setDate(1, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(2, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(3, body.get("TipoPago").toString());
                    pstmt.setInt(4, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(5, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdLote").toString()));
                }

                pstmt.executeUpdate();
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Contrato creado con éxito");
                ctx.status(201).json(response);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/contratos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> body = ctx.bodyAsClass(Map.class);

        try (Connection conn = DatabaseConnection.getConnection()) {
            boolean conFolio = tieneColumna(conn, "CONTRATO", "Folio");
            boolean conMontoTotal = tieneColumna(conn, "CONTRATO", "MontoTotal");
            String sql = construirSqlUpdate(conFolio, conMontoTotal);

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                if (conFolio && conMontoTotal) {
                    pstmt.setString(1, body.get("Folio") != null ? body.get("Folio").toString() : "C-" + System.currentTimeMillis());
                    pstmt.setDate(2, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(3, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(4, body.get("TipoPago").toString());
                    pstmt.setBigDecimal(5, new java.math.BigDecimal(body.get("MontoTotal").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(8, Integer.parseInt(body.get("IdLote").toString()));
                    pstmt.setInt(9, id);
                } else if (conFolio) {
                    pstmt.setString(1, body.get("Folio") != null ? body.get("Folio").toString() : "C-" + System.currentTimeMillis());
                    pstmt.setDate(2, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(3, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(4, body.get("TipoPago").toString());
                    pstmt.setInt(5, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdLote").toString()));
                    pstmt.setInt(8, id);
                } else if (conMontoTotal) {
                    pstmt.setDate(1, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(2, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(3, body.get("TipoPago").toString());
                    pstmt.setBigDecimal(4, new java.math.BigDecimal(body.get("MontoTotal").toString()));
                    pstmt.setInt(5, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(7, Integer.parseInt(body.get("IdLote").toString()));
                    pstmt.setInt(8, id);
                } else {
                    pstmt.setDate(1, Date.valueOf(body.get("Fecha").toString()));
                    pstmt.setTime(2, Time.valueOf(body.get("Hora").toString()));
                    pstmt.setString(3, body.get("TipoPago").toString());
                    pstmt.setInt(4, Integer.parseInt(body.get("IdCliente").toString()));
                    pstmt.setInt(5, Integer.parseInt(body.get("IdEmpleado").toString()));
                    pstmt.setInt(6, Integer.parseInt(body.get("IdLote").toString()));
                    pstmt.setInt(7, id);
                }

                pstmt.executeUpdate();
                ctx.json("Contrato actualizado con éxito");
            }

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