package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class EmpleadoController {

    // GET /api/empleados
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT * FROM EMPLEADO";
        ArrayList<Map<String, Object>> empleados = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> empleado = new HashMap<>();
                empleado.put("IdEmpleado", rs.getInt("IdEmpleado"));
                empleado.put("Nombre", rs.getString("Nombre"));
                empleado.put("Apellidos", rs.getString("Apellidos"));
                empleado.put("Email", rs.getString("Email"));
                empleado.put("Cargo", rs.getString("Cargo"));
                empleado.put("Estatus", rs.getString("Estatus"));
                empleados.add(empleado);
            }
            ctx.json(empleados);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}