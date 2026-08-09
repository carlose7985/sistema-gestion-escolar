<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Grado de Instrucción</title>
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

        /* Encabezado */
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
            padding: 8px;
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

        /* Estilos específicos */
        .bg-total {
            background-color: #f1f5f9;
            font-weight: bold;
        }

        .bg-green {
            background-color: #22c55e;
            color: white;
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
                <img src="{{ $logoDocumento }}" style="height: 50px; max-width: 300px;" alt="Logo Doc">
            </td>
            <td style="text-align: right; border: none; width: 50%;">
                <img src="{{ $logoInstitucion }}" style="height: 50px; width: 50px;" alt="Logo Inst">
            </td>
        </tr>
    </table>

    @if ($institucion && count($institucion) > 0)
    @foreach ($institucion as $i)
    <table style="margin-bottom: 20px;">
        <tr>
            <td style="border: none; text-align: left;">Plantel: <b><u>{{ $i->nombre_de_la_institucion }}</u></b></td>
            <td style="border: none; text-align: center;">Dependencia: <b><u>{{ $i->dependencia }}</u></b></td>
            <td style="border: none; text-align: right;">Dirección: <b><u>{{ $i->direccion }}</u></b></td>
        </tr>
    </table>
    @endforeach
    @endif

    <div class="title-box">Clasificación por Grado de Instrucción, Cargo y Género</div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="background-color: #334155;">Grado de Instrucción</th>
                @foreach ($cargos as $cargo)
                <th colspan="3">{{ $cargo }}</th>
                @endforeach
            </tr>
            <tr>
                @foreach ($cargos as $cargo)
                <th>V</th>
                <th>H</th>
                <th>T</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach ($finalTableData as $row)
            @if ($row['grado_de_intruccion'] !== 'Totales')
            <tr>
                <td class="text-left font-bold">{{ $row['grado_de_intruccion'] }}</td>
                @foreach ($cargos as $cargo)
                <td>{{ $row["{$cargo}_M"] }}</td>
                <td>{{ $row["{$cargo}_F"] }}</td>
                <td class="font-bold" style="background-color: #e2e8f0;">{{ $row["{$cargo}_T"] }}</td>
                @endforeach
            </tr>
            @endif
            @endforeach

            @php $totalsRow = collect($finalTableData)->firstWhere('grado_de_intruccion', 'Totales'); @endphp
            @if ($totalsRow)
            <tr class="bg-total">
                <td class="text-left">TOTALES GENERALES</td>
                @foreach ($cargos as $cargo)
                <td>{{ $totalsRow["{$cargo}_M"] }}</td>
                <td>{{ $totalsRow["{$cargo}_F"] }}</td>
                <td class="bg-green">{{ $totalsRow["{$cargo}_T"] }}</td>
                @endforeach
            </tr>
            @endif
        </tbody>
    </table>

</body>

</html>