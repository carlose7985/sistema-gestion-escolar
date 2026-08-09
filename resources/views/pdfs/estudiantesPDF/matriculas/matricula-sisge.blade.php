<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matriculación General SISGE</title>
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
    </style>
</head>

<body>

    <div id="header">
        @include('pdfs/estudiantesPDF/header')
        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>MATRICULACIÓN SISTEMA SISGE</b></td>
            </tr>
        </table>
    </div>

    <div class="container">

        <!-- TABLA 1: TOTAL MATRICULADOS POR GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="3" width="100%"><b>TOTAL MATRICULADOS POR GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            {{-- 🔥 $sm es un objeto, no una colección --}}
            <tr>
                <td class="text-center">
                    {{ $sm->totalmatriM ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $sm->totalm ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $sm->totalmatriF ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $sm->totalf ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $sm->totalmatri ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $sm->total ?? 0 }}
                </td>
            </tr>
        </table>

        <br>

        <!-- TABLA 2: TOTAL MATRICULADOS POR GRADO Y GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="4" width="100%"><b>TOTAL MATRICULADOS POR GRADO Y GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>GRADO</b></td>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            @foreach ($sfg as $r)
            <tr>
                <td class="text-center">{{ $r->grado }}</td>
                <td class="text-center">
                    {{ $r->totalmatriMg ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->sexom ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $r->totalmatriFg ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->sexof ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $r->totalmatrig ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->totalmf ?? 0 }}
                </td>
            </tr>
            @endforeach
        </table>

        <br>

        <!-- TABLA 3: TOTAL MATRICULADOS POR GRADO, SECCIÓN Y GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="4" width="100%"><b>TOTAL MATRICULADOS POR GRADO, SECCIÓN Y GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>GRADO Y SECCIÓN</b></td>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            @foreach ($smg as $r)
            <tr>
                <td class="text-center">{{ $r->grado }} {{ $r->seccion }}</td>
                <td class="text-center">
                    {{ $r->totalmatriMgs ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->sexosm ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $r->totalmatriFgs ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->sexosf ?? 0 }}
                </td>
                <td class="text-center">
                    {{ $r->totalmatrigs ?? 0 }}&nbsp;&nbsp;&nbsp;de&nbsp;&nbsp;&nbsp;{{ $r->totals ?? 0 }}
                </td>
            </tr>
            @endforeach
        </table>

        <br>

        <!-- TABLA 4: NO MATRICULADOS POR GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="3" width="100%"><b>NO MATRICULADOS POR GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            <tr>
                <td class="text-center">{{ ($sm->totalm ?? 0) - ($sm->totalmatriM ?? 0) }}</td>
                <td class="text-center">{{ ($sm->totalf ?? 0) - ($sm->totalmatriF ?? 0) }}</td>
                <td class="text-center">{{ ($sm->total ?? 0) - ($sm->totalmatri ?? 0) }}</td>
            </tr>
        </table>

        <br>

        <!-- TABLA 5: NO MATRICULADOS POR GRADO Y GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="4" width="100%"><b>NO MATRICULADOS POR GRADO Y GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>GRADO</b></td>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            @foreach ($sfg as $r)
            <tr>
                <td class="text-center">{{ $r->grado }}</td>
                <td class="text-center">{{ ($r->sexom ?? 0) - ($r->totalmatriMg ?? 0) }}</td>
                <td class="text-center">{{ ($r->sexof ?? 0) - ($r->totalmatriFg ?? 0) }}</td>
                <td class="text-center">{{ ($r->totalmf ?? 0) - ($r->totalmatrig ?? 0) }}</td>
            </tr>
            @endforeach
        </table>

        <br>

        <!-- TABLA 6: NO MATRICULADOS POR GRADO, SECCIÓN Y GENERO -->
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="4" width="100%"><b>NO MATRICULADOS POR GRADO, SECCIÓN Y GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>GRADO Y SECCIÓN</b></td>
                <td class="text-center text-12"><b>VARONES</b></td>
                <td class="text-center text-12"><b>HEMBRAS</b></td>
                <td class="text-center text-12"><b>TOTAL</b></td>
            </tr>
            @foreach ($smg as $r)
            <tr>
                <td class="text-center">{{ $r->grado }} {{ $r->seccion }}</td>
                <td class="text-center">{{ ($r->sexosm ?? 0) - ($r->totalmatriMgs ?? 0) }}</td>
                <td class="text-center">{{ ($r->sexosf ?? 0) - ($r->totalmatriFgs ?? 0) }}</td>
                <td class="text-center">{{ ($r->totals ?? 0) - ($r->totalmatrigs ?? 0) }}</td>
            </tr>
            @endforeach
        </table>

        <br>
    </div>

</body>

</html>