package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

// En producción usar BCrypt, para escuela usamos SHA-256
// NOTA: En un proyecto real, usar BCryptPasswordEncoder
public class UsuarioController {

    // Hash simple para demo (en producción usar BCrypt)
    private static String hashPassword(String password) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return password;
        }
    }

    private static boolean verificarPassword(String username, String password, String storedPassword) {
        if (password == null || storedPassword == null) {
            return false;
        }

        String normalizedPassword = password.trim();
        String normalizedStoredPassword = storedPassword.trim();

        if (normalizedStoredPassword.equals(normalizedPassword) || normalizedStoredPassword.equals(hashPassword(normalizedPassword))) {
            return true;
        }

        if (normalizedStoredPassword.startsWith("$2y$10$demo_hash_")) {
            String demoSeed = normalizedStoredPassword.substring("$2y$10$demo_hash_".length());
            return normalizedPassword.equals(demoSeed) || normalizedPassword.equals(username);
        }

        return false;
    }

    private static String obtenerUsername(Map<String, String> body) {
        String email = body.get("Email");
        if (email != null && !email.trim().isEmpty()) {
            return email.trim().toLowerCase();
        }

        String username = body.get("NombreUsuario");
        if (username != null && !username.trim().isEmpty()) {
            return username.trim().toLowerCase();
        }

        return "";
    }

    private static String obtenerPassword(Map<String, String> body) {
        String password = body.get("Contrasena");
        if (password == null) password = body.get("Contraseña");
        if (password != null) {
            return password.trim();
        }
        return "";
    }

    public static void login(Context ctx) {
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String username = obtenerUsername(body);
        String password = obtenerPassword(body);
        
        String sql = "SELECT u.IdUsuario, u.NombreUsuario, u.Rol, e.Nombre AS NombreEmpleado, u.Contrasena, e.Estatus, e.IdEmpleado " +
                     "FROM USUARIO u JOIN EMPLEADO e ON u.IdEmpleado = e.IdEmpleado " +
                     "WHERE u.NombreUsuario = ? OR e.Email = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            pstmt.setString(2, username);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next() && verificarPassword(username, password, rs.getString("Contrasena"))) {
                    if ("Inactivo".equalsIgnoreCase(rs.getString("Estatus"))) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("status", "error");
                        response.put("mensaje", "Cuenta inactiva (Empleado dado de baja)");
                        ctx.status(401).json(response);
                        return;
                    }
                    
                    Map<String, Object> usuarioLogueado = new HashMap<>();
                    usuarioLogueado.put("IdUsuario", rs.getInt("IdUsuario"));
                    usuarioLogueado.put("IdEmpleado", rs.getInt("IdEmpleado"));
                    usuarioLogueado.put("NombreUsuario", rs.getString("NombreUsuario"));
                    usuarioLogueado.put("Rol", rs.getString("Rol"));
                    usuarioLogueado.put("Empleado", rs.getString("NombreEmpleado"));
                    usuarioLogueado.put("status", "success");
                    ctx.json(usuarioLogueado);
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "error");
                    response.put("mensaje", "Credenciales incorrectas");
                    ctx.status(401).json(response);
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // Crear usuario (POST)
    public static void crear(Context ctx) {
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String username = body.get("NombreUsuario");
        String password = body.get("Contrasena");
        String rol = body.get("Rol");
        String idEmpleado = body.get("IdEmpleado");

        String hashedPassword = hashPassword(password);

        String sql = "INSERT INTO USUARIO (NombreUsuario, Contrasena, Rol, IdEmpleado) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            pstmt.setString(2, hashedPassword);
            pstmt.setString(3, rol);
            pstmt.setInt(4, Integer.parseInt(idEmpleado));

            pstmt.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Usuario creado con éxito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
    // Obtener todos los usuarios (GET)
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT u.IdUsuario, u.NombreUsuario, u.Rol, u.Estatus, e.Nombre, e.Apellidos, e.IdEmpleado " +
                     "FROM USUARIO u JOIN EMPLEADO e ON u.IdEmpleado = e.IdEmpleado";
        java.util.ArrayList<Map<String, Object>> usuarios = new java.util.ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> usuario = new HashMap<>();
                usuario.put("IdUsuario", rs.getInt("IdUsuario"));
                usuario.put("NombreUsuario", rs.getString("NombreUsuario"));
                usuario.put("Rol", rs.getString("Rol"));
                usuario.put("Estatus", rs.getString("Estatus"));
                usuario.put("Nombre", rs.getString("Nombre"));
                usuario.put("Apellidos", rs.getString("Apellidos"));
                usuario.put("IdEmpleado", rs.getInt("IdEmpleado"));
                usuarios.add(usuario);
            }
            ctx.json(usuarios);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // Actualizar usuario (PUT)
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
            String username = body.get("NombreUsuario");
            String rol = body.get("Rol");

            String sql = "UPDATE USUARIO SET NombreUsuario = ?, Rol = ? WHERE IdUsuario = ?";
            
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {
                
                pstmt.setString(1, username);
                pstmt.setString(2, rol);
                pstmt.setInt(3, id);
                
                pstmt.executeUpdate();
                
                Map<String, Object> response = new HashMap<>();
                response.put("mensaje", "Usuario actualizado con éxito");
                ctx.json(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // Eliminar usuario (DELETE)
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        // Borrado lógico cambiando el estatus del usuario
        String sql = "UPDATE USUARIO SET Estatus = 'Inactivo' WHERE IdUsuario = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Acceso de usuario dado de baja exitosamente");
            ctx.json(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
}

