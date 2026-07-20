USE sofi_db;

ALTER TABLE EMPLEADO ADD COLUMN Estatus ENUM('Activo', 'Inactivo') DEFAULT 'Activo';
ALTER TABLE USUARIO ADD COLUMN Estatus ENUM('Activo', 'Inactivo', 'Bloqueado') DEFAULT 'Activo';
