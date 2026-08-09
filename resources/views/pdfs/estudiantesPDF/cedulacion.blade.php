<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cedulación Masiva</title>
    <style>
        @page {
            margin: 0.5cm 0.5cm 0.5cm 0.5cm;
        }

        /* Estilo para el salto de página */
        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: avoid;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: 0.5cm;
            width: 100%;
        }

        b {
            color: #454545;
        }

        .text-9 {
            font-size: 9pt !important;
        }

        .text-10 {
            font-size: 10pt !important;
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
            line-height: 0.5cm;
        }

        th,
        td {
            font-size: 10pt;
        }

        .content {
            margin-top: 5px;
        }
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciar contador por cada grado --}}

        <div id="header">
            <table class="table-header">
                <tr>
                    <td width="100%">
                        <img src="{{ $logoDocumento }}" alt="imagen" width="100%" height="50px">
                    </td>
                </tr>
            </table>

            <table class="table-header-a">
                <tr>
                    <td class="text-left"><u>CEDULACION (Régimen Regular)</u></td>
                    <td class="text-right">Año Escolar: <b><u>{{ $periodo_escolar }}</u></b> Mes y año de Matrícula:
                        <b><u>{{ ucfirst($mes) }} {{ $aho }}</u></b>
                    </td>
                </tr>
            </table>

            <table class="table-header-a">
                <tr>
                    <td class="text-left" width="35%">Plantel:&nbsp; <b><u>{{ $institucion->nombre_de_la_institucion }}</u></b></td>
                    <td class="text-left" width="20%">Cód DEA:&nbsp;<b><u>{{ $institucion->codigo_dea }}</u></b></td>
                    <td class="text-center" width="25%">Dirección:&nbsp; <b><u>{{ $institucion->direccion }}</u></b></td>
                    <td class="text-right">Municipio:&nbsp; <b><u>{{ $institucion->municipio }}</u></b></td>
                </tr>
            </table>

            <table class="table-header-a">
                <tr>
                    <td class="text-left">Ent Federal:&nbsp; <b><u>{{ $institucion->estado }}</u></b></td>
                    <td class="text-left">CDCE:&nbsp; <b><u>{{ $institucion->zona_educativa }}</u></b></td>
                    <td class="text-center">Sección:&nbsp;
                        <b><u>&nbsp;{{ $grado->nombre_del_grado . ' ' . $grado->seccion }}</u></b>
                    </td>
                    <td class="text-center">Matricula:&nbsp;
                        <b><u>{{ $grado->mgeneral }}</u></b>
                    </td>
                </tr>
            </table>
        </div>

        <div class="content">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;" border="1">
                <thead>
                    <tr>
                        <th rowspan="2">Nro</th>
                        <th rowspan="2">Cédula de identidad</th>
                        <th rowspan="2">Apellidos</th>
                        <th rowspan="2">Nombres</th>
                        <th rowspan="2">Sexo</th>
                        <th colspan="3">F/N</th>
                        <th colspan="4">Escolaridad</th>
                    </tr>
                    <tr>
                        <th>&nbsp;D&nbsp;</th>
                        <th>&nbsp;M&nbsp;</th>
                        <th>A</th>
                        <th>RG</th>
                        <th>RP</th>
                        <th>MP</th>
                        <th>DI</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_cedulacion as $students)
                    <tr>
                        <td class="text-center">{{ $suma++ }}</td>
                        <td class="text-center">{{ $students->documento }} {{ $students->cedula }}</td>
                        <td class="text-left">&nbsp;{{ $students->apellido }}</td>
                        <td class="text-left">&nbsp;{{ $students->name }}</td>
                        <td class="text-center">{{ $students->sexo }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('d') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('m') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('Y') }}</td>

                        <td class="text-center">{{ ($students->condicion == 'Regular') ? 'X' : '' }}</td>
                        <td class="text-center">{{ ($students->condicion == 'Repitiente') ? 'X' : '' }}</td>
                        <td class="text-center"></td>
                        <td class="text-center"></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>