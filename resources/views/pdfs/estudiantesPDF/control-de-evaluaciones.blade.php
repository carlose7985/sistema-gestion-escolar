<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Escala de estimacion</title>
    <style>
        @page {
            margin: 1.0cm 0.7cm;
        }

        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: avoid;
        }

        .text-9 {
            font-size: 9pt !important;
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
            line-height: 0.5cm;
        }

        table.table-main {
            width: 100%;
            border-collapse: collapse;
            line-height: 18px;
        }

        th,
        td {
            font-size: 10pt;
        }

        th.sin-borde,
        td.sin-borde {
            border-top: hidden;
            border-right: 1px solid black;
            border-bottom: hidden;
            border-left: 1px solid black;
            background-color: white !important;
        }

        .celda-vacia {
            height: 18px;
        }

        .mb-2 {
            margin-bottom: 0.2cm;
        }
    </style>
</head>

<body>
    @foreach($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp
        <div class="header mb-2">
            <table class="table-header" border="0">
                <tr>
                    <td class="text-right text-12" width="20%"></td>
                    <td class="text-center text-12" width="50%">
                        <b>CONTROL DE EVALUACIONES&nbsp; {{ $grado->nombre_del_grado }} {{ $grado->seccion }}</b>
                    </td>
                    <td class="text-right text-12" width="30%"><b>FECHA: </b> <u>___________________</u></td>
                </tr>
            </table>
        </div>

        <div class="container">
            <table class="table-main" border="1">
                <thead>
                    <tr>
                        <th class="text-center text-9" rowspan="2" width="3%">Nro</th>
                        <th class="text-center text-9" rowspan="2" width="25%">Nombres y Apellidos</th>
                        <th class="text-center text-9" colspan="3">Lunes</th>
                        <th class="text-center sin-borde" width="1%" rowspan="2"></th>
                        <th class="text-center text-9" colspan="3">Martes</th>
                        <th class="text-center sin-borde" width="1%" rowspan="2"></th>
                        <th class="text-center text-9" colspan="3">Miércoles</th>
                        <th class="text-center sin-borde" width="1%" rowspan="2"></th>
                        <th class="text-center text-9" colspan="3">Jueves</th>
                        <th class="text-center sin-borde" width="1%" rowspan="2"></th>
                        <th class="text-center text-9" colspan="3">Viernes</th>
                    </tr>
                    <tr>
                        @for($i=0; $i<5; $i++)
                            <th class="text-center text-9" width="2.4%">
                            </th>
                            <th class="text-center text-9" width="2.4%"></th>
                            <th class="text-center text-9" width="2.4%"></th>
                            @endfor
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_listado as $student)
                    <tr>
                        <td class="text-center text-9">{{ $suma++ }}</td>
                        <td class="text-left text-9" >
                            &nbsp;&nbsp;{{ $student->name }} {{ $student->apellido }}
                        </td>
                        
                        @for($i=0; $i<5; $i++)
                            <td class="text-center text-9" >
                            </td>
                            <td class="text-center text-9"></td>
                            <td class="text-center text-9"></td>
                            @if($i<4) <td class="sin-borde">
                                </td> @endif
                                @endfor
                    </tr>
                    @endforeach
                    @foreach (['Varones', 'Hembras', 'Total'] as $label)
                    <tr>
                        <td class="text-right text-9" colspan="2" style="font-weight: bold; padding-right: 10px;">{{ $label }}</td>
                        @for($i=0; $i<5; $i++)
                            <td class="celda-vacia">
                            </td>
                            <td></td>
                            <td></td>
                            @if($i<4) <td class="sin-borde">
                                </td> @endif
                                @endfor
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>