<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadistica estudiantes aprobados</title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        #header {
            width: 100%;
        }

        .text-11 {
            font-size: 11pt !important;
            font-family: 'Rock Salt', cursive;
        }

        .text-12 {
            font-size: 12pt !important;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid black;
            padding: 4px;
            font-size: 9pt;
        }

        .container {
            margin-top: 0.6cm;
            width: 100%;
        }

        /* Estilos para las columnas */
        .column-left {
            float: left;
            width: 62%;
            /* Tabla principal */
        }

        .column-right {
            float: right;
            width: 35%;
            /* Tabla de resumen */
        }

        /* Limpiar floats */
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }

        .header-blue {
            background-color: #0000FF;
            color: white;
            text-align: center;
            font-weight: bold;
        }

        .bg-gray {
            background-color: #f2f2f2;
        }

        .total-row {
            background-color: #e6f3ff;
            font-weight: bold;
        }

        .total-row td {
            border-top: 2px solid #0000FF;
        }

        .empty-row td {
            text-align: center;
            color: #999;
            padding: 15px;
        }
    </style>
</head>

<body>

    <div id="header">
        @include('pdfs/estudiantesPDF/header')
        <table border="0" style="border:none;">
            <tr>
                <td class="text-center text-11" style="border:none;">
                    <b>ESTADISTICA APROBADOS PERIODO ESCOLAR: {{ $periodo_escolar }}</b>
                </td>
            </tr>
        </table>
    </div>

    <div class="container clearfix">

        <!-- COLUMNA IZQUIERDA: DETALLE POR SECCIÓN -->
        <div class="column-left">
            <table>
                <thead>
                    <tr class="header-blue">
                        <th colspan="4">ESTADISTICA POR SECCIÓN</th>
                    </tr>
                    <tr class="bg-gray">
                        <th>Grado y Sección</th>
                        <th>M</th>
                        <th>F</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($totalporgrado as $t)
                    <tr>
                        <td class="text-center">{{ $t->grado }} {{ $t->seccion }}</td>
                        <td class="text-center">{{ $t->sexom ?? 0 }}</td>
                        <td class="text-center">{{ $t->sexof ?? 0 }}</td>
                        <td class="text-center"><b>{{ ($t->sexom ?? 0) + ($t->sexof ?? 0) }}</b></td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="empty-row">No hay datos disponibles</td>
                    </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    @if(isset($totales) && $totales)
                    <tr class="total-row">
                        <td><b>TOTALES GENERALES</b></td>
                        <td class="text-center"><b>{{ $totales->sexotm ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->sexotf ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->total ?? 0 }}</b></td>
                    </tr>
                    @else
                    <tr class="total-row">
                        <td><b>TOTALES GENERALES</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                    </tr>
                    @endif
                </tfoot>
            </table>
        </div>

        <!-- COLUMNA DERECHA: RESUMEN AGRUPADO POR GRADO -->
        <div class="column-right">
            <table>
                <thead>
                    <tr class="header-blue">
                        <th colspan="4">RESUMEN POR GRADO</th>
                    </tr>
                    <tr class="bg-gray">
                        <th>Grado</th>
                        <th>M</th>
                        <th>F</th>
                        <th>T</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                    // Agrupamos la colección original por el nombre del grado
                    $agrupadosPorGrado = $totalporgrado->groupBy('grado');
                    @endphp

                    @forelse ($agrupadosPorGrado as $nombreGrado => $secciones)
                    @php
                    $totalM = $secciones->sum('sexom');
                    $totalF = $secciones->sum('sexof');
                    $totalGeneral = $totalM + $totalF;
                    @endphp
                    <tr>
                        <td class="text-left"><b>{{ $nombreGrado }}</b></td>
                        <td class="text-center">{{ $totalM }}</td>
                        <td class="text-center">{{ $totalF }}</td>
                        <td class="text-center" style="background-color: #eee; font-weight: bold;">
                            {{ $totalGeneral }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="empty-row">No hay datos disponibles</td>
                    </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    @if(isset($totales) && $totales)
                    <tr class="total-row">
                        <td><b>TOTAL</b></td>
                        <td class="text-center"><b>{{ $totales->sexotm ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->sexotf ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->total ?? 0 }}</b></td>
                    </tr>
                    @else
                    <tr class="total-row">
                        <td><b>TOTAL</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                    </tr>
                    @endif
                </tfoot>
            </table>
        </div>

    </div>

</body>

</html>