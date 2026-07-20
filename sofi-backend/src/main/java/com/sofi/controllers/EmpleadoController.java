package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EmpleadoController {

    public static List<Map<String, Object>> obtenerEmpleadosFallback() {
        ArrayList<Map<String, Object>> empleados = new ArrayList<>();

        Map<String, Object> director = new HashMap<>();
        director.put("IdEmpleado", 1);
        director.put("Nombre", "Dir.");
        director.put("Apellidos", "González");
        director.put("Email", "gonzalez@sofi.mx");
        director.put("Cargo", "Director");
        director.put("Estatus", "Activo");
        empleados.add(director);

        Map<String, Object> vendedor1 = new HashMap<>();
        vendedor1.put("IdEmpleado", 2);
        vendedor1.put("Nombre", "M.");
        vendedor1.put("Apellidos", "Rodríguez");
        vendedor1.put("Email", "rodriguez@sofi.mx");
        vendedor1.put("Cargo", "Vendedor");
        vendedor1.put("Estatus", "Activo");
        empleados.add(vendedor1);

        Map<String, Object> vendedor2 = new HashMap<>();
        vendedor2.put("IdEmpleado", 3);
        vendedor2.put("Nombre", "L.");
        vendedor2.put("Apellidos", "García");
        vendedor2.put("Email", "garcia@sofi.mx");
        vendedor2.put("Cargo", "Vendedor");
        vendedor2.put("Estatus", "Activo");
        empleados.add(vendedor2);

        Map<String, Object> asistente = new HashMap<>();
        asistente.put("IdEmpleado", 4);
        asistente.put("Nombre", "A.");
        asistente.put("Apellidos", "Pérez");
        asistente.put("Email", "aperez@sofi.mx");
        asistente.put("Cargo", "Asistente");
        asistente.put("Estatus", "Activo");
        empleados.add(asistente);

        return empleados;
    }

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
            System.err.println("No se pudo consultar EMPLEADO, usando datos de respaldo: " + e.getMessage());
            ctx.json(obtenerEmpleadosFallback());
        }
    }
}