<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Clasificación por Cargo</title>
    <style>
        @page {
            size: letter landscape;
            margin: 1cm;
        }

        body {
            font-family: sans-serif;
            font-size: 10px;
            color: #1e293b;
        }

        /* Encabezados y Layout */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 10px;
        }

        .title-box {
            background-color: #1d4ed8;
            color: white;
            top: 5px;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            margin: 15px 0;
            border-radius: 4px;
        }

        /* Tablas */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th {
            background-color: #1d4ed8;
            color: white;
            padding: 6px;
            border: 1px solid #1e40af;
            font-size: 9px;
            text-transform: uppercase;
        }

        td {
            border: 1px solid #cbd5e1;
            padding: 5px;
            font-size: 10px;
            text-align: center;
        }

        /* Clases utilitarias */
        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .bg-light {
            background-color: #f8fafc;
        }

        .font-bold {
            font-weight: bold;
        }
    </style>
</head>

<body>

    <table class="header-table" style="border-bottom: 2px solid #1d4ed8; padding-bottom: 10px;">
        <tr>
            <td style="text-align: left; border: none; width: 50%;">
                <img src="{{ $logoDocumento }}" style="height: 50px; max-width: 300px;" alt="Logo Documentos">
            </td>
            <td style="text-align: right; border: none; width: 50%;">
                <img src="{{ $logoInstitucion }}" style="height: 50px; width: 50px;" alt="Logo Institución">
            </td>
        </tr>
    </table>

    @if ($institucion && count($institucion) > 0)
    <table>
        <tr>
            @foreach ($institucion as $i)

            <td style="border: none; text-align: left;">Plantel: <b><u>{{ $i->nombre_de_la_institucion }}</u></b></td>
            <td style="border: none; text-align: center;">Dependencia: <b><u>{{ $i->dependencia }}</u></b></td>
            <td style="border: none; text-align: right;">Dirección: <b><u>{{ $i->direccion }}</u></b></td>

            @endforeach
        </tr>
    </table>
    @endif
    <div class="title-box">REPORTE CLASIFICADOS POR CARGO, FUNCION Y STATUS</div>

    <div class="title-box">Total General de Empleados</div>
    <table>
        <tr>
            <th>Masculino</th>
            <th>Femenino</th>
            <th>Total</th>
        </tr>
        <tr class="bg-light">
            <td class="font-bold">{{ $totalesGeneralesporcargo['M'] }}</td>
            <td class="font-bold">{{ $totalesGeneralesporcargo['F'] }}</td>
            <td class="font-bold">{{ $totalesGeneralesporcargo['Total'] }}</td>
        </tr>
    </table>

    <div class="title-box">Clasificación por Cargo y Género</div>
    <table>
        <tr>
            <th>Género</th>
            @foreach ($reportes as $tipo => $sexos) <th>{{ $tipo }}</th> @endforeach
        </tr>
        <tr>
            <td class="font-bold">M</td>
            @foreach ($reportes as $sexos) <td>{{ $sexos['M'] }}</td> @endforeach
        </tr>
        <tr>
            <td class="font-bold">F</td>
            @foreach ($reportes as $sexos) <td>{{ $sexos['F'] }}</td> @endforeach
        </tr>
        <tr class="bg-light font-bold">
            <td>TOTAL</td>
            @foreach ($reportes as $sexos) <td>{{ $sexos['F'] + $sexos['M'] }}</td> @endforeach
        </tr>
    </table>

    <div class="title-box">Clasificación por Función y Género</div>
    <table>
        <thead>
            <tr>
                <th>Género</th>
                @foreach ($reporte as $funcion => $sexo) <th>{{ $funcion }}</th> @endforeach
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="font-bold">M</td>
                @foreach ($reporte as $sexo) <td>{{ $sexo['M'] }}</td> @endforeach
            </tr>
            <tr>
                <td class="font-bold">F</td>
                @foreach ($reporte as $sexo) <td>{{ $sexo['F'] }}</td> @endforeach
            </tr>
            <tr class="bg-light font-bold">
                <td>TOTAL</td>
                @foreach ($reporte as $sexo) <td>{{ $sexo['F'] + $sexo['M'] }}</td> @endforeach
            </tr>
        </tbody>
    </table>

</body>

</html>