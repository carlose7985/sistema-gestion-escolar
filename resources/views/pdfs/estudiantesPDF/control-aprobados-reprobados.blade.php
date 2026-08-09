<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Estudiantil</title>
    <style>
        @page {
            margin: 0.5cm 1.5cm 0.5cm 1.5cm;
        }

        /* Salto de página para el modo masivo */
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
            margin-top: 60px;
            margin-bottom: 10px;
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.5cm;
        }

        table.table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.6cm;
        }

        td {
            font-size: 10pt;
        }

        th {
            font-size: 12pt;
        }

        table.table-footer {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            line-height: 0.8cm;
        }

        .logo {
            position: absolute;
            left: 0;
            top: 0;
            width: 250px;
            height: 50px;
        }
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciamos contador por cada grado --}}

        <div id="header">
            <img src="{{ $logoDocumento }}" class="logo">
            <table class="table-header" border="0">
                <tr>
                    <td class="text-center text-12">
                        <b>CONTROL APROBADOS-REPROBADOS {{ $grado->nombre_del_grado }} {{ $grado->seccion }}</b>
                    </td>
                </tr>
            </table>
        </div>

        <div class="container">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black; line-height: 18px;" border="1">
                <thead>
                    <tr>
                        <th class="text-center" width="5%">Nro</th>
                        <th class="text-left" width="45%">Nombres y Apellidos</th>
                        <th class="text-center" >Apreciación Final</th>
                        <th class="text-center" width="30%">Firma Representante</th>
                      
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_listado as $student)
                    <tr>
                        <td class="text-center">{{ $suma++ }}</td>
                        <td class="text-left">&nbsp;{{ $student->name }} {{ $student->apellido }} </td>
                        <td></td>
                        <td></td>
                      

                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>


        <div style="margin-top:5px">

            <small><b>Formato escala: APROBADOS(A, B, C, D) REPROBADOS(E, Inasistente)</b></small>
        </div>
    </div>
    @endforeach
</body>

</html>