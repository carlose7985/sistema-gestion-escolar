<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Ficha de Inscripción Escolar</title>
    <style>
        @page {
            margin: 0.8cm 1.2cm;
            size: letter;
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            color: #333;
            line-height: 1.2;
            margin: 0;
            padding: 0;
            font-size: 9pt;
        }

        /* Contenedores */
        .section-title {
            background: #f0f0f0;
            text-align: center;
            font-weight: bold;
            padding: 4px;
            border: 1px solid #000;
            margin-top: 10px;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        td {
            padding: 3px;
            vertical-align: top;
        }

        /* Estilos de Campos OCR */
        .label {
            font-weight: bold;
            font-size: 8pt;
            display: block;
            margin-bottom: 2px;
            color: #555;
        }

        .box {
            border: 1px solid #999;
            height: 28px;
            width: 100%;
            background: #fff;
        }

        .box-large {
            border: 1px solid #999;
            height: 35px;
            width: 100%;
        }

        /* Para direcciones o textos largos */

        /* Checkboxes para OCR */
        .check-group {
            display: flex;
            align-items: center;
        }

        .check-box {
            border: 1px solid #000;
            width: 14px;
            height: 14px;
            display: inline-block;
            margin-right: 5px;
            margin-top: 10px;
            vertical-align: middle;
        }

        .check-label {
            font-size: 8pt;
            margin-right: 3px;
            margin-left: 4px;
        }

        .text-center {
            text-align: center;
        }

      

        .footer-table {
            margin-top: 20px;
        }

        .signature-line {
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 5px;
            font-size: 8pt;
        }
    </style>
</head>

<body>

    <!-- CABECERA -->
    <table class="header-table">
        <tr>
            <td style="width: 10%"><img src="{{ $logoDocumento }}" height="50"></td>
            <td width="40%" class="text-center">
                <b style="font-size: 14pt;">FICHA DE INSCRIPCIÓN</b><br>
                <span>PERIODO ESCOLAR: {{ $periodo_escolar ?? '________ - ________' }}</span>
            </td>
            <td width="30%" style="text-align: left;">FECHA: ______/______/______</td>
        </tr>
    </table>

    <table>
        <tr>
            <td width="40%"><span class="label">GRADO Y SECCIÓN</span>
                <div class="box"></div>
            </td>
            <td width="60%"><span class="label">DOCENTE(S)</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <!-- SECCIÓN I: ESTUDIANTE -->
    <div class="section-title">I. IDENTIFICACIÓN DEL ESTUDIANTE</div>

    <table>
        <tr>
            <td colspan="2"><span class="label">NOMBRES COMPLETOS</span>
                <div class="box"></div>
            </td>
            <td colspan="3"><span class="label">APELLIDOS COMPLETOS</span>
                <div class="box"></div>
            </td>
        </tr>
        <tr>
            <td width="25%"><span class="label">CÉDULA / ID ESCOLAR</span>
                <div class="box"></div>
            </td>
            <td width="25%"><span class="label">FECHA NACIMIENTO</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">EDAD</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">SEXO</span>
                <div class="box"></div>
            </td>
            <td width="20%"><span class="label">APRECIACIÓN</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <td width="50%"><span class="label">LUGAR DE NACIMIENTO</span>
                <div class="box"></div>
            </td>
            <td width="50%"><span class="label">ENTIDAD FEDERAL</span>
                <div class="box"></div>
            </td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">DIRECCIÓN DE HABITACIÓN</span>
                <div class="box-large"></div>
            </td>
        </tr>
        <tr>
            <td width="70%"><span class="label">INSTITUTO DE PROCEDENCIA</span>
                <div class="box"></div>
            </td>
            <td width="30%"><span class="label">ETNIA</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <!-- CONDICIONES Y STATUS -->
    <table>
        <tr>
            <td width="25%">

                <span class="label">CONDICIÓN:</span>
                <div class="box">
                    <span class="check-label">Regular</span> <span class="check-box"></span>
                    <span class="check-label" style="margin-left: 12px;">Repitiente</span> <span class="check-box"></span>
                </div>
            </td>
            <td width="35%">

                <span class="label">LATERALIDAD:</span>
                <div class="box">
                    <span class="check-label">Derecho</span> <span class="check-box"></span>
                    <span class="check-label" style="margin-left: 12px;">Zurdo</span> <span class="check-box"></span>
                    <span class="check-label" style="margin-left: 12px;">Ambidiestro</span> <span class="check-box"></span>
                </div>
            </td>
            <td width="40%">

                <span class="label">STATUS ESCOLAR:</span>
                <div class="box">
                    <span class="check-label">Escolarizado</span> <span class="check-box"></span>
                    <span class="check-label" style="margin-left: 12px;">No Escolarizado</span><span class="check-box"></span>
                    <span class="check-label" style="margin-left: 12px;">Otros</span> <span class="check-box"></span>
                </div>
            </td>
        </tr>
    </table>

    <!-- TALLAS Y SALUD -->
    <table>
        <tr>
            <td width="55%"><span class="label">DIFICULTADES:</span>
                <div class="box">
                    <span class="check-label">Motrices</span> <span class="check-box"></span>
                    <span class="check-label">Visuales</span> <span class="check-box"></span>
                    <span class="check-label">Auditivas</span> <span class="check-box"></span>
                    <span class="check-label">Ninguna</span> <span class="check-box"></span>
                </div>
            </td>
            <td width="15%"><span class="label">T. CAMISA</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">T. PANTALÓN</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">T. ZAPATO</span>
                <div class="box"></div>
            </td>

        </tr>
    </table>

    <table>
        <tr>
            <td width="50%"><span class="label">ENFERMEDADES PADECIDAS</span>
                <div class="box"></div>
            </td>
            <td width="50%"><span class="label">TRATAMIENTO MÉDICO</span>
                <div class="box"></div>
            </td>
        </tr>
        <tr>
            <td width="50%"><span class="label">ALERGIAS (INDIQUE CUÁL)</span>
                <div class="box"></div>
            </td>
            <td width="50%"><span class="label">CONDICIÓN ESPECIAL</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <!-- SECCIÓN II: REPRESENTANTE -->
    <div class="section-title">II. DATOS DEL REPRESENTANTE LEGAL</div>
    <table>
        <tr>
            <td width="40%"><span class="label">NOMBRE Y APELLIDO</span>
                <div class="box"></div>
            </td>
            <td width="20%"><span class="label">CÉDULA</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">SEXO</span>
                <div class="box"></div>
            </td>
            <td width="25%"><span class="label">F/N</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>
    <table>
        <tr>
            <td width="20%"><span class="label">TELÉFONO</span>
                <div class="box"></div>
            </td>
            <td width="20%"><span class="label">OCUPACIÓN</span>
                <div class="box"></div>
            </td>
            <td width="35%"><span class="label">DIRECCIÓN</span>
                <div class="box"></div>
            </td>
            <td width="25%"><span class="label">PARENTESCO</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <!-- SECCIÓN III: PADRES -->
    <div class="section-title">III. DATOS DEL PADRE O MADRE (PROGENITOR)</div>
    <table>
        <tr>
            <td width="40%"><span class="label">NOMBRE Y APELLIDO</span>
                <div class="box"></div>
            </td>
            <td width="20%"><span class="label">CÉDULA</span>
                <div class="box"></div>
            </td>
            <td width="15%"><span class="label">SEXO</span>
                <div class="box"></div>
            </td>
            <td width="25%"><span class="label">F/N</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>
    <table>
        <tr>
            <td width="20%"><span class="label">TELÉFONO</span>
                <div class="box"></div>
            </td>
            <td width="25%"><span class="label">OCUPACIÓN</span>
                <div class="box"></div>
            </td>
            <td width="55%"><span class="label">DIRECCIÓN</span>
                <div class="box"></div>
            </td>
        </tr>
    </table>

    <!-- FIRMAS -->
    <table class="footer-table" style="margin-top: 30px;">
        <tr>
            <td width="33%">
                <div class="signature-line">FIRMA DEL DOCENTE</div>
            </td>
            <td width="33%">
                <div class="signature-line">FIRMA DEL DIRECTOR</div>
            </td>
            <td width="33%">
                <div class="signature-line">FIRMA DEL REPRESENTANTE</div>
            </td>
        </tr>
    </table>

</body>

</html>