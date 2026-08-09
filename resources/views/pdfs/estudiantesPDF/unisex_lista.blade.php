<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 1.5cm 1cm;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            color: #1e293b;
            font-size: 10px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .series-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .serie-block {
            flex: 1;
        }

        .serie-title {
            background: #f1f5f9;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            border: 1px solid #cbd5e1;
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        th {
            background: #0f172a;
            color: white;
            padding: 6px;
            text-transform: uppercase;
            font-size: 10px;
        }

        td {
            border: 1px solid #2d2d2d;
            padding: 6px;
            vertical-align: middle;
            font-size: 12px;
        }

        .page-break {
            page-break-after: always;
        }

        .texto-separado-amplio {
            letter-spacing: 0.1em;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>

<body>
    @foreach($seriesAgrupadasEnPares as $indicePar => $parSeries)
    <div class="header">
        <h1 style="margin:0; font-size: 18px; text-transform: uppercase;">Control de Entrega</h1>
        <p style="margin:5px 0;">
            <strong>Página {{ $loop->iteration }}</strong>
        </p>
    </div>

    @if ($institucion && count($institucion) > 0)
    <div id="header">
        @foreach ($institucion as $i)
        <table style="border: none; border-collapse: collapse; width: 100%;">
            <tr>
                <td class="text-left text-10" style="border: none; padding: 4px;">
                    Plantel:&nbsp; <b><u>{{ $i->nombre_de_la_institucion }}</u></b>
                </td>
                <td class="text-left text-10" style="border: none; padding: 4px;">
                    Dirección:&nbsp; <b><u>{{ $i->direccion }}</u></b>
                </td>
                <td class="text-left text-10" style="border: none; padding: 4px;">
                    Parroquia:&nbsp; <b><u>{{ $i->parroquia }}</u></b>
                </td>
            </tr>
        </table>
        @endforeach
    </div>
    @else
    <center>
        <b>Los datos de la INSTITUCION no están disponibles.</b>
    </center>
    @endif

    <div class="series-container">
        @foreach($parSeries as $serie => $items)
        <div class="serie-block">
            <div class="serie-title">SERIE TERMINACIÓN: {{ $serie }}</div>

            <table>
                <thead>
                    <tr>
                        <th>Responsable Directo</th>
                        <th>Responsable Alterno</th>
                        <th>Retiro?</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($items as $reg)
                    @php
                    // Obtener datos desde la relación estudiante
                    $estudiante = $reg->estudiante;
                    $representante = $estudiante ? $estudiante->representante : null;
                    $padre = $estudiante ? $estudiante->padre : null;
                    @endphp
                    <tr>
                        <td style="width: 40%;">
                            @if($representante)
                            {{ $representante->name_r }}<br>
                            <small class="texto-separado-amplio">C.I: {{ $representante->cedula_r }}</small>
                            @else
                            <small style="color: #cbd5e1;">No asignado</small>
                            @endif
                        </td>
                        <td style="width: 40%;">
                            @if($padre)
                            {{ $padre->name_r }}<br>
                            <small class="texto-separado-amplio">C.I: {{ $padre->cedula_r }}</small>
                            @else
                            <small style="color: #cbd5e1;">N/A</small>
                            @endif
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endforeach
    </div>

    {{-- Salto de página después de cada par de series --}}
    @if (!$loop->last)
    <div class="page-break"></div>
    @endif
    @endforeach

    <div class="footer">
        Generado el {{ date('d/m/Y h:i A') }} - Sistema Core Edition
    </div>
</body>

</html>