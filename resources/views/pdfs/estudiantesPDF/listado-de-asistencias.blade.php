<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listado de asistencia</title>
    <style>
        @page {
            margin: 1.0cm 0.7cm 1.0cm 0.7cm;
        }

        /* Clase para el salto de página */
        .page-break {
            page-break-after: always;
        }

        /* Evitar salto en la última página */
        .page-break:last-child {
            page-break-after: avoid;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: -1.2cm;
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

        th,
        td {
            font-size: 10pt;
        }

        th.sin-borde {
            border-top: hidden;
            border-right: 1px;
            border-bottom: hidden;
            border-left: 1px;
        }

        .mb-2 {
            margin-bottom: 0.2cm;
        }
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp <!-- Reiniciamos el contador por cada grado -->

        <div class="header mb-2">
            <table class="table-header" border="0">
                <tr>
                    <td class="text-right text-12" width="20%"></td>
                    <td class="text-center text-12" width="50%">
                        <b>CONTROL DE ASISTENCIAS&nbsp; {{ $grado->nombre_del_grado }} {{ $grado->seccion }}</b>
                    </td>
                    <td class="text-right text-12" width="30%"><b>MES: </b> <u>___________________</u></td>
                </tr>
            </table>
        </div>

        <div class="container">
            <table style="width: 100%;border-collapse: collapse;line-height: 18px;" border="1">
                <thead>
                    <tr>
                        <th class="text-center text-9" rowspan="2" width="3%">Nro</th>
                        <th class="text-center text-9" rowspan="2" width="25%">Nombres y Apellidos </th>
                        <!-- Semana 1 -->
                        <th class="text-center text-9" width="2%">L</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">J</th>
                        <th class="text-center text-9" width="2%">V</th>
                        <th class="text-center sin-borde" width="1%"></th>
                        <!-- Semana 2 -->
                        <th class="text-center text-9" width="2%">L</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">J</th>
                        <th class="text-center text-9" width="2%">V</th>
                        <th class="text-center sin-borde" width="1%"></th>
                        <!-- Semana 3 -->
                        <th class="text-center text-9" width="2%">L</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">J</th>
                        <th class="text-center text-9" width="2%">V</th>
                        <th class="text-center sin-borde" width="1%"></th>
                        <!-- Semana 4 -->
                        <th class="text-center text-9" width="2%">L</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">J</th>
                        <th class="text-center text-9" width="2%">V</th>
                        <th class="text-center sin-borde" width="1%"></th>
                        <!-- Semana 5 -->
                        <th class="text-center text-9" width="2%">L</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">M</th>
                        <th class="text-center text-9" width="2%">J</th>
                        <th class="text-center text-9" width="2%">V</th>
                    </tr>
                    <tr>
                        <!-- Fila vacía para números de días -->
                        @for($i=0; $i<4; $i++)
                            <th class="text-center text-9" width="2%">
                            </th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center sin-borde" width="1%"></th>
                            @endfor
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_listado as $student)
                    <tr>
                        {{-- CELDA NÚMERO --}}
                        <td class="text-center text-9" width="3%">
                            @php
                            $colorNumero = '';
                            if ($student->tipo_de_movimiento == 'Ingreso') {
                            $colorNumero = 'style="background-color: #d4edda;"'; // Verde
                            } elseif ($student->tipo_de_movimiento == 'Egreso') {
                            $colorNumero = 'style="background-color: #f8d7da;"'; // Rojo
                            } elseif ($student->tipo_de_movimiento == 'Cambio') {
                            $colorNumero = 'style="background-color: #fff3cd;"'; // Amarillo
                            }
                            @endphp
                            <span {!! $colorNumero !!} class="px-2 py-1 rounded">
                                {{ $suma++ }}
                            </span>
                        </td>

                        {{-- CELDA NOMBRE --}}
                        <td class="text-left text-9" width="30%">
                            @php
                            $colorNombre = '';
                            if ($student->tipo_de_movimiento == 'Ingreso') {
                            $colorNombre = 'style="background-color: #d4edda;"';
                            } elseif ($student->tipo_de_movimiento == 'Egreso') {
                            $colorNombre = 'style="background-color: #f8d7da;"';
                            } elseif ($student->tipo_de_movimiento == 'Cambio') {
                            $colorNombre = 'style="background-color: #fff3cd;"';
                            }

                            $nombres = explode(' ', trim($student->name));
                            $apellidos = explode(' ', trim($student->apellido));
                            $nombreCompleto = (count($nombres) > 3) ? implode(' ', array_slice($nombres, 0, 2)) : $student->name;
                            $apellidoCompleto = (count($apellidos) >= 2) ? $apellidos[0] . ' ' . substr($apellidos[1], 0, 1) . '.' : $student->apellido;
                            @endphp
                            <span {!! $colorNombre !!} class="px-2 py-1 rounded">
                                &nbsp;&nbsp;{{ $nombreCompleto }} {{ $apellidoCompleto }}
                                @if($student->tipo_de_movimiento)
                                <span style="font-size:6px; font-weight:bold; color:#666; margin-left:5px;">
                                    ({{ $student->tipo_de_movimiento }})
                                </span>
                                @endif
                            </span>
                        </td>

                        {{-- RESTO DE CELDAS (sin color) --}}
                        @php $bgColor = ($student->sexo == 'F') ? 'style="background-color:rgb(234, 235, 225);"' : ''; @endphp

                        @for($w=0; $w<5; $w++)
                            <td class="text-center text-9" {!! $bgColor !!} width="2%">
                            </td>
                            <td class="text-center text-9" {!! $bgColor !!} width="2%"></td>
                            <td class="text-center text-9" {!! $bgColor !!} width="2%"></td>
                            <td class="text-center text-9" {!! $bgColor !!} width="2%"></td>
                            <td class="text-center text-9" {!! $bgColor !!} width="2%"></td>
                            @if($w < 4) <th class="text-center sin-borde" width="1%">
                                </th> @endif
                                @endfor
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <table style="width: 100%;border-collapse: collapse; line-height: 18px;border-top: hidden;" border="1">
                <thead>
                    @foreach (['Varones', 'Hembras', 'Total'] as $label)
                    <tr>
                        <th class="text-right text-9" width="33%">{{ $label }}&nbsp;&nbsp;&nbsp;</th>
                        @for($w=0; $w<5; $w++)
                            <th class="text-center text-9" width="2%">
                            </th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            <th class="text-center text-9" width="2%"></th>
                            @if($w < 4) <th class="text-center sin-borde" width="1%">
                                </th> @endif
                                @endfor
                    </tr>
                    @endforeach
                </thead>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>