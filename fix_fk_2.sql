USE sofi_db;

-- CREDITO_CLIENTE -> CONTRATO
ALTER TABLE credito_cliente DROP FOREIGN KEY fk_credito_contrato;
ALTER TABLE credito_cliente ADD CONSTRAINT fk_credito_contrato 
    FOREIGN KEY (IdContrato) REFERENCES contrato(IdContrato) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PAGO -> CONTRATO
ALTER TABLE pago DROP FOREIGN KEY fk_pago_contrato;
ALTER TABLE pago ADD CONSTRAINT fk_pago_contrato 
    FOREIGN KEY (IdContrato) REFERENCES contrato(IdContrato) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PAGO -> CREDITO (si existe)
ALTER TABLE pago DROP FOREIGN KEY fk_pago_credito;
ALTER TABLE pago ADD CONSTRAINT fk_pago_credito 
    FOREIGN KEY (IdCredito) REFERENCES credito_cliente(IdCredito) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CONTRATO -> LOTE (en caso de que quieran eliminar el lote y que borre el contrato)
-- Dependiendo del negocio, usualmente es restrict, pero si están en etapa de pruebas, cascada ayuda.
ALTER TABLE contrato DROP FOREIGN KEY fk_contrato_lote;
ALTER TABLE contrato ADD CONSTRAINT fk_contrato_lote 
    FOREIGN KEY (IdLote) REFERENCES lote(IdLote) 
    ON DELETE CASCADE ON UPDATE CASCADE;
