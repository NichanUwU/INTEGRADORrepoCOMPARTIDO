package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ContratoController {
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT c.IdContrato, c.Fecha, cl.Nombre AS Cliente, e.Nombre AS Vendedor, l.Numero AS NumeroLote " +
                     "FROM CONTRATO c " +
                     "JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente " +
                     "JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado " +
                     "JOIN LOTE l ON c.IdLote = l.IdLote";
        
        ArrayList<Map<String, Object>> contratos = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> c = new HashMap<>();
                c.put("IdContrato", rs.getInt("IdContrato"));
                c.put("Fecha", rs.getDate("Fecha").toString());
                c.put("Cliente", rs.getString("Cliente"));
                c.put("Vendedor", rs.getString("Vendedor"));
                c.put("Lote", rs.getInt("NumeroLote"));
                contratos.add(c);
            }
            ctx.json(contratos);
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
