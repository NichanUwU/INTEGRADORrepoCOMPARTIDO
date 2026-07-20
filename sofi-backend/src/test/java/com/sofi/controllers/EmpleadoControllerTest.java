package com.sofi.controllers;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class EmpleadoControllerTest {

    @Test
    public void deberiaRetornarEmpleadosFallbackCuandoLaBaseDeDatosNoEsteDisponible() {
        List<Map<String, Object>> empleados = EmpleadoController.obtenerEmpleadosFallback();

        assertNotNull(empleados);
        assertFalse(empleados.isEmpty());
        assertEquals(4, empleados.size());
        assertEquals("Director", empleados.get(0).get("Cargo"));
        assertEquals("gonzalez@sofi.mx", empleados.get(0).get("Email"));
    }
}
