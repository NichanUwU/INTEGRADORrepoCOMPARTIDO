CREATE DATABASE IF NOT EXISTS sofi_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE sofi_db;

CREATE TABLE DESARROLLO (
    IdDesarrollo INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Ubicacion VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    Estatus ENUM('Activo', 'Preventa', 'Cerrado') DEFAULT 'Activo',
    Fecha_inicio DATE,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estatus (Estatus),
    INDEX idx_fecha_inicio (Fecha_inicio)
) ENGINE=InnoDB;

CREATE TABLE MANZANA (
    IdManzana INT AUTO_INCREMENT PRIMARY KEY,
    Numero INT NOT NULL,
    Calles_Colindantes VARCHAR(255),
    IdDesarrollo INT NOT NULL,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_manzana_desarrollo 
        FOREIGN KEY (IdDesarrollo) REFERENCES DESARROLLO(IdDesarrollo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_desarrollo (IdDesarrollo),
    INDEX idx_numero (Numero)
) ENGINE=InnoDB;

CREATE TABLE LOTE (
    IdLote INT AUTO_INCREMENT PRIMARY KEY,
    Numero VARCHAR(20) NOT NULL,
    Medidas VARCHAR(50) NOT NULL,
    Precio DECIMAL(12, 2) NOT NULL CHECK (Precio >= 0),
    Estado ENUM('Disponible', 'Reservado', 'Vendido', 'Apartado') DEFAULT 'Disponible',
    IdManzana INT NOT NULL,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lote_manzana 
        FOREIGN KEY (IdManzana) REFERENCES MANZANA(IdManzana)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_estado (Estado),
    INDEX idx_precio (Precio),
    INDEX idx_manzana (IdManzana)
) ENGINE=InnoDB;

CREATE TABLE COLINDANCIA (
    IdColindancia INT AUTO_INCREMENT PRIMARY KEY,
    Norte VARCHAR(255),
    Sur VARCHAR(255),
    Este VARCHAR(255),
    Oeste VARCHAR(255),
    IdLote INT NOT NULL UNIQUE,
    CONSTRAINT fk_colindancia_lote 
        FOREIGN KEY (IdLote) REFERENCES LOTE(IdLote)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CLIENTE (
    IdCliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Direccion VARCHAR(255) NOT NULL,
    Casa_Apartamento VARCHAR(50),
    Codigo_Postal VARCHAR(10) NOT NULL,
    Ciudad VARCHAR(100) NOT NULL,
    Estado VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Email VARCHAR(150),
    INE VARCHAR(50) NOT NULL UNIQUE,
    CURP VARCHAR(50) NOT NULL UNIQUE,
    Estatus ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_apellidos (Apellidos),
    INDEX idx_ciudad (Ciudad),
    INDEX idx_estatus (Estatus),
    INDEX idx_email (Email)
) ENGINE=InnoDB;

CREATE TABLE TESTIGO (
    IdTestigo INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Direccion VARCHAR(255),
    Casa_Apartamento VARCHAR(50),
    Codigo_Postal VARCHAR(10),
    Ciudad VARCHAR(100),
    Estado VARCHAR(100),
    Telefono VARCHAR(20),
    Relacion VARCHAR(50) NOT NULL,
    IdCliente INT NOT NULL,
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_testigo_cliente 
        FOREIGN KEY (IdCliente) REFERENCES CLIENTE(IdCliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cliente (IdCliente),
    INDEX idx_apellidos (Apellidos)
) ENGINE=InnoDB;

CREATE TABLE EMPLEADO (
    IdEmpleado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Direccion VARCHAR(255),
    Casa_Apartamento VARCHAR(50),
    Codigo_Postal VARCHAR(10),
    Ciudad VARCHAR(100),
    Estado VARCHAR(100),
    Telefono VARCHAR(20),
    Email VARCHAR(150) NOT NULL UNIQUE,
    Cargo VARCHAR(50) NOT NULL,
    Fecha_contratacion DATE,
    Estatus ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_apellidos (Apellidos),
    INDEX idx_email (Email),
    INDEX idx_estatus (Estatus)
) ENGINE=InnoDB;

CREATE TABLE USUARIO (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    NombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
    Rol ENUM('Directivo', 'Vendedor', 'Asistente') NOT NULL,
    IdEmpleado INT NOT NULL UNIQUE,
    Estatus ENUM('Activo', 'Inactivo', 'Bloqueado') DEFAULT 'Activo',
    Ultimo_acceso DATETIME,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_empleado 
        FOREIGN KEY (IdEmpleado) REFERENCES EMPLEADO(IdEmpleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_username (NombreUsuario),
    INDEX idx_rol (Rol),
    INDEX idx_estatus (Estatus)
) ENGINE=InnoDB;

CREATE TABLE CONTRATO (
    IdContrato INT AUTO_INCREMENT PRIMARY KEY,
    Folio VARCHAR(20) NOT NULL UNIQUE,
    Fecha DATE NOT NULL,
    Hora TIME NOT NULL,
    TipoPago ENUM('Contado', 'Parcial', 'Financiamiento') NOT NULL,
    MontoTotal DECIMAL(12, 2) NOT NULL CHECK (MontoTotal >= 0),
    Enganche DECIMAL(12, 2) DEFAULT 0,
    PlazoMeses INT DEFAULT 0,
    TasaInteres DECIMAL(5, 2) DEFAULT 0,
    Mensualidad DECIMAL(12, 2) DEFAULT 0,
    PagosRealizados INT DEFAULT 0,
    ProximoPago DATE,
    Estatus ENUM('Activo', 'Vencido', 'Liquidado', 'Cancelado') DEFAULT 'Activo',
    IdCliente INT NOT NULL,
    IdEmpleado INT NOT NULL,
    IdLote INT NOT NULL UNIQUE,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_contrato_cliente 
        FOREIGN KEY (IdCliente) REFERENCES CLIENTE(IdCliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_contrato_empleado 
        FOREIGN KEY (IdEmpleado) REFERENCES EMPLEADO(IdEmpleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_contrato_lote 
        FOREIGN KEY (IdLote) REFERENCES LOTE(IdLote)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_folio (Folio),
    INDEX idx_fecha (Fecha),
    INDEX idx_cliente (IdCliente),
    INDEX idx_estatus (Estatus)
) ENGINE=InnoDB;

CREATE TABLE PAGO (
    IdPago INT AUTO_INCREMENT PRIMARY KEY,
    Monto DECIMAL(12, 2) NOT NULL CHECK (Monto > 0),
    FechaPago DATE NOT NULL,
    FechaCompromiso DATE NOT NULL,
    MetodoPago ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Cheque') DEFAULT 'Efectivo',
    Referencia VARCHAR(100),
    Observaciones TEXT,
    Estatus ENUM('Pagado', 'Pendiente', 'Atrasado', 'Cancelado') DEFAULT 'Pendiente',
    IdCliente INT NOT NULL,
    IdContrato INT NOT NULL,
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_cliente 
        FOREIGN KEY (IdCliente) REFERENCES CLIENTE(IdCliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pago_contrato 
        FOREIGN KEY (IdContrato) REFERENCES CONTRATO(IdContrato)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_fecha_pago (FechaPago),
    INDEX idx_estatus (Estatus),
    INDEX idx_contrato (IdContrato)
) ENGINE=InnoDB;

CREATE TABLE BITACORA (
    IdBitacora INT AUTO_INCREMENT PRIMARY KEY,
    Usuario VARCHAR(50) NOT NULL,
    Accion VARCHAR(100) NOT NULL,
    Tabla VARCHAR(50) NOT NULL,
    RegistroId INT,
    Datos_anteriores JSON,
    Datos_nuevos JSON,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (Usuario),
    INDEX idx_fecha (Fecha),
    INDEX idx_tabla (Tabla)
) ENGINE=InnoDB;

INSERT INTO DESARROLLO (Nombre, Ubicacion, Descripcion, Estatus, Fecha_inicio) VALUES
('Las Palmas Residencial', 'Querétaro, Qro.', 'Desarrollo residencial con áreas verdes y seguridad 24/7.', 'Activo', '2025-01-15'),
('Vista del Lago', 'Guadalajara, Jal.', 'Vistas privilegiadas al lago, cerca del centro.', 'Activo', '2025-02-20'),
('El Encino', 'CDMX', 'Zona boscosa en las afueras de la CDMX.', 'Activo', '2025-03-01'),
('Bosques Norte', 'León, Gto.', 'Zona arbolada al norte de León.', 'Activo', '2025-04-10'),
('Hacienda San José', 'Monterrey, NL', 'Nuevo desarrollo en preventa.', 'Preventa', '2025-05-01'),
('Jardines del Sur', 'Puebla, Pue.', 'Proyecto 100% vendido.', 'Cerrado', '2024-11-01');

INSERT INTO MANZANA (Numero, Calles_Colindantes, IdDesarrollo) VALUES
(1, 'Calle Principal y Calle Secundaria', 1),
(2, 'Calle del Bosque y Calle del Lago', 1),
(1, 'Calle del Lago y Calle Principal', 2),
(1, 'Calle del Encino', 3),
(1, 'Calle de los Pinos', 4),
(1, 'Calle Hacienda', 5),
(1, 'Calle del Sur', 6);

INSERT INTO LOTE (Numero, Medidas, Precio, Estado, IdManzana) VALUES
('A-01', '120 m²', 380000.00, 'Disponible', 1),
('A-02', '135 m²', 420000.00, 'Vendido', 1),
('A-03', '110 m²', 355000.00, 'Vendido', 1),
('B-01', '98 m²', 295000.00, 'Reservado', 2),
('B-02', '105 m²', 320000.00, 'Disponible', 2),
('C-01', '200 m²', 680000.00, 'Disponible', 3),
('D-01', '150 m²', 510000.00, 'Disponible', 4),
('D-02', '140 m²', 480000.00, 'Vendido', 4),
('E-01', '180 m²', 650000.00, 'Disponible', 5),
('F-01', '95 m²', 280000.00, 'Vendido', 6),
('G-01', '85 m²', 250000.00, 'Disponible', 7);

INSERT INTO COLINDANCIA (Norte, Sur, Este, Oeste, IdLote) VALUES
('Calle Principal', 'Lote A-02', 'Área Verde', 'Calle Secundaria', 1),
('Lote A-01', 'Calle Principal', 'Lote A-03', 'Área Verde', 2),
('Lote A-02', 'Calle Principal', 'Lote A-04', 'Calle Secundaria', 3),
('Calle del Lago', 'Lote B-02', 'Área Común', 'Calle Principal', 4),
('Lote B-01', 'Calle del Lago', 'Área Común', 'Calle Principal', 5),
('Calle del Encino', 'Lote C-02', 'Área Verde', 'Calle Secundaria', 6);

INSERT INTO CLIENTE (Nombre, Apellidos, Direccion, Casa_Apartamento, Codigo_Postal, Ciudad, Estado, Telefono, Email, INE, CURP) VALUES
('Juan', 'Hernández López', 'Av. Tecnológico 120', 'Casa 12', '76000', 'Querétaro', 'Querétaro', '442-100-2000', 'juan@email.com', 'HELJ801234AB1', 'HELJ801234HQRNPN03'),
('María', 'García Torres', 'Calle Loma 45', '', '44100', 'Guadalajara', 'Jalisco', '33-9000-1234', 'maria@email.com', 'GATM920315CD2', 'GATM920315MDFRRN05'),
('Roberto', 'Domínguez Sánchez', 'Av. Reforma 234', 'Apto 3B', '06600', 'CDMX', 'Ciudad de México', '55-4000-5678', 'roberto@email.com', 'DORR780501EF3', 'DORR780501HDFSNN06'),
('Ana', 'Pérez Villanueva', 'Blvd. Constitución 567', '', '64000', 'Monterrey', 'Nuevo León', '81-2345-6789', 'ana@email.com', 'PEVA850922GH4', 'PEVA850922MDFRRN08'),
('Luis', 'Sánchez Mora', 'Calle 5 de Mayo 89', '', '72000', 'Puebla', 'Puebla', '222-100-3456', 'luis@email.com', 'SAML940710IJ5', 'SAML940710HDFRNN09');

INSERT INTO TESTIGO (Nombre, Apellidos, Direccion, Telefono, Relacion, IdCliente) VALUES
('Laura', 'Hernández', 'Av. Tecnológico 120', '442-100-2001', 'Cónyuge', 1),
('Carlos', 'Medina', 'Blvd. Bernardo 45', '442-100-2002', 'Amigo', 1);

INSERT INTO EMPLEADO (Nombre, Apellidos, Email, Cargo, Fecha_contratacion) VALUES
('Dir.', 'González', 'gonzalez@sofi.mx', 'Director', '2024-01-01'),
('M.', 'Rodríguez', 'rodriguez@sofi.mx', 'Vendedor', '2024-01-15'),
('L.', 'García', 'garcia@sofi.mx', 'Vendedor', '2024-02-01'),
('A.', 'Pérez', 'aperez@sofi.mx', 'Asistente', '2024-03-01');

INSERT INTO USUARIO (NombreUsuario, Contrasena, Rol, IdEmpleado) VALUES
('director', '$2y$10$demo_hash_director', 'Directivo', 1),
('vendedor1', '$2y$10$demo_hash_vendedor1', 'Vendedor', 2),
('vendedor2', '$2y$10$demo_hash_vendedor2', 'Vendedor', 3),
('asistente', '$2y$10$demo_hash_asistente', 'Asistente', 4);

INSERT INTO CONTRATO (Folio, Fecha, Hora, TipoPago, MontoTotal, Enganche, PlazoMeses, Mensualidad, Estatus, IdCliente, IdEmpleado, IdLote) VALUES
('CON-0051', '2025-01-12', '10:30:00', 'Financiamiento', 380000.00, 76000.00, 36, 10556.00, 'Activo', 1, 2, 2),
('CON-0052', '2025-02-18', '14:00:00', 'Contado', 295000.00, 295000.00, 0, 0, 'Activo', 2, 3, 4),
('CON-0053', '2025-03-05', '11:15:00', 'Financiamiento', 680000.00, 136000.00, 48, 14167.00, 'Atrasado', 3, 2, 6),
('CON-0054', '2025-04-22', '09:45:00', 'Parcial', 420000.00, 84000.00, 36, 11667.00, 'Activo', 4, 3, 3),
('CON-0055', '2025-05-01', '16:20:00', 'Contado', 510000.00, 510000.00, 0, 0, 'Liquidado', 5, 2, 8);

INSERT INTO PAGO (Monto, FechaPago, FechaCompromiso, MetodoPago, Estatus, IdCliente, IdContrato) VALUES
(10556.00, '2025-06-12', '2025-06-12', 'Transferencia', 'Pagado', 1, 1),
(10556.00, '2025-07-12', '2025-07-12', 'Efectivo', 'Pagado', 1, 1),
(14167.00, '2025-06-05', '2025-06-05', 'Transferencia', 'Atrasado', 3, 3),
(11667.00, '2025-05-22', '2025-05-22', 'Tarjeta', 'Pagado', 4, 4);