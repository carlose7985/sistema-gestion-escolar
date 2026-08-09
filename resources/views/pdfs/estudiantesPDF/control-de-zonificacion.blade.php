<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control de Zonificacion</title>

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
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciamos contador por sección --}}

        <div id="header">
            <table class="table-header" border="0">
                <tr>
                    <td class="text-center text-12">
                        <b>CONTROL DE ZONIFICACION {{ $grado->nombre_del_grado }} {{ $grado->seccion }}</b>
                        <div style="font-size: 10pt; font-weight: bold; margin-top: 3px;">
                            PERIODO ESCOLAR: 
                            {{ $periodo_escolar_actual }}
                           
                        </div>

                    </td>
                </tr>
            </table>
        </div>

        <div class="container">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black; line-height: 18px;" border="1">
                <thead>
                    <tr>
                        <th class="text-center" width="5%">Nro</th>
                        <th class="text-left" width="40%">Nombres y Apellidos</th>
                        <th class="text-center">Institución</th>
                        <th class="text-center">Firma autorizado</th>
                        <th class="text-center" width="10%">Va a Grado?</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_listado as $student)
                    <tr>
                        <td class="text-center spacin">{{ $suma++ }}</td>
                        <td class="text-left spacin">&nbsp;{{ $student->name }} {{ $student->apellido }}</td>
                        <td class="text-left spacin"></td>
                        <td class="text-left spacin"></td>
                        <td class="text-left spacin"></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>