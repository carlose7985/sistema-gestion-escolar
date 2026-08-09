<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nómina General</title>
    <style>
        /* Sincronización de estilos para el PDF */
        @page {
            size: letter landscape;
            margin: 5mm;
        }

        body {
            font-family: sans-serif;
            font-size: 10px;
            color: black;
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

        .bg-zinc {
            background-color: #27272a;
            color: white;
        }

        .text-center {
            text-align: center;
        }

        .uppercase {
            text-transform: uppercase;
        }

        .font-bold {
            font-weight: bold;
        }

        /* Estilo para la marca de agua */
        .marca-agua {
            position: fixed;
            top: 25%;
            /* Ajusta según sea necesario para centrar verticalmente */
            left: 20%;
            /* Ajusta según sea necesario para centrar horizontalmente */
            width: 50%;

            /* Tamaño grande */
            opacity: 0.15;
            /* Transparencia tenue */
            z-index: -1000;
            /* Asegura que quede detrás de todo 
            transform: rotate(-45deg);*/
            /* Opcional: inclinación */
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

    <div class="header-grid">
        <div class="header-col">Plantel: <u>{{ $institucion[0]->nombre_de_la_institucion }}</u></div>
        <div class="header-col">Dependencia: <u>{{ $institucion[0]->dependencia }}</u></div>
        <div class="header-col" style="text-align: right;">Dirección: <u>{{ $institucion[0]->direccion }}</u></div>
    </div>

    <h3 style="text-align: center; text-transform: uppercase;">Nómina General Empleados</h3>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th style="text-align: left;">Nombre(s) y Apellido(s)</th>
                <th>Cédula</th>
                <th>Sexo</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th style="text-align: left;">Dirección</th>
                <th>Cargo</th>
                <th style="text-align: left;">Función</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($empleados as $key => $emp)
            <tr>
                <td class="text-center">{{ $key + 1 }}</td>
                <td class="font-bold">{{ $emp->nombres }} {{ $emp->apellidos }}</td>
                <td class="text-center">{{ $emp->cedula }}</td>
                <td class="text-center">{{ $emp->sexo }}</td>
                <td class="text-center">{{ $emp->age ?? '---' }}</td>
                <td class="text-center">{{ $emp->telefono }}</td>
                <td>{{ $emp->direccion_de_habitacion }}</td>
                <td class="text-center">{{ $emp->tipo_de_personal }}</td>
                <td>{{ $emp->funcion_en_el_plantel }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table>
        <thead>
            <tr class="bg-zinc">
                <th colspan="{{ $contar_las_funciones + 2 }}">Total por cargo y genero</th>
            </tr>
            <tr>
                <th>GENERO</th>
                @foreach ($reporte as $tipo => $sexos)
                <th>{{ $tipo }}</th>
                @endforeach
                <th>TOTALES</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="font-bold text-center">M</td>
                @foreach ($reporte as $sexos) <td class="text-center">{{ $sexos['M'] }}</td> @endforeach
                <td class="text-center font-bold">{{ $totalesGenerales['M'] }}</td>
            </tr>
            <tr>
                <td class="font-bold text-center">F</td>
                @foreach ($reporte as $sexos) <td class="text-center">{{ $sexos['F'] }}</td> @endforeach
                <td class="text-center font-bold">{{ $totalesGenerales['F'] }}</td>
            </tr>
            <tr style="background-color: #f1f5f9;">
                <td class="font-bold text-center">TOTAL</td>
                @foreach ($reporte as $sexos)
                <td class="text-center font-bold">{{ $sexos['F'] + $sexos['M'] }}</td>
                @endforeach
                <td class="text-center font-bold">{{ $totalesGenerales['Total'] }}</td>
            </tr>
        </tbody>
    </table>

</body>

</html>