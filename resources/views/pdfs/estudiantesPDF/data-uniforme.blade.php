<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
        }

        th,
        td {
            border: 1px solid #000;
            text-align: center;
            padding: 4px 1px;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
        }

        .label {
            text-align: left;
            padding-left: 5px;
            font-weight: bold;
            width: 100px;
        }

        .title {
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
    </style>
</head>

<body>

    <div class="title">CAMISA</div>
    <table>
        <thead>
            <tr>
                <th style="width: 120px;">TALLAS</th>
                @foreach($tallasCamisaPantalon as $t) <th>{{ $t }}</th> @endforeach
                <th>TOTAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="label">BLANCA</td>
                @foreach($tallasCamisaPantalon as $t)
                <td>{{ $dataCamisa['BLANCA'][$t] ?? 0 }}</td>
                @endforeach
                <td>{{ array_sum($dataCamisa['BLANCA']) }}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td class="label">TOTAL</td>
                @foreach($tallasCamisaPantalon as $t)
                <td>{{ $dataCamisa['BLANCA'][$t] ?? 0 }}</td>
                @endforeach
                <td>{{ array_sum($dataCamisa['BLANCA']) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="title">PANTALÓN / MONO</div>
    <table>
        <thead>
            <tr>
                <th style="width: 120px;">TALLAS</th>
                @foreach($tallasCamisaPantalon as $t)
                @if(in_array($t, ['2','4','6','8','10','12','14','16','S','M']))
                <th>{{ $t }}</th>
                @endif
                @endforeach
                <th>TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach(['VARONES', 'HEMBRAS'] as $sexo)
            <tr>
                <td class="label">{{ $sexo }}</td>
                @foreach($tallasCamisaPantalon as $t)
                @if(in_array($t, ['2','4','6','8','10','12','14','16','S','M']))
                <td>{{ $dataPantalon[$sexo][$t] ?? 0 }}</td>
                @endif
                @endforeach
                <td>{{ array_sum($dataPantalon[$sexo]) }}</td>
            </tr>
            @endforeach
            <tr style="font-weight: bold;">
                <td class="label">TOTAL</td>
                @foreach($tallasCamisaPantalon as $t)
                @if(in_array($t, ['2','4','6','8','10','12','14','16','S','M']))
                <td>{{ ($dataPantalon['VARONES'][$t] ?? 0) + ($dataPantalon['HEMBRAS'][$t] ?? 0) }}</td>
                @endif
                @endforeach
                <td>{{ array_sum($dataPantalon['VARONES']) + array_sum($dataPantalon['HEMBRAS']) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="title">ZAPATOS</div>
    <table>
        <thead>
            <tr>
                <th style="width: 120px;">TALLAS</th>
                @foreach($tallasZapatos as $t) <th>{{ $t }}</th> @endforeach
                <th>TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach(['VARONES', 'HEMBRAS'] as $sexo)
            <tr>
                <td class="label">{{ $sexo }}</td>
                @foreach($tallasZapatos as $t)
                <td>{{ $dataZapatos[$sexo][$t] ?? 0 }}</td>
                @endforeach
                <td>{{ array_sum($dataZapatos[$sexo]) }}</td>
            </tr>
            @endforeach
            <tr style="font-weight: bold;">
                <td class="label">TOTAL</td>
                @foreach($tallasZapatos as $t)
                <td>{{ ($dataZapatos['VARONES'][$t] ?? 0) + ($dataZapatos['HEMBRAS'][$t] ?? 0) }}</td>
                @endforeach
                <td>{{ array_sum($dataZapatos['VARONES']) + array_sum($dataZapatos['HEMBRAS']) }}</td>
            </tr>
        </tbody>
    </table>

</body>

</html>