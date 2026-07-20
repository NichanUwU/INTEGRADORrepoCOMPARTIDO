package com.sofi.controllers;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SchemaAwareControllersTest {

    @Test
    void clienteInsertSqlExcludesEmailWhenColumnIsMissing() {
        assertEquals(
                "INSERT INTO CLIENTE (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, INE, CURP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ClienteController.construirSqlInsert(false)
        );
    }

    @Test
    void contratoInsertSqlExcludesFolioWhenColumnIsMissing() {
        assertEquals(
                "INSERT INTO CONTRATO (Fecha, Hora, TipoPago, MontoTotal, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?)",
                ContratoController.construirSqlInsert(false)
        );
    }
}
