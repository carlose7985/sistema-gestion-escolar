<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nómina por Cargo</title>
    <style>
        @page {
            size: letter landscape;
            margin: 5mm;
        }

        body {
            font-family: sans-serif;
            font-size: 10px;
            color: black;
        }

        /* Marca de agua */
        .marca-agua {
            position: fixed;
            top: 25%;
            left: 20%;
            width: 60%;
            opacity: 0.1;
            z-index: -1000;
            /* transform: rotate(-45deg); */
        }

        .header-grid {
            display: table;
            width: 100%;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .header-col {
            display: table-cell;
            font-weight: bold;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            margin-bottom: 15px;
        }

        th {
            background-color: #1d4ed8;
            color: white;
            padding: 4px;
            border: 1px solid black;
            text-transform: uppercase;
            font-size: 9px;
        }

        td {
            border: 1px solid black;
            padding: 4px;
            font-size: 10px;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .uppercase {
            text-transform: uppercase;
        }
    </style>
</head>

<body>

    <!-- <img src="{{ $logoInstitucion }}" class="marca-agua" alt="Marca de agua"> -->

    <table style="width: 100%; border: none; margin-bottom: 10px;">
        <tr>
            <td style="width: 85%; border: none; text-align: left;">
                <img src="{{ $logoDocumento }}" style="width: 500px; height: 50px;" alt="Logo Documento">
            </td>
            <td style="width: 15%; border: none; text-align: right;">
                <img src="{{ $logoInstitucion }}" style="width: 50px; height: 50px;" alt="Logo Institución">
            </td>
        </tr>
    </table>

    @foreach ($institucion as $i)
    <div class="header-grid">
        <div class="header-col">Plantel: <u>{{ $i->nombre_de_la_institucion }}</u></div>
        <div class="header-col">Dependencia: <u>{{ $i->dependencia }}</u></div>
        <div class="header-col" style="text-align: right;">Dirección: <u>{{ $i->direccion }}</u></div>
    </div>
    @endforeach

    <h3 class="text-center uppercase">Nómina General de {{ $tipo_de_personal }}s
        @foreach ($total_empleados as $r)
        &nbsp;&nbsp; Total:
        &nbsp;&nbsp; V: {{ $r->total_masculino }}
        &nbsp;&nbsp; H: {{ $r->total_femenino }}
        &nbsp;&nbsp; TOTAL: {{ $r->total_masculino + $r->total_femenino }}

        @endforeach
    </h3>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th style="text-align: left;">Nombre(s) y Apellido(s)</th>
                <th>C.I</th>
                <th>F/N</th>
                <th style="text-align: left;">Dirección</th>
                <th>Sexo</th>
                <th>Teléfono</th>
                <th style="text-align: left;">Función</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($empleados as $key => $emp)
            <tr>
                <td class="text-center">{{ $key + 1 }}</td>
                <td class="font-bold">{{ $emp->nombres }} {{ $emp->apellidos }}</td>
                <td class="text-center">{{ $emp->cedula }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($emp->fecha_de_nacimiento)->format('d-m-Y') }}</td>
                <td>{{ $emp->direccion_de_habitacion }}</td>
                <td class="text-center">{{ $emp->sexo }}</td>
                <td class="text-center">{{ $emp->telefono }}</td>
                <td>{{ $emp->funcion_en_el_plantel }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>



</body>

</html>