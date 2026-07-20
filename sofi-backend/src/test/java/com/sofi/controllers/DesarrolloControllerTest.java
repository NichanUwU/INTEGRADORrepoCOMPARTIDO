package com.sofi.controllers;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DesarrolloControllerTest {

    @Test
    public void deberiaConstruirInsertSinDescripcionCuandoLaColumnaNoExiste() {
        String sql = DesarrolloController.construirSqlInsert(true);
        assertEquals("INSERT INTO DESARROLLO (Nombre, Ubicacion, Descripcion, Estatus, Fecha_inicio) VALUES (?, ?, ?, ?, ?)", sql);
    }
}
