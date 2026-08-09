<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{$titulo}}</title>
    <style>
        @page {
            margin: 1.0cm 3.0cm 1.5cm 3.0cm;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: -0.4cm;
            width: 100%;
        }

        .text-9 {
            font-size: 9pt !important;
        }

        .text-10 {
            font-size: 10pt !important;
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

        .text-right {
            text-align: right;
        }

        table.table-header {
            width: 100%;
            border-collapse: collapse;
            border: none;
        }

        table.table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.6cm;
        }

        th,
        td {
            font-size: 10pt;
        }

        .container {
            margin-top: 0.6cm;
        }

        .encabezado-principal {
            background-color: #8a8fe9ff;
            color: white;
            font-weight: bold;
            text-align: center;
            padding-top: 10px;
            padding-bottom: 10px;
            font-size: 11pt !important;
            font-family: 'Rock Salt', cursive;
        }

        .sub-encabezados {
            background-color: #c9c7b3ff;
            font-weight: bold;
            text-align: center;
            padding: 10px 5px;
            font-size: 11pt !important;
        }

        .datos-fila {
            text-align: center;
            padding: 8px 5px;
            font-size: 11pt !important;
        }
    </style>
</head>

<body>
    @if ($institucion && count($institucion) > 0)
    <div id="header">
        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>{{$titulo}}</b></td>
            </tr>
            <tr>
                <td class="text-center text-11" width="100%">
                    @foreach ($institucion as $i)
                    <b>{{ $i->nombre_de_la_institucion }}</b>
                    @endforeach
                </td>
            </tr>
        </table>
    </div>
    @else
    <center>
        <b>los datos de la INSTITUCION no están disponibles debe registrarlos en el modulo DATOS BASICOS.</b>
    </center>
    @endif

    <div class="container">
        <!-- TABLA DE INGRESOS -->
        <table style="width: 100%; border-collapse: collapse;" border="1">
            <thead>
                <tr>
                    <th class="encabezado-principal" colspan="7">TOTAL INGRESOS POR GRADO SECCIÓN Y GENERO</th>
                </tr>
                <tr class="sub-encabezados">
                    <td width="25%"><b>GRADO Y SECCIÓN</b></td>
                    <td><b>VARONES</b></td>
                    <td><b>HEMBRAS</b></td>
                    <td><b>TOTAL</b></td>
                    <td style="background-color: #b1b1b1;"><b>V</b></td>
                    <td style="background-color: #b1b1b1;"><b>H</b></td>
                    <td style="background-color: #b1b1b1;"><b>T</b></td>
                </tr>
            </thead>
            <tbody>
                @php $totalGeneralV = 0; $totalGeneralH = 0; $totalGeneralT = 0; @endphp
                @foreach ($ingreso as $nombreGrado => $secciones)
                @php
                $sumV = $secciones->sum('sexosm');
                $sumH = $secciones->sum('sexosf');
                $sumT = $secciones->sum('totals');
                $totalGeneralV += $sumV;
                $totalGeneralH += $sumH;
                $totalGeneralT += $sumT;
                $rowCount = count($secciones);
                @endphp
                @foreach ($secciones as $index => $s)
                <tr>
                    <td class="datos-fila">{{ $s->grado }} {{ $s->seccion }}</td>
                    <td class="datos-fila">{{ $s->sexosm }}</td>
                    <td class="datos-fila">{{ $s->sexosf }}</td>
                    <td class="datos-fila">{{ $s->totals }}</td>
                    @if($index === 0)
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumV }}
                    </td>
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumH }}
                    </td>
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumT }}
                    </td>
                    @endif
                </tr>
                @endforeach
                @endforeach
                {{-- Fila de total general --}}
                <tr style="background-color: #e0e0e0; font-weight: bold;">
                    <td class="datos-fila"><b>TOTAL GENERAL</b></td>
                    <td class="datos-fila">{{ $totalGeneralV }}</td>
                    <td class="datos-fila">{{ $totalGeneralH }}</td>
                    <td class="datos-fila">{{ $totalGeneralT }}</td>
                    <td class="datos-fila">{{ $totalGeneralV }}</td>
                    <td class="datos-fila">{{ $totalGeneralH }}</td>
                    <td class="datos-fila">{{ $totalGeneralT }}</td>
                </tr>
            </tbody>
        </table>

        <br><br>

        <!-- TABLA DE EGRESOS -->
        <table style="width: 100%; border-collapse: collapse;" border="1">
            <thead>
                <tr>
                    <th class="encabezado-principal" colspan="7">TOTAL EGRESOS POR GRADO SECCIÓN Y GENERO</th>
                </tr>
                <tr class="sub-encabezados">
                    <td width="25%"><b>GRADO Y SECCIÓN</b></td>
                    <td><b>VARONES</b></td>
                    <td><b>HEMBRAS</b></td>
                    <td><b>TOTAL</b></td>
                    <td style="background-color: #b1b1b1;"><b>V</b></td>
                    <td style="background-color: #b1b1b1;"><b>H</b></td>
                    <td style="background-color: #b1b1b1;"><b>T</b></td>
                </tr>
            </thead>
            <tbody>
                @php $totalGeneralV = 0; $totalGeneralH = 0; $totalGeneralT = 0; @endphp
                @foreach ($egreso as $nombreGrado => $secciones)
                @php
                $sumV = $secciones->sum('sexosm');
                $sumH = $secciones->sum('sexosf');
                $sumT = $secciones->sum('totals');
                $totalGeneralV += $sumV;
                $totalGeneralH += $sumH;
                $totalGeneralT += $sumT;
                $rowCount = count($secciones);
                @endphp
                @foreach ($secciones as $index => $s)
                <tr>
                    <td class="datos-fila">{{ $s->grado }} {{ $s->seccion }}</td>
                    <td class="datos-fila">{{ $s->sexosm }}</td>
                    <td class="datos-fila">{{ $s->sexosf }}</td>
                    <td class="datos-fila">{{ $s->totals }}</td>
                    @if($index === 0)
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumV }}
                    </td>
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumH }}
                    </td>
                    <td class="datos-fila" rowspan="{{ $rowCount }}" style="background-color: #f9f9f9; font-weight: bold;">
                        {{ $sumT }}
                    </td>
                    @endif
                </tr>
                @endforeach
                @endforeach
                {{-- Fila de total general --}}
                <tr style="background-color: #e0e0e0; font-weight: bold;">
                    <td class="datos-fila"><b>TOTAL GENERAL</b></td>
                    <td class="datos-fila">{{ $totalGeneralV }}</td>
                    <td class="datos-fila">{{ $totalGeneralH }}</td>
                    <td class="datos-fila">{{ $totalGeneralT }}</td>
                    <td class="datos-fila">{{ $totalGeneralV }}</td>
                    <td class="datos-fila">{{ $totalGeneralH }}</td>
                    <td class="datos-fila">{{ $totalGeneralT }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>