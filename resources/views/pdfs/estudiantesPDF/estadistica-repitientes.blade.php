<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadistica estudiantes repitientes</title>
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
                <td class="text-center text-11" width="100%"><b>ESTADISTICA REPITIENTES </b></td>

            </tr>

        </table>
    </div>

    <div class="container">
        <table style="width: 100%;border-collapse: collapse;border: none;">
            <table class="linea"
                style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;"
                border="1">
                <thead>
                    <tr style="background-color: blue; color: white;">
                        <th class="text-center text-12 " colspan="4" width="100%"><b>ESTADISTICA GENERAL
                                REPITIENTES
                                POR GRADO</b>

                    </tr>
                </thead>
                <tr>
                    <th width="50%" class="text-center"> Grado
                    </th>
                    <th class="text-center">V</th>
                    <th class="text-center ">H</th>
                    <th class="text-center ">T</th>

                </tr>
                <tbody class="bg-cool">
                    @foreach ($totalporgrado as $t)
                    <tr>

                        <td class="text-center ">{{ $t->grado }} {{ $t->seccion }}</td>

                        <td class="text-center ">{{ $t->sexom }}</td>
                        <td class=" text-center"> {{ $t->sexof }} </td>

                        <td class="text-center ">{{ $t->sexom + $t->sexof }}</td>
                    </tr>
                    @endforeach
                    @foreach ($totales as $tt)
                    <tr>
                        <td class="text-center ">TOTALES</td>
                        <td class="text-center ">{{ $tt->sexotm }}</td>
                        <td class="text-center ">{{ $tt->sexotf }}</td>
                        <td class="text-center ">{{ $tt->total }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </table>
    </div>

</body>

</html>