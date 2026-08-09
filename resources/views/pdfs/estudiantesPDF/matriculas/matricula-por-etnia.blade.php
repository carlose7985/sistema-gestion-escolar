<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte por etnia</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 20px;
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

        /* Para un poco de cebra en el género */
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
    </style>
</head>

<body>

    <h5>Reporte de Estudiantes pertenecientes a una etnia</h5>

    @if (empty($processedReport))
    <p>No hay datos disponibles para el reporte.</p>
    @else
    <table>
        <thead>
            <tr>
                <th rowspan="2" class="grado-header">GRADO</th>
                <th rowspan="2">GENERO</th>
                <th colspan="{{ $uniqueAges->count() }}" class="edad-header">EDADES</th>
                <th rowspan="2">TOTAL</th>
            </tr>
            <tr>
                @foreach ($uniqueAges as $age)
                <th>{{ $age }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @php $firstRowOfGrade = true; @endphp
            @foreach ($processedReport as $gradoName => $generos)
            @foreach (['M', 'F'] as $sexo)
            <tr>
                @if ($firstRowOfGrade)
                <td rowspan="2" class="grado-cell">{{ $gradoName }}</td>
                @php $firstRowOfGrade = false; @endphp
                @endif
                <td class="genero-cell">{{ $sexo }}</td>
                @foreach ($uniqueAges as $age)
                <td>{{ $generos[$sexo][$age] ?? 0 }}</td>
                @endforeach
                <td class="total-fila">{{ $generos[$sexo]['total_fila'] }}</td>
            </tr>
            @endforeach
            @php $firstRowOfGrade = true; @endphp {{-- Reiniciar para el próximo grado --}}
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2" class="grado-cell">Totales generales</td>
                @foreach ($uniqueAges as $age)
                <td class="total-columna-edad">{{ $reportTotals['totalByAgeColumn'][$age] ?? 0 }}</td>
                @endforeach
                <td class="total-general">{{ $reportTotals['grandTotal'] }}</td>
            </tr>
        </tfoot>
    </table>
    @endif

</body>

</html>