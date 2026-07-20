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
                empleado.put("Direccion", rs.getString("Direccion"));
                empleado.put("Casa_Apartamento", rs.getString("Casa_Apartamento"));
                empleado.put("Codigo_Postal", rs.getString("Codigo_Postal"));
                empleado.put("Ciudad", rs.getString("Ciudad"));
                empleado.put("Estado", rs.getString("Estado"));
                empleado.put("Telefono", rs.getString("Telefono"));
                empleados.add(empleado);
            }
            ctx.json(empleados);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/empleados
    public static void crear(Context ctx) {
        try {
            Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class);
            Map<String, String> body = new java.util.HashMap<>();
            if (bodyObj != null) {
                for (Map.Entry<String, Object> e : bodyObj.entrySet()) {
                    if (e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue()));
                }
            }
            String nombre = body.get("Nombre");
            String apellidos = body.get("Apellidos");
            String email = body.get("Email");
            String cargo = body.get("Cargo");
            String direccion = body.get("Direccion");
            String casa = body.get("Casa_Apartamento");
            String cp = body.get("Codigo_Postal");
            String ciudad = body.get("Ciudad");
            String estado = body.get("Estado");
            String telefono = body.get("Telefono");

            String sql = "INSERT INTO EMPLEADO (Nombre, Apellidos, Email, Cargo, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, Estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')";
            
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                
                pstmt.setString(1, nombre);
                pstmt.setString(2, apellidos);
                pstmt.setString(3, email);
                pstmt.setString(4, cargo);
                pstmt.setString(5, direccion);
                pstmt.setString(6, casa);
                pstmt.setString(7, cp);
                pstmt.setString(8, ciudad);
                pstmt.setString(9, estado);
                pstmt.setString(10, telefono);
                
                pstmt.executeUpdate();
                
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("IdEmpleado", rs.getInt(1));
                        response.put("mensaje", "Empleado creado con éxito");
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

    // PUT /api/empleados/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        try {
            Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class);
            Map<String, String> body = new java.util.HashMap<>();
            if (bodyObj != null) {
                for (Map.Entry<String, Object> e : bodyObj.entrySet()) {
                    if (e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue()));
                }
            }
            String nombre = body.get("Nombre");
            String apellidos = body.get("Apellidos");
            String email = body.get("Email");
            String cargo = body.get("Cargo");
            String direccion = body.get("Direccion");
            String casa = body.get("Casa_Apartamento");
            String cp = body.get("Codigo_Postal");
            String ciudad = body.get("Ciudad");
            String estado = body.get("Estado");
            String telefono = body.get("Telefono");
            String estatus = body.get("Estatus");
            
            String sql = "UPDATE EMPLEADO SET Nombre = ?, Apellidos = ?, Email = ?, Cargo = ?, Direccion = ?, Casa_Apartamento = ?, Codigo_Postal = ?, Ciudad = ?, Estado = ?, Telefono = ?, Estatus = ? WHERE IdEmpleado = ?";
            
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {
                
                pstmt.setString(1, nombre);
                pstmt.setString(2, apellidos);
                pstmt.setString(3, email);
                pstmt.setString(4, cargo);
                pstmt.setString(5, direccion);
                pstmt.setString(6, casa);
                pstmt.setString(7, cp);
                pstmt.setString(8, ciudad);
                pstmt.setString(9, estado);
                pstmt.setString(10, telefono);
                pstmt.setString(11, estatus);
                pstmt.setInt(12, id);
                
                pstmt.executeUpdate();
                
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Empleado actualizado con éxito");
                ctx.json(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/empleados/{id} (Soft Delete)
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "UPDATE EMPLEADO SET Estatus = 'Inactivo' WHERE IdEmpleado = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Empleado dado de baja exitosamente");
            ctx.json(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}
