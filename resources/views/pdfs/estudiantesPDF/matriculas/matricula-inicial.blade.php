<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maricula Inicial</title>
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

        .linea {

            line-height: 0.4cm;
        }

        .tabla-final {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-top: 10px;
        }

        .tabla-final th,
        .tabla-final td {
            border: 1px solid #000;
            text-align: center;
            padding: 3px;
        }

        .bg-blue {
            background-color: #0000FF;
            color: #fff;
        }

        .bg-gray {
            background-color: #eee;
        }

        .fila-varon {
            background-color: #e3f2fd !important;
        }

        /* Azul claro */
        .fila-hembra {
            background-color: #fce4ec !important;
        }

        /* Rosa claro */
        .bg-blue {
            background-color: #007bff;
            color: white;
        }

        .bg-gray {
            background-color: #f8f9fa;
        }

        .tabla-final td,
        .tabla-final th {
            border: 1px solid #dee2e6;
            text-align: center;
            vertical-align: middle;
        }
    </style>
</head>

<body>
    @if ($institucion && count($institucion) > 0)
    <div id="header">

        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>MATRICULA INICIAL - PERIODO {{ $periodo_escolar }}</b></td>

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
        <table style="width: 100%;border-collapse: collapse;border: none;">
            <table class="linea"
                style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;"
                border="1">
                <thead>
                    <tr style="background-color: blue; color: white;">
                        <th class="text-center text-12 " colspan="3" width="100%"><b>TOTAL GENERAL POR GENERO</b>
                        </th>
                    </tr>
                </thead>
                <tr>
                    <td class="text-center text-12"><b>VARONES</b></td>
                    <td class="text-center text-12"><b>HEMBRAS</b></td>
                    <td class="text-center text-12"><b>TOTAL</b></td>
                </tr>
                @foreach ($totalmatricula as $r)
                <tr>
                    <td class="text-center">{{ $r->totalm }}</td>
                    <td class="text-center">{{ $r->totalf }}</td>
                    <td class="text-center">{{ $r->total }}</td>
                    @endforeach
                </tr>
            </table>
        </table>
        <br>
        <table style="width: 100%;border-collapse: collapse;border: none;">

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.4cm;margin-left: 0.1cm;"
                border="1">
                <thead>
                    <tr style="background-color: blue; color: white;">
                        <th class="text-center text-12 " colspan="4" width="100%"><b>TOTAL POR GRADO Y GENERO </b>
                        </th>
                    </tr>
                </thead>
                <tr>
                    <td class="text-center text-12"><b>GRADO</b></td>
                    <td class="text-center text-12"><b>VARONES</b></td>
                    <td class="text-center text-12"><b>HEMBRAS</b></td>
                    <td class="text-center text-12"><b>TOTAL</b></td>

                </tr>

                @foreach ($totalporgrado as $r)
                <tr>
                    <td class="text-center"> {{ $r->grado_nombre }}</td>
                    <td class="text-center">{{ $r->totalm }}</td>
                    <td class="text-center">{{ $r->totalf }}</td>
                    <td class="text-center">{{ $r->total }}</td>
                </tr>
                @endforeach

            </table>



        </table>
        <br>

        <table style="width: 100%;border-collapse: collapse;border: none;">

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.4cm;margin-left: 0.1cm;"
                border="1">
                <thead>
                    <tr style="background-color: blue; color: white;">
                        <th class="text-center text-12 " colspan="4" width="100%"><b>TOTAL POR GRADO, SECCIÓN Y
                                GENERO</b></th>
                    </tr>
                </thead>
                <tr>
                    <td class="text-center text-12"><b>GRADO Y SECCIÓN</b></td>
                    <td class="text-center text-12"><b>VARONES</b></td>
                    <td class="text-center text-12"><b>HEMBRAS</b></td>
                    <td class="text-center text-12"><b>TOTAL</b></td>

                </tr>




                @foreach ($totalporgradoiseccion as $r)
                <tr>
                    <!-- Cambiamos esto para usar la columna snapshot -->
                    <td class="text-center"> {{ $r->grado_completo }}</td>
                    <td class="text-center">{{ $r->totalm }}</td>
                    <td class="text-center">{{ $r->totalf }}</td>
                    <td class="text-center">{{ $r->total }}</td>
                </tr>
                @endforeach

            </table>



        </table>


        <br>
        <br>
        <br>
        <br>
        <table class="tabla-final" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr class="bg-blue">
                    <th rowspan="2">GRADO</th>
                    <th rowspan="2">SEXO</th>
                    <th colspan="13">EDADES</th>
                    <th rowspan="2">SUB-TOTAL</th>
                    <th rowspan="2" style="background-color: #ffeb3b; color: black;">TOTAL</th> <!-- Columna Nueva -->
                </tr>
                <tr class="bg-blue">
                    @for ($i = 4; $i <= 16; $i++)
                        <th>{{ $i }}</th>
                        @endfor
                </tr>
            </thead>
            <tbody>
                @foreach ($totalporedades as $g)
                <!-- FILA VARONES (Azul) -->
                <tr class="fila-varon">
                    <td rowspan="2" style="background-color: white;"><b>{{ $g->grado_nombre }}</b></td>
                    <td>V</td>
                    @for ($i = 4; $i <= 16; $i++)
                        <td>{{ $g->{"v_$i"} > 0 ? $g->{"v_$i"} : '-' }}</td>
                        @endfor
                        <td class="bg-gray"><b>{{ $g->total_v }}</b></td>

                        <!-- CELDA DE SUMA POR GRADO (Abarca 2 filas) -->
                        <td rowspan="2" style="background-color: #fffde7; font-weight: bold; font-size: 1.2em;">
                            {{ $g->total_v + $g->total_h }}
                        </td>
                </tr>

                <!-- FILA HEMBRAS (Rosa) -->
                <tr class="fila-hembra">
                    <td>H</td>
                    @for ($i = 4; $i <= 16; $i++)
                        <td>{{ $g->{"h_$i"} > 0 ? $g->{"h_$i"} : '-' }}</td>
                        @endfor
                        <td class="bg-gray"><b>{{ $g->total_h }}</b></td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="bg-gray">
                    <td colspan="2"><b>TOTALES POR EDAD</b></td>
                    @for ($i = 4; $i <= 16; $i++)
                        <td><b>{{ $totalporedades->sum('v_'.$i) + $totalporedades->sum('h_'.$i) }}</b></td>
                        @endfor
                        <td><b>{{ $totalporedades->sum('total_v') + $totalporedades->sum('total_h') }}</b></td>
                        <td style="background-color: #ffeb3b;"><b>{{ $totalporedades->sum('total_grado') }}</b></td> <!-- Gran Total -->
                </tr>
            </tfoot>
        </table>
    </div>

</body>

</html>