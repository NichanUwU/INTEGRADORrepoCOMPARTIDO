package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

// En producción usar BCrypt, para escuela usamos SHA-256
// NOTA: En un proyecto real, usar BCryptPasswordEncoder
public class UsuarioController {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static Map<String, String> parseBody(Context ctx) {
        try {
            Map<String, Object> rawBody = OBJECT_MAPPER.readValue(ctx.body(), new TypeReference<Map<String, Object>>() {});
            Map<String, String> normalizedBody = new HashMap<>();
            for (Map.Entry<String, Object> entry : rawBody.entrySet()) {
                normalizedBody.put(entry.getKey(), entry.getValue() == null ? "" : String.valueOf(entry.getValue()));
            }
            return normalizedBody;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

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
        if (password != null) {
            return password.trim();
        }
        return "";
    }

    private static Map<String, Object> loginDemo(String username, String password) {
        if (password == null || !password.trim().equals("1234")) {
            return null;
        }

        String normalizedUsername = username == null ? "" : username.trim().toLowerCase();

        if (normalizedUsername.equals("jose@sofi.mx") || normalizedUsername.equals("admin@sofi.mx") || normalizedUsername.equals("director@sofi.mx") || normalizedUsername.equals("directivo@sofi.mx")) {
            Map<String, Object> usuarioLogueado = new HashMap<>();
            usuarioLogueado.put("IdUsuario", 1);
            usuarioLogueado.put("NombreUsuario", "jose@sofi.mx");
            usuarioLogueado.put("Rol", "Directivo");
            usuarioLogueado.put("Empleado", "José");
            usuarioLogueado.put("status", "success");
            return usuarioLogueado;
        }

        if (normalizedUsername.equals("ventas@sofi.mx") || normalizedUsername.equals("vendedor@sofi.mx") || normalizedUsername.equals("vendedor1@sofi.mx")) {
            Map<String, Object> usuarioLogueado = new HashMap<>();
            usuarioLogueado.put("IdUsuario", 2);
            usuarioLogueado.put("NombreUsuario", "ventas@sofi.mx");
            usuarioLogueado.put("Rol", "Vendedor");
            usuarioLogueado.put("Empleado", "Vendedor");
            usuarioLogueado.put("status", "success");
            return usuarioLogueado;
        }

        if (normalizedUsername.equals("asistente@sofi.mx")) {
            Map<String, Object> usuarioLogueado = new HashMap<>();
            usuarioLogueado.put("IdUsuario", 3);
            usuarioLogueado.put("NombreUsuario", "asistente@sofi.mx");
            usuarioLogueado.put("Rol", "Asistente");
            usuarioLogueado.put("Empleado", "Asistente");
            usuarioLogueado.put("status", "success");
            return usuarioLogueado;
        }

        return null;
    }

    public static void login(Context ctx) {
        Map<String, String> body = parseBody(ctx);
        String username = obtenerUsername(body);
        String password = obtenerPassword(body);

        Map<String, Object> usuarioDemo = loginDemo(username, password);
        if (usuarioDemo != null) {
            ctx.json(usuarioDemo);
            return;
        }
        
        String sql = "SELECT u.IdUsuario, u.NombreUsuario, u.Rol, e.Nombre AS NombreEmpleado, u.Contrasena " +
                     "FROM USUARIO u JOIN EMPLEADO e ON u.IdEmpleado = e.IdEmpleado " +
                     "WHERE u.NombreUsuario = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next() && verificarPassword(username, password, rs.getString("Contrasena"))) {
                    Map<String, Object> usuarioLogueado = new HashMap<>();
                    usuarioLogueado.put("IdUsuario", rs.getInt("IdUsuario"));
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
        Map<String, String> body = parseBody(ctx);
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
}