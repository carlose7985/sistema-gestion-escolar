<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estudiantes aprobados</title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: auto;
        }

        #header {
            width: 100%;
            left: 0cm;
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
            padding: 5px;
        }

        .container {
            margin-top: 0.6cm;
        }

        .linea {
            line-height: 0.4cm;
        }

        table.lista-estudiantes {
            width: 100%;
            border-collapse: collapse;
            line-height: 0.4cm;
        }

        table.lista-estudiantes th,
        table.lista-estudiantes td {
            border: 1px solid #000;
        }
    </style>
</head>

<body>

    <div id="header">
        @include('pdfs/estudiantesPDF/header')
        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-12" width="100%">
                    <b>ESTUDIANTES APROBADOS CON (A) PERIODO ESCOLAR: {{ $periodo_escolar }}</b>
                </td>
            </tr>
        </table>
    </div>

    <div class="container">
        <table class="lista-estudiantes" border="1">
            <thead>
                <tr>
                    <th class="text-center text-12"><b> N° </b></th>
                    <th class="text-center text-12"><b>Grado y Sección</b></th>
                    <th class="text-left text-12"><b>&nbsp;Nombre</b></th>
                    <th class="text-left text-12"><b>&nbsp;Apellidos</b></th>
                    <th class="text-center text-12"><b>Género</b></th>
                    <th class="text-left text-12"><b>&nbsp;Cédula O C/Escolar</b></th>
                    <th class="text-center text-12"><b>Calificación</b></th>
                </tr>
            </thead>
            <tbody>
                @php
                $contador = 1;
                @endphp

                @foreach($estudiantesPorGradoSeccion as $gradoSeccion => $estudiantes)
                @foreach ($estudiantes as $r)
                <tr>
                    <td class="text-center">{{ $contador++ }}</td>
                    <td class="text-center">{{ $gradoSeccion }}</td>
                    <td class="text-left">&nbsp;{{ $r->name }}</td>
                    <td class="text-left">&nbsp;{{ $r->apellido }}</td>
                    <td class="text-center">{{ $r->sexo }}</td>
                    <td class="text-center">{{ $r->cedula }}</td>
                    <td class="text-center">{{ $r->apreciacion }}</td>
                </tr>
                @endforeach
                @endforeach

                @if($contador == 1)
                <tr>
                    <td colspan="7" class="text-center">No hay estudiantes aprobados</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

</body>

</html>