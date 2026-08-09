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
        }

        .container {
            margin-top: 0.6cm;
        }

        .linea {
            line-height: 0.4cm;
        }

        .grado-seccion-title {
            background-color: #f0f0f0;
            padding: 5px;
            margin-top: 10px;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>

    @foreach($estudiantesPorGradoSeccion as $gradoSeccion => $estudiantes)
    <div class="grado-seccion-page">
        <div id="header">
            @include('pdfs/estudiantesPDF/header')
            <table class="table-header-a" border="0">
                <tr>
                    <td class="text-center text-12" width="100%">
                        <b>GRADO Y SECCIÓN: {{ $gradoSeccion }}</b>
                    </td>

                </tr>
                <tr>
                    <td class="text-center text-11" width="100%"><b>ESTUDIANTES APROBADOS PERIODO ESCOLAR: {{ $periodo_escolar }}</b></td>
                </tr>

            </table>
        </div>

        <div class="container">
            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.4cm;margin-left: 0.1cm;" border="1">
                <thead>
                    <tr>
                        <th class="text-center text-12"><b> N° </b></th>
                        <th class="text-left text-12"><b>&nbsp;Nombre</b></th>
                        <th class="text-left text-12"><b>&nbsp;Apellidos</b></th>
                        <th class="text-center text-12"><b>Género</b></th>
                        <th class="text-left text-12"><b>&nbsp;Cédula O C/Escolar</b></th>
                        <th class="text-center text-12"><b>Calificación</b></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($estudiantes as $key => $r)
                    <tr>
                        <td class="text-center">{{ $key + 1 }}</td>
                        <td class="text-left">&nbsp;{{ $r->name }}</td>
                        <td class="text-left">&nbsp;{{ $r->apellido }}</td>
                        <td class="text-center">{{ $r->sexo }}</td>
                        <td class="text-center">{{ $r->cedula }}</td>
                        <td class="text-center">{{ $r->apreciacion }}</td>
                    </tr>
                    @endforeach

                    @if(count($estudiantes) == 0)
                    <tr>
                        <td colspan="6" class="text-center">No hay estudiantes aprobados en este grado y sección</td>
                    </tr>
                    @endif
                </tbody>
            </table>
        </div>
    </div>

    @if(!$loop->last)
    <div class="page-break"></div>
    @endif
    @endforeach

</body>

</html>