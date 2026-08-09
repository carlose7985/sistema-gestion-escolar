<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Listado de asistencia - Todos los Cargos</title>
    <style>
        @page {
            margin: 1.0cm 0.7cm 1.0cm 0.7cm;
        }

        body {
            font-family: sans-serif;
            font-size: 10pt;
        }

        .page-break {
            page-break-after: always;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 12pt;
        }

        .cargo-title {
            background-color: #334155;
            color: white;
            padding: 8px;
            margin-bottom: 10px;
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
        }

        th,
        td {
            border: 1px solid black;
            padding: 5px;
        }

        th {
            background-color: #f0f0f0;
            text-align: center;
        }

        .group-header {
            background-color: #e2e8f0;
            font-weight: bold;
            text-align: left;
            padding-left: 10px;
            text-transform: uppercase;
            font-size: 11pt;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        .badge {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8pt;
            border-radius: 4px;
            border: 1px solid #ccc;
            margin-left: 9px;
            background: #fff;
        }

        .total-empleados {
            text-align: right;
            font-size: 9pt;
            margin-top: 5px;
            color: #555;
        }
    </style>
</head>

<body>

    <div class="header">
        Listado para control de asistencia - TODOS LOS CARGOS
        <br>
        <small style="font-weight: normal; font-size: 9pt;">
            Fecha de impresión: {{ date('d/m/Y H:i A') }}
        </small>
    </div>

    @foreach($dataPorCargo as $index => $cargoData)
    <div class="cargo-title">
        CARGO: {{ $cargoData['cargoName'] }}
        <span style="font-weight: normal; font-size: 10pt; margin-left: 10px;">
            ({{ $cargoData['esVigilante'] ? $cargoData['data']->flatten()->count() : $cargoData['data']->count() }} REGISTROS)
        </span>
    </div>

    <table border="1">
        <thead>
            <tr>
                <th width="5%">Nro</th>
                <th width="45%">Nombres y Apellidos</th>
                <th width="15%">Cédula</th>
                <th width="35%">Firma / Observación</th>
            </tr>
        </thead>
        <tbody>
            @if($cargoData['esVigilante'])
            @php $globalCount = 1; @endphp
            @foreach($cargoData['data'] as $dia => $grupoEmpleados)
            <tr>
                <td colspan="4" class="group-header">
                    GUARDIA: {{ $dia }}
                </td>
            </tr>
            @foreach($grupoEmpleados as $item)
            @if($item->empleado)
            <tr>
                <td class="text-center">{{ $globalCount++ }}</td>
                <td class="text-left">
                    {{ $item->empleado->nombres }} {{ $item->empleado->apellidos }}
                    <span class="badge">
                        {{ $item->tipo_de_personal ?? $item->empleado->tipo_de_personal }}
                    </span>
                </td>
                <td class="text-center">{{ $item->empleado->cedula }}</td>
                <td></td>
            </tr>
            @endif
            @endforeach
            @endforeach
            @else
            @php $i = 1; @endphp
            @foreach($cargoData['data'] as $empleado)
            <tr>
                <td class="text-center">{{ $i++ }}</td>
                <td class="text-left">
                    {{ $empleado->nombres }} {{ $empleado->apellidos }}
                </td>
                <td class="text-center">{{ $empleado->cedula }}</td>
                <td></td>
            </tr>
            @endforeach
            @endif
        </tbody>
    </table>

    <div class="total-empleados">
        Total empleados: {{ $cargoData['esVigilante'] ? $cargoData['data']->flatten()->count() : $cargoData['data']->count() }}
    </div>

    {{-- Saltar página si no es el último cargo --}}
    @if (!$loop->last)
    <div class="page-break"></div>
    @endif
    @endforeach

</body>

</html>