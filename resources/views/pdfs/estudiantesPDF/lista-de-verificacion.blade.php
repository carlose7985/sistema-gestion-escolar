<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Verificación Masiva</title>
    <style>
        @page {
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }

        /* Estilo para el salto de página masivo */
        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: avoid;
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
    </style>
</head>

<body>
    @foreach ($grados as $grado)
    <div class="page-break">
        @php $suma = 1; @endphp {{-- Reiniciamos contador para cada grado --}}

        <div id="header">
            <table class="table-header-a" border="0">
                  <tr>
                    <td class="text-center" colspan="3" width="100%">LISTADO DE VERIFICACION</u></b></td>

                </tr>
                <tr>
                    <td class="text-left">Grado: <b><u>&nbsp;{{ $grado->nombre_del_grado }}</u></b></td>
                    <td class="text-center">Sección: <b><u>&nbsp;{{ $grado->seccion }}</u></b></td>
                    <td class="text-right">Alumnos de la Sección: <b><u>T: {{ $grado->mgeneral }} M: {{ $grado->mgeneralM }} F: {{ $grado->mgeneralF }}</u></b></td>
                </tr>
              
            </table>
        </div>

        <div class="container">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;" border="1">
                <thead>
                    <tr>
                        <th rowspan="2">Nro</th>
                        <th rowspan="2">Sexo</th>
                        <th rowspan="2">Nombres</th>
                        <th rowspan="2">Apellidos</th>
                        <th rowspan="2">Cédula de identidad</th>
                        <th colspan="3">F/N</th>
                        <th rowspan="2">Edad</th>
                        <th colspan="2">Esc.</th>
                    </tr>
                    <tr>
                        <th>D</th>
                        <th>M</th>
                        <th>A</th>
                        <th>RG</th>
                        <th>RP</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($grado->estudiantes_listado as $students)
                    <tr>
                        <td class="text-center">{{ $suma++ }}</td>
                        <td class="text-center">{{ $students->sexo }}</td>
                        <td class="text-left">&nbsp;{{ $students->name }}</td>
                        <td class="text-left">&nbsp;{{ $students->apellido }}</td>
                        <td class="text-center">{{ $students->documento }} {{ $students->cedula }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('d') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('m') }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($students->fecha_de_nacimiento)->format('Y') }}</td>
                        <td class="text-center">{{ $students->age }}</td>

                        <td class="text-center">{{ ($students->condicion == 'Regular') ? 'X' : '' }}</td>
                        <td class="text-center">{{ ($students->condicion == 'Repitiente') ? 'X' : '' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach
</body>

</html>