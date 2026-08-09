<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Reporte de Estudiantes' }}</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 20px;
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #c2c2c2;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #e0e0e0;
            font-weight: bold;
        }

        td.grado-cell {
            text-align: left;
            background-color: #f0f0f0;
            font-weight: bold;
        }

        td.genero-cell {
            text-align: center;
            background-color: #f8f8f8;
        }

        tr:nth-child(even) .genero-cell {
            background-color: #fdfdfd;
        }

        .total-fila {
            font-weight: bold;
            background-color: #d0d0d0;
        }

        .total-columna-edad {
            font-weight: bold;
            background-color: #d0d0d0;
        }

        .total-general {
            font-weight: bold;
            background-color: #c0c0c0;
        }

        .report-container {
            margin-bottom: 50px;
            page-break-after: always;
            /* Para que cada reporte inicie en una nueva página al imprimir */
        }
    </style>
</head>

<body>

    <div class="report-container">
        <h4>{{ $title ?? 'Reporte de Estudiantes' }}</h4>

        @if (empty($processedReport))
        <p>No hay datos disponibles para este reporte.</p>
        @else
        <table>
            <thead>
                <tr>
                    <th rowspan="2" class="grado-header">GRADO</th>
                    <th rowspan="2">GENERO</th>
                    <th colspan="{{ $uniqueAges->count() }}" class="edad-header">
                        {{ $isSectionReport ?? false ? 'SECCIONES' : 'EDADES' }}
                    </th>
                    <th rowspan="2">SUB-TOTAL</th>
                    <th rowspan="2">TOTAL</th>
                </tr>
                <tr>
                    @foreach ($uniqueAges as $headerItem)
                    <th>{{ $headerItem }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @php $firstRowOfGrade = true; @endphp
                @foreach ($processedReport as $gradoName => $generos)
                @php
                // Calcular el subtotal para el grado actual
                $subtotalGrado = ($generos['M']['total_fila'] ?? 0) + ($generos['F']['total_fila'] ?? 0);
                @endphp
                @foreach (['M', 'F'] as $sexo)
                <tr>
                    @if ($firstRowOfGrade)
                    <td rowspan="2" class="grado-cell">{{ $gradoName }}</td>
                    @php $firstRowOfGrade = false; @endphp
                    @endif
                    <td class="genero-cell">{{ $sexo }}</td>
                    @foreach ($uniqueAges as $headerItem)
                    <td>{{ $generos[$sexo][$headerItem] ?? 0 }}</td>
                    @endforeach
                    <td class="total-fila">{{ $generos[$sexo]['total_fila'] ?? 0 }}</td>
                    @if ($sexo == 'M') {{-- Solo se muestra en la primera fila de cada grado (ej. 'M') --}}
                    <td rowspan="2" class="total-fila">{{ $subtotalGrado }}</td> <!-- Muestra el subtotal del grado -->
                    @endif
                </tr>
                @endforeach
                @php $firstRowOfGrade = true; @endphp
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" class="grado-cell">Totales generales</td>
                    @foreach ($uniqueAges as $headerItem)
                    <td class="total-columna-edad">{{ $reportTotals['totalByAgeColumn'][$headerItem] ?? 0 }}</td>
                    @endforeach
                    <td class="total-general">{{ $reportTotals['grandTotal'] }}</td>
                    <td class="total-general">{{ $reportTotals['grandTotal'] }}</td> <!-- Total general de la nueva columna, que sería el mismo que el total general de 'TOTAL' -->
                </tr>
            </tfoot>
        </table>
        @endif
    </div>

</body>

</html>