<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Listado de Firmas</title>
    <style>
        @page {
            size: letter portrait;
            margin: 1cm;
        }

        body {
            font-family: sans-serif;
            font-size: 10px;
            color: #1e293b;
        }

        /* Encabezado con logos */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 10px;
        }

        /* Controles */
        .control-box {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 15px;
            border: 1px dashed #64748b;
            padding: 5px;
        }

        /* Tabla principal */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th {
            background-color: #1d4ed8;
            color: white;
            padding: 8px;
            border: 1px solid #1e40af;
            font-size: 10px;
            text-transform: uppercase;
        }

        td {
            border: 1px solid #cbd5e1;
            padding: 5px;
            font-size: 12px;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }
    </style>
</head>

<body>

    <table class="header-table">
        <tr>
            <td style="text-align: left; border: none; width: 50%;">
                <img src="{{ $logoDocumento }}" style="height: 50px; max-width: 250px;" alt="Logo Doc">
            </td>
            <td style="text-align: right; border: none; width: 50%;">
                <img src="{{ $logoInstitucion }}" style="height: 50px; width: 50px;" alt="Logo Inst">
            </td>
        </tr>
    </table>

    <div class="control-box">
        CONTROL PARA: __________________________________________________________________________
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">Nro</th>
                <th class="text-left" style="width: 35%;">Nombres y Apellidos</th>
                <th style="width: 12%;">Cédula</th>
                <th style="width: 15%;">Cargo</th>
                <th style="width: 20%;">Firma</th>
                <th style="width: 13%;">Huella</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($empleado as $emp)
            <tr>
                <td class="text-center" style="height: 50px; vertical-align: middle; font-weight: bold;">{{ $suma++ }}</td>
                <td style="vertical-align: middle; font-weight: bold;">{{ $emp->nombres }} {{ $emp->apellidos }}</td>
                <td class="text-center" style="vertical-align: middle;">{{ $emp->cedula }}</td>
                <td class="text-center" style="vertical-align: middle;">{{ $emp->tipo_de_personal }}</td>
                <td></td>
                <td></td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>