<!DOCTYPE html>
<html>

<head>

    <style>
        /* Configuración de la página */
        @page {
            margin: 1.5cm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
        }

        .page-break {
            page-break-after: always;
        }

        .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 20px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        /* ESTILOS DE LA TABLA (IMPORTANTE) */
        table {
            width: 100%;
            border-collapse: collapse;
            /* Une los bordes */
            margin-top: 10px;
            table-layout: fixed;
            /* Ayuda a que las columnas no se desordenen */
        }

        th,
        td {
            border: 1px solid #000;
            /* Borde negro sólido */
            padding: 6px 4px;
            text-align: center;
            word-wrap: break-word;
        }

        th {
            background-color: #f2f2f2;
            /* Gris claro para el encabezado */
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9pt;
        }

        .total-row {
            background-color: #eee;
            font-weight: bold;
        }

        .grado-cell {
            text-align: left;
            padding-left: 10px;
            font-weight: bold;
        }
    </style>
</head>

<body>

    <!-- HOJA 1: CONDICIÓN ESPECIAL -->
    <div class="page-break">
        <div class="header-title">MATRÍCULA CON CONDICIÓN ESPECIAL</div>
        @include('PDFS.estudiantesPDF.matriculas.partials._tabla_matriz', ['data' => $condicion])
    </div>

    <!-- HOJA 2: ETNIA -->
    <div class="page-break">
        <div class="header-title">MATRÍCULA PERTENECIENTE A UNA ETNIA</div>
        @include('PDFS.estudiantesPDF.matriculas.partials._tabla_matriz', ['data' => $etnia])
    </div>

    <!-- HOJA 3: VUELTA A LA PATRIA (STATUS: OTROS) -->
    <div class="page-break">
        <div class="header-title">ESTUDIANTES VUELTA A LA PATRIA</div>
        @include('PDFS.estudiantesPDF.matriculas.partials._tabla_matriz', ['data' => $vuelta])
    </div>

    <!-- HOJA 4: NO ESCOLARIZADOS -->
    <div>
        <div class="header-title">ESTUDIANTES NO ESCOLARIZADOS</div>
        @include('PDFS.estudiantesPDF.matriculas.partials._tabla_matriz', ['data' => $noEscolarizado])
    </div>

</body>

</html>