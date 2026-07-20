package com.sofi.controllers;

import io.javalin.http.Context;
import com.sofi.database.DatabaseConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.io.*;
import java.util.zip.*;
import java.util.regex.*;
import java.math.BigDecimal;

public class ContratoController {

    // GET /api/contratos
    public static void obtenerTodos(Context ctx) {
        String sql = "SELECT c.IdContrato, c.Folio, c.Fecha, c.Hora, c.TipoPago, c.MontoTotal, c.Estatus, c.IdEmpleado, " +
                     "cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, " +
                     "e.Nombre AS VendedorNombre, " +
                     "l.Numero AS LoteNumero, d.Nombre AS DesarrolloNombre " +
                     "FROM CONTRATO c " +
                     "JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente " +
                     "JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado " +
                     "JOIN LOTE l ON c.IdLote = l.IdLote " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo";

        ArrayList<Map<String, Object>> contratos = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> c = new HashMap<>();
                c.put("IdContrato", rs.getInt("IdContrato"));
                c.put("Folio", rs.getString("Folio"));
                c.put("Fecha", rs.getDate("Fecha").toString());
                c.put("Hora", rs.getTime("Hora").toString());
                c.put("TipoPago", rs.getString("TipoPago"));
                c.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
                c.put("Estatus", rs.getString("Estatus"));
                c.put("IdEmpleado", rs.getInt("IdEmpleado"));
                c.put("Cliente", rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos"));
                c.put("Vendedor", rs.getString("VendedorNombre"));
                c.put("Lote", rs.getString("LoteNumero"));
                c.put("Desarrollo", rs.getString("DesarrolloNombre"));
                contratos.add(c);
            }
            ctx.json(contratos);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/cliente/{clienteId}
    public static void obtenerPorCliente(Context ctx) {
        int clienteId = Integer.parseInt(ctx.pathParam("clienteId"));
        String sql = "SELECT * FROM CONTRATO WHERE IdCliente = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, clienteId);
            try (ResultSet rs = pstmt.executeQuery()) {
                ArrayList<Map<String, Object>> contratos = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> c = new HashMap<>();
                    c.put("IdContrato", rs.getInt("IdContrato"));
                    c.put("Folio", rs.getString("Folio"));
                    c.put("Fecha", rs.getDate("Fecha").toString());
                    c.put("Hora", rs.getTime("Hora").toString());
                    c.put("TipoPago", rs.getString("TipoPago"));
                    c.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
                    c.put("Estatus", rs.getString("Estatus"));
                    c.put("IdCliente", rs.getInt("IdCliente"));
                    c.put("IdEmpleado", rs.getInt("IdEmpleado"));
                    c.put("IdLote", rs.getInt("IdLote"));
                    contratos.add(c);
                }
                ctx.json(contratos);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // POST /api/contratos
    public static void crear(Context ctx) {
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "INSERT INTO CONTRATO (Folio, Fecha, Hora, TipoPago, MontoTotal, Enganche, PlazoMeses, Mensualidad, IdCliente, IdEmpleado, IdLote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, body.get("Folio"));
            pstmt.setDate(2, Date.valueOf(body.get("Fecha")));
            pstmt.setTime(3, Time.valueOf(body.get("Hora") + ":00"));
            pstmt.setString(4, body.get("TipoPago"));
            pstmt.setBigDecimal(5, new java.math.BigDecimal(body.get("MontoTotal")));
            pstmt.setBigDecimal(6, body.get("Enganche") != null ? new java.math.BigDecimal(body.get("Enganche")) : new java.math.BigDecimal("0"));
            pstmt.setInt(7, body.get("PlazoMeses") != null ? Integer.parseInt(body.get("PlazoMeses")) : 0);
            pstmt.setBigDecimal(8, body.get("Mensualidad") != null ? new java.math.BigDecimal(body.get("Mensualidad")) : new java.math.BigDecimal("0"));
            pstmt.setInt(9, Integer.parseInt(body.get("IdCliente")));
            pstmt.setInt(10, Integer.parseInt(body.get("IdEmpleado")));
            pstmt.setInt(11, Integer.parseInt(body.get("IdLote")));

            pstmt.executeUpdate();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Contrato creado con ÃƒÂ©xito");
            ctx.status(201).json(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // PUT /api/contratos/{id}
    public static void actualizar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        Map<String, Object> bodyObj = ctx.bodyAsClass(Map.class); Map<String, String> body = new java.util.HashMap<>(); if(bodyObj != null) { for(Map.Entry<String, Object> e : bodyObj.entrySet()) { if(e.getValue() != null) body.put(e.getKey(), String.valueOf(e.getValue())); } }
        String sql = "UPDATE CONTRATO SET Fecha=?, Hora=?, TipoPago=?, MontoTotal=?, Estatus=?, IdCliente=?, IdEmpleado=?, IdLote=?, Enganche=?, PlazoMeses=?, Mensualidad=? WHERE IdContrato=?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, Date.valueOf(body.get("Fecha")));
            pstmt.setTime(2, Time.valueOf(body.get("Hora") + ":00"));
            pstmt.setString(3, body.get("TipoPago"));
            pstmt.setBigDecimal(4, new java.math.BigDecimal(body.get("MontoTotal")));
            pstmt.setString(5, body.get("Estatus") != null ? body.get("Estatus") : "Activo");
            pstmt.setInt(6, Integer.parseInt(body.get("IdCliente")));
            pstmt.setInt(7, Integer.parseInt(body.get("IdEmpleado")));
            pstmt.setInt(8, Integer.parseInt(body.get("IdLote")));
            pstmt.setBigDecimal(9, body.get("Enganche") != null ? new java.math.BigDecimal(body.get("Enganche")) : new java.math.BigDecimal("0"));
            pstmt.setInt(10, body.get("PlazoMeses") != null ? Integer.parseInt(body.get("PlazoMeses")) : 0);
            pstmt.setBigDecimal(11, body.get("Mensualidad") != null ? new java.math.BigDecimal(body.get("Mensualidad")) : new java.math.BigDecimal("0"));
            pstmt.setInt(12, id);

            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Contrato actualizado con ÃƒÂ©xito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // DELETE /api/contratos/{id}
    public static void eliminar(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "DELETE FROM CONTRATO WHERE IdContrato = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Contrato eliminado con ÃƒÂ©xito");
            ctx.json(resp);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/{id}
    public static void obtenerPorId(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String sql = "SELECT * FROM CONTRATO WHERE IdContrato = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> c = new HashMap<>();
                    c.put("IdContrato", rs.getInt("IdContrato"));
                    c.put("Folio", rs.getString("Folio"));
                    c.put("Fecha", rs.getDate("Fecha").toString());
                    
                    Time horaVal = rs.getTime("Hora");
                    c.put("Hora", horaVal != null ? horaVal.toString().substring(0, 5) : "00:00");
                    
                    c.put("TipoPago", rs.getString("TipoPago"));
                    c.put("MontoTotal", rs.getBigDecimal("MontoTotal"));
                    c.put("Enganche", rs.getBigDecimal("Enganche"));
                    c.put("PlazoMeses", rs.getInt("PlazoMeses"));
                    c.put("Mensualidad", rs.getBigDecimal("Mensualidad"));
                    c.put("Estatus", rs.getString("Estatus"));
                    c.put("IdCliente", rs.getInt("IdCliente"));
                    c.put("IdEmpleado", rs.getInt("IdEmpleado"));
                    c.put("IdLote", rs.getInt("IdLote"));
                    ctx.json(c);
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("error", "Contrato no encontrado");
                    ctx.status(404).json(resp);
                }
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }

    // GET /api/contratos/{id}/generar
    public static void generarDocumento(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        
        String sql = "SELECT c.*, cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, " +
                     "e.Nombre AS VendedorNombre, e.Apellidos AS VendedorApellidos, " +
                     "l.Numero AS LoteNumero, l.Precio AS LotePrecio, l.Medidas AS LoteMedidas, " +
                     "m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre, " +
                     "co.Norte AS ColNorte, co.Sur AS ColSur, co.Este AS ColEste, co.Oeste AS ColOeste " +
                     "FROM CONTRATO c " +
                     "JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente " +
                     "JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado " +
                     "JOIN LOTE l ON c.IdLote = l.IdLote " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo " +
                     "LEFT JOIN COLINDANCIA co ON l.IdLote = co.IdLote " +
                     "WHERE c.IdContrato = ?";
                     
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String clienteNombreCompleto = rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos");
                    String loteNumero = rs.getString("LoteNumero");
                    BigDecimal lotePrecio = rs.getBigDecimal("MontoTotal");
                    String loteMedidasStr = rs.getString("LoteMedidas");
                    String manzanaNumero = rs.getString("ManzanaNumero");
                    String contratoFecha = rs.getDate("Fecha").toString();
                    Time horaVal = rs.getTime("Hora");
                    String contratoHora = horaVal != null ? horaVal.toString().substring(0, 5) : "00:00";
                    
                    String colNorte = rs.getString("ColNorte") != null ? rs.getString("ColNorte") : "Lote Colindante";
                    String colSur = rs.getString("ColSur") != null ? rs.getString("ColSur") : "Lote Colindante";
                    String colEste = rs.getString("ColEste") != null ? rs.getString("ColEste") : "Lote Colindante";
                    String colOeste = rs.getString("ColOeste") != null ? rs.getString("ColOeste") : "Lote Colindante";
                    
                    BigDecimal enganche = rs.getBigDecimal("Enganche") != null ? rs.getBigDecimal("Enganche") : BigDecimal.ZERO;
                    int plazoMeses = rs.getInt("PlazoMeses");
                    
                    int semanas = plazoMeses * 4;
                    BigDecimal pagoSemanal = BigDecimal.ZERO;
                    if (semanas > 0) {
                        BigDecimal totalFinanciado = lotePrecio.subtract(enganche);
                        pagoSemanal = totalFinanciado.divide(BigDecimal.valueOf(semanas), 2, BigDecimal.ROUND_HALF_UP);
                    }
                    
                    int idCliente = rs.getInt("IdCliente");
                    String testigo2Nombre = "_______________________";
                    String sqlTestigo = "SELECT Nombre, Apellidos FROM TESTIGO WHERE IdCliente = ? LIMIT 1";
                    try (PreparedStatement pstmtT = conn.prepareStatement(sqlTestigo)) {
                        pstmtT.setInt(1, idCliente);
                        try (ResultSet rsT = pstmtT.executeQuery()) {
                            if (rsT.next()) {
                                testigo2Nombre = rsT.getString("Nombre") + " " + rsT.getString("Apellidos");
                            }
                        }
                    }
                    
                    String[] fechaParts = contratoFecha.split("-");
                    String diaStr = fechaParts[2];
                    String anioStr = fechaParts[0];
                    String[] meses = {"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"};
                    String mesStr = meses[Integer.parseInt(fechaParts[1]) - 1];
                    
                    Map<String, String> medidasEst = obtenerMedidasLote(loteMedidasStr);
                    
                    Map<String, String> r = new HashMap<>();
                    r.put("NOMBRE_DEL_CLIENTE", clienteNombreCompleto.toUpperCase());
                    r.put("NUMERO_DE_LOTE", loteNumero);
                    r.put("NUMERO_DE_MANZANA", manzanaNumero);
                    r.put("PRECIO_DE_VENTA", formatCurrency(lotePrecio));
                    r.put("PRECIO_DE_VENTA_EN_LETRA", convertirPrecio(lotePrecio).toUpperCase());
                    
                    r.put("MEDIDA_AL_NORTE", medidasEst.get("norte"));
                    r.put("MEDIDA_AL_SUR", medidasEst.get("sur"));
                    r.put("MEDIDA_AL_ORIENTE", medidasEst.get("este"));
                    r.put("MEDIDA_AL_PONIENTE", medidasEst.get("oeste"));
                    
                    r.put("COLINDA_AL_NORTE", colNorte);
                    r.put("COLINDA_AL_SUR", colSur);
                    r.put("COLINDA_AL_ORIENTE", colEste);
                    r.put("COLINDA_AL_PONIENTE", colOeste);
                    
                    r.put("FECFHA_FIRMA_DEL_CONTRATO", formatFechaEspanol(contratoFecha));
                    r.put("DIA", diaStr);
                    r.put("MES_", mesStr);
                    r.put("AÃƒâ€˜O", anioStr);
                    r.put("HORA", contratoHora);
                    
                    r.put("NUMERO_DE_SEMANAS", String.valueOf(semanas));
                    r.put("MONTO_DE_PAGO_SEMANAL", formatCurrency(pagoSemanal));
                    r.put("MONTO_DE_PAGO_CON_LETRA", convertirPrecio(pagoSemanal).toUpperCase());
                    
                    r.put("NOMBRE_DEL_TESTIGO_2", testigo2Nombre.toUpperCase());
                    
                    String templatePath = "../plantilla contrato/MACHOTE DE CONTRATOS DE LOTES FINANCIADOS SIN ENGANCHE.docx";
                    File templateFile = new File(templatePath);
                    if (!templateFile.exists()) {
                        templatePath = "plantilla contrato/MACHOTE DE CONTRATOS DE LOTES FINANCIADOS SIN ENGANCHE.docx";
                    }
                    
                    byte[] docxBytes = procesarPlantilla(templatePath, r);
                    
                    ctx.contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    ctx.header("Content-Disposition", "attachment; filename=\"CONTRATO_LOTE_" + loteNumero + ".docx\"");
                    ctx.result(new ByteArrayInputStream(docxBytes));
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("error", "Contrato no encontrado");
                    ctx.status(404).json(resp);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }


    // GET /api/contratos/{id}/datos-impresion
    public static void obtenerDatosImpresion(Context ctx) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        
        String sql = "SELECT c.*, cl.Nombre AS ClienteNombre, cl.Apellidos AS ClienteApellidos, " +
                     "e.Nombre AS VendedorNombre, e.Apellidos AS VendedorApellidos, " +
                     "l.Numero AS LoteNumero, l.Precio AS LotePrecio, l.Medidas AS LoteMedidas, " +
                     "m.Numero AS ManzanaNumero, d.Nombre AS DesarrolloNombre, " +
                     "co.Norte AS ColNorte, co.Sur AS ColSur, co.Este AS ColEste, co.Oeste AS ColOeste " +
                     "FROM CONTRATO c " +
                     "JOIN CLIENTE cl ON c.IdCliente = cl.IdCliente " +
                     "JOIN EMPLEADO e ON c.IdEmpleado = e.IdEmpleado " +
                     "JOIN LOTE l ON c.IdLote = l.IdLote " +
                     "JOIN MANZANA m ON l.IdManzana = m.IdManzana " +
                     "JOIN DESARROLLO d ON m.IdDesarrollo = d.IdDesarrollo " +
                     "LEFT JOIN COLINDANCIA co ON l.IdLote = co.IdLote " +
                     "WHERE c.IdContrato = ?";
                     
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String clienteNombreCompleto = rs.getString("ClienteNombre") + " " + rs.getString("ClienteApellidos");
                    String loteNumero = rs.getString("LoteNumero");
                    BigDecimal lotePrecio = rs.getBigDecimal("MontoTotal");
                    String loteMedidasStr = rs.getString("LoteMedidas");
                    String manzanaNumero = rs.getString("ManzanaNumero");
                    String contratoFecha = rs.getDate("Fecha").toString();
                    Time horaVal = rs.getTime("Hora");
                    String contratoHora = horaVal != null ? horaVal.toString().substring(0, 5) : "00:00";
                    
                    String colNorte = rs.getString("ColNorte") != null ? rs.getString("ColNorte") : "Lote Colindante";
                    String colSur = rs.getString("ColSur") != null ? rs.getString("ColSur") : "Lote Colindante";
                    String colEste = rs.getString("ColEste") != null ? rs.getString("ColEste") : "Lote Colindante";
                    String colOeste = rs.getString("ColOeste") != null ? rs.getString("ColOeste") : "Lote Colindante";
                    
                    BigDecimal enganche = rs.getBigDecimal("Enganche") != null ? rs.getBigDecimal("Enganche") : BigDecimal.ZERO;
                    int plazoMeses = rs.getInt("PlazoMeses");
                    
                    int semanas = plazoMeses * 4;
                    BigDecimal pagoSemanal = BigDecimal.ZERO;
                    if (semanas > 0) {
                        BigDecimal totalFinanciado = lotePrecio.subtract(enganche);
                        pagoSemanal = totalFinanciado.divide(BigDecimal.valueOf(semanas), 2, BigDecimal.ROUND_HALF_UP);
                    }
                    
                    int idCliente = rs.getInt("IdCliente");
                    String testigo2Nombre = "_______________________";
                    String sqlTestigo = "SELECT Nombre, Apellidos FROM TESTIGO WHERE IdCliente = ? LIMIT 1";
                    try (PreparedStatement pstmtT = conn.prepareStatement(sqlTestigo)) {
                        pstmtT.setInt(1, idCliente);
                        try (ResultSet rsT = pstmtT.executeQuery()) {
                            if (rsT.next()) {
                                testigo2Nombre = rsT.getString("Nombre") + " " + rsT.getString("Apellidos");
                            }
                        }
                    }
                    
                    String[] fechaParts = contratoFecha.split("-");
                    String diaStr = fechaParts[2];
                    String anioStr = fechaParts[0];
                    String[] meses = {"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"};
                    String mesStr = meses[Integer.parseInt(fechaParts[1]) - 1];
                    
                    Map<String, String> medidasEst = obtenerMedidasLote(loteMedidasStr);
                    
                    Map<String, String> r = new HashMap<>();
                    r.put("NOMBRE_DEL_CLIENTE", clienteNombreCompleto.toUpperCase());
                    r.put("NUMERO_DE_LOTE", loteNumero);
                    r.put("NUMERO_DE_MANZANA", manzanaNumero);
                    r.put("PRECIO_DE_VENTA", formatCurrency(lotePrecio));
                    r.put("PRECIO_DE_VENTA_EN_LETRA", convertirPrecio(lotePrecio).toUpperCase());
                    
                    r.put("MEDIDA_AL_NORTE", medidasEst.get("norte"));
                    r.put("MEDIDA_AL_SUR", medidasEst.get("sur"));
                    r.put("MEDIDA_AL_ORIENTE", medidasEst.get("este"));
                    r.put("MEDIDA_AL_PONIENTE", medidasEst.get("oeste"));
                    
                    r.put("COLINDA_AL_NORTE", colNorte);
                    r.put("COLINDA_AL_SUR", colSur);
                    r.put("COLINDA_AL_ORIENTE", colEste);
                    r.put("COLINDA_AL_PONIENTE", colOeste);
                    
                    r.put("FECFHA_FIRMA_DEL_CONTRATO", formatFechaEspanol(contratoFecha));
                    r.put("DIA", diaStr);
                    r.put("MES_", mesStr);
                    r.put("AÃ‘O", anioStr);
                    r.put("HORA", contratoHora);
                    
                    r.put("NUMERO_DE_SEMANAS", String.valueOf(semanas));
                    r.put("MONTO_DE_PAGO_SEMANAL", formatCurrency(pagoSemanal));
                    r.put("MONTO_DE_PAGO_CON_LETRA", convertirPrecio(pagoSemanal).toUpperCase());
                    
                    r.put("NOMBRE_DEL_TESTIGO_2", testigo2Nombre.toUpperCase());
                    
                    ctx.json(r);
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("error", "Contrato no encontrado");
                    ctx.status(404).json(resp);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            ctx.status(500).json(response);
        }
    }
    private static byte[] procesarPlantilla(String pathPlantilla, Map<String, String> reemplazos) throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(pathPlantilla));
             ZipOutputStream zipOut = new ZipOutputStream(bos)) {
             
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                ZipEntry newEntry = new ZipEntry(entry.getName());
                zipOut.putNextEntry(newEntry);
                
                if (entry.getName().endsWith(".xml")) {
                    ByteArrayOutputStream xmlBos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zipIn.read(buffer)) > 0) {
                        xmlBos.write(buffer, 0, len);
                    }
                    String xml = xmlBos.toString("UTF-8");
                    
                    for (Map.Entry<String, String> r : reemplazos.entrySet()) {
                        String key = r.getKey();
                        String val = r.getValue();
                        if (val == null) val = "";
                        xml = xml.replaceAll("[\u00ab]?" + key + "[\u00bb]?", val);
                    }
                    
                    zipOut.write(xml.getBytes("UTF-8"));
                } else {
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zipIn.read(buffer)) > 0) {
                        zipOut.write(buffer, 0, len);
                    }
                }
                zipOut.closeEntry();
            }
        }
        return bos.toByteArray();
    }

    private static Map<String, String> obtenerMedidasLote(String medidasStr) {
        Map<String, String> m = new HashMap<>();
        m.put("norte", "10.00 m");
        m.put("sur", "10.00 m");
        m.put("este", "15.00 m");
        m.put("oeste", "15.00 m");
        
        if (medidasStr == null || medidasStr.isEmpty()) return m;
        
        Pattern p = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*[xX]\\s*(\\d+(?:\\.\\d+)?)");
        Matcher matcher = p.matcher(medidasStr);
        if (matcher.find()) {
            String lado1 = matcher.group(1) + " m";
            String lado2 = matcher.group(2) + " m";
            m.put("norte", lado1);
            m.put("sur", lado1);
            m.put("este", lado2);
            m.put("oeste", lado2);
            return m;
        }
        
        Pattern pArea = Pattern.compile("(\\d+(?:\\.\\d+)?)");
        Matcher mArea = pArea.matcher(medidasStr);
        if (mArea.find()) {
            try {
                double area = Double.parseDouble(mArea.group(1));
                double width = Math.round(Math.sqrt(area * 0.6) * 10.0) / 10.0;
                double length = Math.round((area / width) * 10.0) / 10.0;
                m.put("norte", width + " m");
                m.put("sur", width + " m");
                m.put("este", length + " m");
                m.put("oeste", length + " m");
            } catch (Exception ignored) {}
        }
        
        return m;
    }

    private static String formatFechaEspanol(String dateStr) {
        if (dateStr == null || !dateStr.contains("-")) return "";
        try {
            String[] parts = dateStr.split("-");
            int anio = Integer.parseInt(parts[0]);
            int mes = Integer.parseInt(parts[1]);
            int dia = Integer.parseInt(parts[2]);
            String[] meses = {"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"};
            return dia + " de " + meses[mes - 1] + " de " + anio;
        } catch (Exception e) {
            return dateStr;
        }
    }

    private static String formatCurrency(BigDecimal amount) {
        if (amount == null) return "$0.00";
        return new java.text.DecimalFormat("$#,##0.00").format(amount);
    }

    private static final String[] UNIDADES = {"", "UN ", "DOS ", "TRES ", "CUATRO ", "CINCO ", "SEIS ", "SIETE ", "OCHO ", "NUEVE "};
    private static final String[] DECENAS = {"DIEZ ", "ONCE ", "DOCE ", "TRECE ", "CATORCE ", "QUINCE ", "DIECISEIS ", "DIECISIETE ", "DIECIOCHO ", "DIECINUEVE "};
    private static final String[] DECENAS_COMPLETAS = {"", "DIEZ ", "VEINTE ", "TREINTA ", "CUARENTA ", "CINCUENTA ", "SESENTA ", "SETENTA ", "OCHENTA ", "NOVENTA "};
    private static final String[] CENTENAS = {"", "CIENTO ", "DOSCIENTOS ", "TRESCIENTOS ", "CUATROCENTOS ", "QUINIENTOS ", "SEISCIENTOS ", "SIETECIENTOS ", "OCHOCIENTOS ", "NOVECIENTOS "};

    private static String convertirPrecio(BigDecimal numero) {
        if (numero == null) return "CERO PESOS 00/100 M.N.";
        long entero = numero.longValue();
        int centavos = numero.subtract(BigDecimal.valueOf(entero)).multiply(BigDecimal.valueOf(100)).intValue();
        String letras = convertir((int)entero);
        if (letras.isEmpty()) letras = "CERO";
        return letras + " PESOS " + String.format("%02d", centavos) + "/100 M.N.";
    }

    private static String convertir(int numero) {
        if (numero == 0) return "CERO";
        if (numero == 100) return "CIEN";
        
        StringBuilder sb = new StringBuilder();
        
        int millones = numero / 1000000;
        int residuo = numero % 1000000;
        if (millones > 0) {
            if (millones == 1) sb.append("UN MILLON ");
            else sb.append(convertirBloque(millones)).append("MILLONES ");
        }
        
        int miles = residuo / 1000;
        residuo = residuo % 1000;
        if (miles > 0) {
            if (miles == 1) sb.append("MIL ");
            else sb.append(convertirBloque(miles)).append("MIL ");
        }
        
        if (residuo > 0) {
            sb.append(convertirBloque(residuo));
        }
        
        return sb.toString().trim();
    }
    
    private static String convertirBloque(int n) {
        if (n == 100) return "CIEN ";
        StringBuilder sb = new StringBuilder();
        int c = n / 100;
        int d = (n % 100) / 10;
        int u = n % 10;
        
        if (c > 0) {
            sb.append(CENTENAS[c]);
        }
        
        if (d > 0) {
            if (d == 1) {
                sb.append(DECENAS[u]);
                return sb.toString();
            } else if (d == 2 && u > 0) {
                sb.append("VEINTI").append(UNIDADES[u]);
                return sb.toString();
            } else if (d == 2 && u == 0) {
                sb.append("VEINTE ");
            } else {
                sb.append(DECENAS_COMPLETAS[d]);
                if (u > 0) sb.append("Y ");
            }
        }
        
        if (u > 0) {
            sb.append(UNIDADES[u]);
        }
        
        return sb.toString();
    }
}


