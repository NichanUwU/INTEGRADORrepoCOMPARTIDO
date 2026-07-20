package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class PagoController {

    private static boolean tieneColumna(Connection conn, String tabla, String columna) throws SQLException {
        try (ResultSet rs = conn.getMetaData().getColumns(null, null, tabla, columna)) {
            return rs.next();
        }
    }

    // GET /api/pagos
    public static void obtenerTodos(Context ctx) {
        ArrayList<Map<String, Object>> pagos = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection()) {
            boolean conFolio = tieneColumna(conn, "CONTRATO", "Folio");
            StringBuilder sql = new StringBuilder("SELECT p.*, cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos");
            if (conFolio) {
                sql.append(", c.Folio AS ContratoFolio");
            }
            sql.append(" FROM PAGO p JOIN CLIENTE cl ON p.IdCliente = cl.IdCliente JOIN CONTRATO c ON p.IdContrato = c.IdContrato");

            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql.toString())) {
                while (rs.next()) {
                    Map<String, Object> pago = new HashMap<>();
                    pago.put("IdPago", rs.getInt("IdPago"));
                    pago.put("Monto", rs.getBigDecimal("Monto"));
                    pago.put("FechaPago", rs.getDate("FechaPago"));
                    pago.put("FechaCompromiso", rs.getDate("FechaCompromiso"));
                    pago.put("MetodoPago", rs.getString("MetodoPago"));
                    pago.put("Referencia", rs.getString("Referencia"));
                    pago.put("Observaciones", rs.getString("Observaciones"));
                    pago.put("Estatus", rs.getString("Estatus"));
                    pago.put("Cliente", rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos"));
                    if (conFolio) {
                        pago.put("ContratoFolio", rs.getString("ContratoFolio"));
                    } else {
                        pago.put("ContratoFolio", "");
                    }
                    pagos.add(pago);
                }
                ctx.json(pagos);
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/pagos
    public static void crear(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String sql = "INSERT INTO PAGO (Monto, FechaPago, FechaCompromiso, MetodoPago, Referencia, Observaciones, Estatus, IdCliente, IdContrato) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setBigDecimal(1, new java.math.BigDecimal(body.get("Monto")));
            pstmt.setDate(2, Date.valueOf(body.get("FechaPago")));
            pstmt.setDate(3, Date.valueOf(body.get("FechaCompromiso")));
            pstmt.setString(4, body.get("MetodoPago"));
            pstmt.setString(5, body.get("Referencia"));
            pstmt.setString(6, body.get("Observaciones"));
            pstmt.setString(7, body.get("Estatus"));
            pstmt.setInt(8, Integer.parseInt(body.get("IdCliente")));
            pstmt.setInt(9, Integer.parseInt(body.get("IdContrato")));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pago registrado con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}