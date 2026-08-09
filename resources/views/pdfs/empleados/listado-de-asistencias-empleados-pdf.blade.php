<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Listado de asistencia {{ $cargoName }}</title>
    <style>
        @page {
            margin: 1.0cm 0.7cm 1.0cm 0.7cm;
        }

        body {
            font-family: sans-serif;
            font-size: 10pt;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 12pt;
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
    </style>
</head>

<body>

    <div class="header">
        Listado para control de asistencia personal {{ $cargoName }}
    </div>

    <div class="container">
        @if ( ($esVigilante && $data->isEmpty()) || (!$esVigilante && $data->count() == 0) )
        <center>
            <p style="font-size: 18pt; margin-top: 50px;">No existen empleados registrados para este cargo.</p>
        </center>
        @else

        <table border="1">
            <thead>
                <tr>
                    <th width="5%">Nro</th>
                    <th width="45%">Nombres y Apellidos</th>
                    <th width="15%">Cédula</th>
                    <!-- Columnas extras para firma/asistencia si es necesario -->
                    <th width="35%">Firma / Observación</th>
                </tr>
            </thead>
            <tbody>

                {{-- CASO 1: VIGILANTES (AGRUPADO POR DÍAS) --}}
                @if($esVigilante)
                @php $globalCount = 1; @endphp
                @foreach($data as $dia => $grupoEmpleados)
                <!-- Fila separadora del grupo (Día de Guardia) -->
                <tr>
                    <td colspan="4" class="group-header">
                        GUARDIA: {{ $dia }}
                    </td>
                </tr>

                @foreach($grupoEmpleados as $item)
                {{-- Nota: $item es el registro de Vigilantesguardia, accedemos al empleado via relacion --}}
                @if($item->empleado)
                <tr>
                    <td class="text-center">{{ $globalCount++ }}</td>
                    <td class="text-left">
                        {{ $item->empleado->nombres }} {{ $item->empleado->apellidos }} 

                        {{-- Mostrar Tipo de Personal (Obrero, Admin, etc) --}}
                        <span class="badge">
                            {{ $item->tipo_de_personal ?? $item->empleado->tipo_de_personal }}
                        </span>
                    </td>
                    <td class="text-center">{{ $item->empleado->cedula }}</td>
                    <td></td> {{-- Espacio para firma --}}
                </tr>
                @endif
                @endforeach
                @endforeach

                {{-- CASO 2: OTROS CARGOS (LISTADO SIMPLE) --}}
                @else
                @php $i = 1; @endphp
                @foreach($data as $empleado)
                <tr>
                    <td class="text-center">{{ $i++ }}</td>
                    <td class="text-left">
                       {{ $empleado->nombres }}  {{ $empleado->apellidos }} 
                    </td>
                    <td class="text-center">{{ $empleado->cedula }}</td>
                    <td></td>
                </tr>
                @endforeach
                @endif

            </tbody>
        </table>
        @endif
    </div>

</body>

</html>