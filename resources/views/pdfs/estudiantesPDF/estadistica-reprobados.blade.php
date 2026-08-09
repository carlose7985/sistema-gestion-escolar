<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadistica estudiantes reprobados</title>
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

        /* Estilos de Tablas */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        th,
        td {
            border: 1px solid black;
            padding: 5px;
            font-size: 9pt;
        }

        .header-blue {
            background-color: #0000FF;
            color: white;
            text-align: center;
        }

        .bg-gray {
            background-color: #f2f2f2;
        }

        /* Sistema de Columnas */
        .container {
            margin-top: 0.6cm;
            width: 100%;
        }

        .col-detalle {
            float: left;
            width: 63%;
        }

        .col-resumen {
            float: right;
            width: 34%;
        }

        /* Limpiar el float */
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
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
        <table style="border: none;">
            <tr>
                <td class="text-center text-11" style="border: none;">
                    <b>ESTADISTICA REPROBADOS PERIODO ESCOLAR: {{ $periodo_escolar }}</b>
                </td>
            </tr>
        </table>
    </div>

    <div class="container clearfix">

        <!-- TABLA IZQUIERDA: DETALLE POR SECCIÓN -->
        <div class="col-detalle">
            <table>
                <thead>
                    <tr class="header-blue">
                        <th colspan="4" class="text-12">ESTADISTICA GENERAL REPROBADOS</th>
                    </tr>
                    <tr class="bg-gray">
                        <th width="50%">Grado y Sección</th>
                        <th>M</th>
                        <th>F</th>
                        <th>T</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($totalporgrado as $item)
                    <tr>
                        <td>{{ $item->grado }} - {{ $item->seccion }}</td>
                        <td class="text-center">{{ $item->sexom ?? 0 }}</td>
                        <td class="text-center">{{ $item->sexof ?? 0 }}</td>
                        <td class="text-center">{{ $item->total ?? 0 }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="empty-row">No hay datos disponibles</td>
                    </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td class="text-center"><b>TOTALES</b></td>
                        @if($totales)
                        <td class="text-center"><b>{{ $totales->sexotm ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->sexotf ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->total ?? 0 }}</b></td>
                        @else
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        @endif
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- TABLA DERECHA: RESUMEN AGRUPADO POR GRADO -->
        <div class="col-resumen">
            <table>
                <thead>
                    <tr class="header-blue">
                        <th colspan="4">TOTAL POR GRADO</th>
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
                    // Agrupamos los datos por el nombre del grado (1ero, 2do, etc)
                    $reprobadosPorGrado = $totalporgrado->groupBy('grado');
                    @endphp

                    @forelse ($reprobadosPorGrado as $gradoNombre => $secciones)
                    @php
                    $totalM = $secciones->sum('sexom');
                    $totalF = $secciones->sum('sexof');
                    $totalGeneral = $totalM + $totalF;
                    @endphp
                    <tr>
                        <td class="text-center"><b>{{ $gradoNombre }}</b></td>
                        <td class="text-center">{{ $totalM }}</td>
                        <td class="text-center">{{ $totalF }}</td>
                        <td class="text-center" style="background-color: #f9f9f9; font-weight: bold;">
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
                    <tr class="total-row">
                        <td class="text-center"><b>TOTAL</b></td>
                        @if($totales)
                        <td class="text-center"><b>{{ $totales->sexotm ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->sexotf ?? 0 }}</b></td>
                        <td class="text-center"><b>{{ $totales->total ?? 0 }}</b></td>
                        @else
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        <td class="text-center"><b>0</b></td>
                        @endif
                    </tr>
                </tfoot>
            </table>
        </div>

    </div>

</body>

</html>