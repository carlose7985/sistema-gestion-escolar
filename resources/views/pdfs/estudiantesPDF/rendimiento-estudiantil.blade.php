<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: letter landscape;
            margin: 1cm 1.2cm;
        }

        /* Salto de página masivo */
        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: avoid;
        }

        * {
            box-sizing: border-box;            
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 7.5pt;
            line-height: 1;
            margin: 0;
            padding: 0;
        }

        .titulo {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        table.rendimiento-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        table.rendimiento-table th,
        table.rendimiento-table td {
            border: 0.5pt solid #000;
            padding: 2px 1px;
            height: 15px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .col-nro {
            width: 3%;
        }

        .col-nombre {
            width: 22%;
        }

        .col-eval {
            width: 3.5%;
        }

        .area-titulo {
            background-color: #e9e9e9 !important;
            font-size: 7pt;
            font-weight: bold;
        }

        .subheader {
            background-color: #f5f5f5 !important;
            font-size: 6pt;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
            padding-left: 3px !important;
        }

        tbody tr:nth-child(even) {
            background-color: #fafafa;
        }
    </style>
</head>

<body>
    @foreach($grados as $grado)
    <div class="page-break">
        <div class="titulo">
            RENDIMIENTO ESTUDIANTIL - {{ $grado->nombre_del_grado ?? '' }} {{ $grado->seccion ?? '' }}
        </div>

        <table class="rendimiento-table">
            <thead>
                <tr>
                    <th rowspan="2" class="col-nro area-titulo">N°</th>
                    <th rowspan="2" class="col-nombre area-titulo">NOMBRE Y APELLIDO</th>
                    <th colspan="3" class="area-titulo">LECTURA</th>
                    <th colspan="3" class="area-titulo">ESCRITURA</th>
                    <th colspan="3" class="area-titulo">DICTADO</th>
                    <th colspan="3" class="area-titulo">SUMA</th>
                    <th colspan="3" class="area-titulo">RESTA</th>
                    <th colspan="3" class="area-titulo">MULTIPLICACIÓN</th>
                    <th colspan="3" class="area-titulo">DIVISIÓN</th>
                </tr>
                <tr>
                    @for($i=0; $i<7; $i++)
                        <th class="subheader col-eval">I</th>
                        <th class="subheader col-eval">P</th>
                        <th class="subheader col-eval">C</th>
                        @endfor
                </tr>
            </thead>
            <tbody>
                @foreach ($grado->estudiantes_listado as $index => $student)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-left">
                        {{ mb_strtoupper(explode(' ', trim($student->name))[0] . ' ' . explode(' ', trim($student->apellido))[0]) }}
                    </td>
                    @for ($i = 0; $i < 21; $i++) <td>
                        </td> @endfor
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endforeach
</body>

</html>