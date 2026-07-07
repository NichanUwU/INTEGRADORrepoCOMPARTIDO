package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.Map;

public class UsuarioController {
    public static void login(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String username = body.get("NombreUsuario");
        String password = body.get("Contrasena");

        String sql = "SELECT u.IdUsuario, u.NombreUsuario, u.Rol, e.Nombre AS NombreEmpleado " +
                     "FROM USUARIO u JOIN EMPLEADO e ON u.IdEmpleado = e.IdEmpleado " +
                     "WHERE u.NombreUsuario = ? AND u.Contrasena = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            pstmt.setString(2, password); // En producción se usa hashing (BCrypt), pero directo sirve para tu entrega escolar

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> usuarioLogueado = Map.of(
                        "IdUsuario", rs.getInt("IdUsuario"),
                        "NombreUsuario", rs.getString("NombreUsuario"),
                        "Rol", rs.getString("Rol"),
                        "Empleado", rs.getString("NombreEmpleado"),
                        "status", "success"
                    );
                    ctx.json(usuarioLogueado);
                } else {
                    ctx.status(401).json(Map.of("status", "error", "mensaje", "Credenciales incorrectas"));
                }
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }
}
