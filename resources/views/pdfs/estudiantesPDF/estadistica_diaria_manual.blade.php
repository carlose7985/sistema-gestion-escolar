<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Estadística Diaria - {{ $mesNombre }} {{ $anio }}</title>
    <style>
        @page {
            margin: 0.8cm;
        }

        body {
            font-family: sans-serif;
            font-size: 15px;
            margin: 0;
            padding: 0;
        }

        .header {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            font-size: 11px;
        }

        .page-break {
            page-break-after: always;
        }

        .container {
            width: 100%;
            display: table;
            table-layout: fixed;
            border-spacing: 5px;
        }

        .day-column {
            display: table-cell;
            vertical-align: top;
            border: 0.5px solid #eee;
            padding: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        th,
        td {
            border: 1px solid black;
            text-align: center;
            height: 20px;
            font-size: 12px;
        }

        .text-left {
            text-align: left;
            padding-left: 3px;
            font-weight: bold;
            font-size: 12px;
        }

        .bg-gray {
            background-color: #f2f2f2;
        }

        .fecha-box {
            margin-bottom: 5px;
            border-bottom: 1px solid #333;
            padding-bottom: 2px;
        }

        .label-bold {
            font-weight: bold;
            text-transform: capitalize;
        }
    </style>
</head>

<body>
    <div class="header">ESTADISTICAS DIARIAS <br> ESCUELA CARLOS RAFAEL CONTRERAS <br> MES: {{ $mesNombre }}</div>

    @foreach ($diasAgrupados as $grupo)
    <div class="container">
        @foreach ($grupo as $dia)
        <div class="day-column">
            <div class="fecha-box">
                <span class="label-bold">{{ $dia['nombre'] }}</span><br>
                <span>Fecha: {{ $dia['fecha'] }}</span>
            </div>

            {{-- Tabla Estudiantes --}}
            <table>
                <thead>
                    <tr class="bg-gray">
                        <th width="55%">Grado</th>
                        <th>V</th>
                        <th>H</th>
                        <th>T</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($grados as $grado)
                    <tr>
                        <td class="text-left">{{ $grado->nombre_del_grado }} {{ $grado->seccion }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    @endforeach
                    <tr class="bg-gray">
                        <td class="text-left">TOTAL</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            {{-- Tabla Personal --}}
            <table>
                <tbody>
                    @foreach($cargos as $cargo)
                    <tr>
                        <td class="text-left" width="70%">{{ $cargo->nombre_del_cargo }}</td>
                        <td></td>
                    </tr>
                    @endforeach
                    <tr class="bg-gray">
                        <td class="text-left">TOTAL PERSONAL</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        @endforeach

        {{-- Rellenar con columnas vacías si el último grupo tiene menos de 5 días --}}
        @if(count($grupo) < 5)
            @for($i=0; $i < (5 - count($grupo)); $i++)
            <div class="day-column" style="border:none">
    </div>
    @endfor
    @endif
    </div>

    {{-- Salto de página si hay más grupos --}}
    @if (!$loop->last)
    <div class="page-break"></div>
    @endif
    @endforeach
</body>

</html>