<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscrición inicial</title>
    <style>
        @page {
            margin: 0.7cm 0.5cm 0.7cm 0.5cm;
        }

        /* Salto de página */
        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: avoid;
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
            line-height: 0.7cm;
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
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciamos contador por página --}}

        @if ($institucion && count($institucion) > 0)
        <div id="header">
            <table class="table-header" border="0">
                <tr>
                    <td width="100%">
                        <img src="{{ $logo->logodoc ?? '' }}" alt="imagen" width="100%" height="50px">
                    </td>
                </tr>
                <tr>
                    <td class="text-center" width="100%"><big><b>INCRIPCIÓN INICIAL</b></big></td>
                </tr>
            </table>

            @foreach ($institucion as $i)
            <table class="table-header-a" border="0">
                <tr>
                    <td class="text-left text-12">Plantel:&nbsp; <b><u>{{ $i->nombre_de_la_institucion }}</u></b></td>
                    <td class="text-left text-12">Dirección:&nbsp; <b><u>{{ $i->direccion }}</u></b></td>
                    <td class="text-right text-12">Grado:&nbsp; <b><u>{{ $grado->nombre_del_grado }} {{ $grado->seccion }}</u></b></td>
                </tr>
            </table>
            <table class="table-header-a" border="0">
                <tr>
                    <td class="text-left text-12">CDCE:&nbsp; <b><u>{{ $i->zona_educativa }}</u></b></td>
                    <td class="text-right text-12">Edo:&nbsp; <b><u>{{ $i->estado }}</u></b></td>
                </tr>
            </table>
            @endforeach
        </div>
        @else
        <center>
            <b>Los datos de la INSTITUCION no están disponibles.</b>
        </center>
        @endif

        <div class="container">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;" border="1">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th rowspan=2 width="4%">Nro</th>
                        <th rowspan=2 width="26%">Nombres y Apellidos</th>
                        <th rowspan=2 width="10%">Lugar de Nacimiento</th>
                        <th colspan=3 width="8%">F/N</th>
                        <th rowspan=2 width="4%">Edad</th>
                        <th rowspan=2 width="4%">Sexo</th>
                        <th colspan=3 width="6%">Talla</th>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <th width="2%">D</th>
                        <th width="2%">M</th>
                        <th width="4%">A</th>
                        <th width="2%">C</th>
                        <th width="2%">P</th>
                        <th width="2%">Z</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_inscripcion as $students)
                    <tr>
                        <td class="text-center">{{ $suma++ }}</td>
                        <td>&nbsp;{{ $students->name }} {{ $students->apellido }} </td>
                        <td class="text-center">{{ $students->lugar_de_nacimiento }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('d') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('m') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('Y') }}</td>
                        <td class="text-center">{{ $students->age }}</td>
                        <td class="text-center">{{ $students->sexo }}</td>
                        <td class="text-center">{{ $students->talla_de_camisa }}</td>
                        <td class="text-center">{{ $students->talla_de_pantalon }}</td>
                        <td class="text-center">{{ $students->talla_de_zapato }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>