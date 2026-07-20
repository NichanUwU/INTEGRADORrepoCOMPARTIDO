$file = "sofi-backend\src\main\java\com\sofi\controllers\ContratoController.java"
$content = Get-Content $file -Raw

$newMethod = @"

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
                    r.put("AÑO", anioStr);
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
"@

# We need to insert this right before "private static byte[] procesarPlantilla"
$target = "    private static byte[] procesarPlantilla"
$content = $content.Replace($target, $newMethod + "`n" + $target)
Set-Content $file -Value $content -Encoding UTF8
