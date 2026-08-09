<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Directorio</title>
    <style>
        @page {
            margin: 0.5cm 0.5cm 0.5cm 0.5cm;
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

        .container {
            margin-top: 10px;
        }

        b {
            color: #454545;
        }
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciamos contador por sección --}}

        @if ($institucion && count($institucion) > 0)
        <div id="header">
            <table class="table-header" border="0">
                <tr>
                    <td class="text-center" width="100%">
                        <big><b>DIRECTORIO DE PADRES Y REPRESENTANTES</b></big>
                    </td>
                </tr>
            </table>

            @foreach ($institucion as $i)
            <table class="table-header-a" border="0">
                <tr>
                    <td class="text-left text-10">Plantel:&nbsp; <b><u>{{ $i->nombre_de_la_institucion }}</u></b></td>
                    <td class="text-left text-10">Dirección:&nbsp; <b><u>{{ $i->direccion }}</u></b></td>
                    <td class="text-left text-10">Parroquia:&nbsp; <b><u>{{ $i->parroquia }}</u></b></td>
                    <td class="text-right text-10">Grado:&nbsp;<b><u>{{ $grado->nombre_del_grado }} {{ $grado->seccion }}</u></b></td>
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
                        <th width="5%">Nro</th>
                        <th width="30%">Alumno(a)</th>
                        <th width="30%">Representante</th>
                        <th width="20%">Dirección de H.</th>
                        <th width="15%">Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_directorio as $students)
                    <tr>
                        <td class="text-center">{{ $suma++ }}</td>
                        <td class="text-left">&nbsp; {{ $students->name }} {{ $students->apellido }}</td>
                        <td class="text-left">&nbsp;{{ $students->name_r }} <small class="ml-2 mr-2">C.I.{{ $students->cedula_r }}</small> </td>
                        <td class="text-center">{{ $students->direccion_r }}</td>
                        <td class="text-center">{{ $students->telefono_r }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>