<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estudiantes reprobados</title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
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
    </style>
</head>

<body>

    <div id="header">
        @include('pdfs/estudiantesPDF/header')
        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>ESTUDIANTES REPROBADOS PERIODO ESCOLAR {{$periodo_escolar}}</b></td>

            </tr>

           
        </table>
    </div>

    <div class="container">
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.4cm;margin-left: 0.1cm;"
            border="1">

            <tr>
                <td class="text-center text-12"><b> N° </b></td>
                <td class="text-left text-12"><b>&nbsp;Nombres</b></td>
                <td class="text-left text-12"><b>&nbsp;Apellidos</b></td>
                <td class="text-center text-12"><b>Género</b></td>
                <td class="text-center text-12"><b>Calificación</b></td>
                <td class="text-center text-12"><b>Grado y Sección</b></td>

            </tr>
            @foreach ($estudiantes as $key => $r)
            <tr>

                <td class="text-center">{{ $key + 1 }}</td>
                <td class="text-left">&nbsp;{{ $r->name }}</td>
                <td class="text-left"> &nbsp;{{ $r->apellido }}</td>
                <td class="text-center">{{ $r->sexo }}</td>

                <td class="text-center">{{ $r->apreciacion }}</td>
                <td class="text-center">{{ $r->grado . ' ' . $r->seccion }}</td>
            </tr>
            @endforeach
        </table>
    </div>

</body>

</html>