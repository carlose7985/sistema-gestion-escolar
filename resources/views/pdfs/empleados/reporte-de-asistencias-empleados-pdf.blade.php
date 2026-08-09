<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control de Asistencias {{ $tipo_de_personal }}s</title>
    <style>
        @page {
            margin: 0.7cm 0.4cm 1.0cm 0.4cm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #333;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: -1.2cm;
            width: 100%;
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

        .text-13 {
            font-size: 13pt !important;
        }

        .text-14 {
            font-size: 14pt !important;
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

        .uppercase {
            text-transform: uppercase;
        }

        .font-bold {
            font-weight: bold;
        }

        .font-semibold {
            font-weight: 600;
        }

        .table-header {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 8px;
        }

        .table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 4px;
        }

        .table-header-a td {
            padding: 1px 0;
        }

        .header-logo {
            border-bottom: 2px solid #222;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }

        .title-section {
            background-color: #f5f5f5;
            padding: 6px 0;
            margin: 10px 0;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }

        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            font-size: 9.5pt;
            margin-top: 12px;
            border: 2px solid black;
        }

        .attendance-table thead th {
            background-color: #f8f9fa;
            border: 1px solid black;
            padding: 4px 2px;
            font-weight: 600;
            text-align: center;
            vertical-align: middle;
        }

        .attendance-table thead th:first-child {
            width: 3%;
        }

        .attendance-table thead th:nth-child(2) {
            width: 28%;
            text-align: left;
        }

        .attendance-table thead th.day-header {
            font-size: 8.5pt;
            padding: 2px 1px;
            line-height: 1.1;
        }

        .attendance-table tbody td {
            padding: 3px 2px;
            border: 1px solid black;
            vertical-align: middle;
            text-align: center;
        }

        .attendance-table tbody td:first-child {
            font-weight: 500;
            background-color: #fafafa;
        }

        .attendance-table tbody td:nth-child(2) {
            text-align: left;
            padding-left: 5px;
            font-size: 9pt;
        }

        .attendance-table tbody tr:hover {
            background-color: #fafafa;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            font-size: 9pt;
            font-weight: 700;
            margin: 0 auto;
            text-align: center;
        }

        .status-asistio {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
        }

        .status-falto {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
        }

        .status-permiso {
            background-color: #e3f2fd;
            color: #1565c0;
            border: 1px solid #bbdefb;
        }

        .status-none {
            font-size: 7pt;
            color: #666;
            font-weight: 600;
            display: inline-block;
            line-height: 18px;
        }

        .total-column {
            background-color: #f5f5f5;
            font-weight: 700;
            font-size: 10pt;
        }

        .day-number {
            display: block;
            font-size: 9.5pt;
            font-weight: 600;
            margin-top: 1px;
        }

        .day-name {
            display: block;
            font-size: 8pt;
            color: #555;
            text-transform: capitalize;
        }

        .empty-state {
            margin-top: 80px;
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 11pt;
        }

        .empty-state b {
            color: #444;
            font-size: 12pt;
        }

        .separator {
            height: 1px;
            background: linear-gradient(to right, transparent, #ccc, transparent);
            margin: 8px 0;
        }

        .institution-info {
            font-size: 10.5pt;
            margin-bottom: 8px;
        }

        .institution-info u {
            text-decoration: none;
            border-bottom: 1px dotted #666;
        }

        @media print {
            .attendance-table {
                border-color: #000 !important;
            }
        }
    </style>
</head>

<body>
    <div>
        <!-- Encabezado -->
        <div id="header">
            <table class="table-header" border="0">
                <tr>
                    <td width="100%" class="header-logo">
                        <img src="{{ $logoDocumento }}" alt="Logo" width="100%" height="38px">
                    </td>
                </tr>
            </table>

            <div class="title-section text-center">
    <b class="uppercase text-13">CONTROL DE ASISTENCIA {{ $tipo_de_personal }}S</b>
    <br>
    <span class="text-11">
        {{ ucfirst(Carbon\Carbon::createFromDate($year, $month, 1)->locale('es')->monthName) }} {{ $year }}
    </span>
</div>
        </div>

        <!-- Información de la Institución -->
        @if ($institucion && count($institucion) > 0)
        @foreach ($institucion as $i)
        <div class="institution-info">
            <table class="table-header-a" border="0">
                <tr>
                    <td class="text-left">
                        <span class="font-semibold">Plantel:</span>
                        <u>{{ $i->nombre_de_la_institucion }}</u>
                    </td>
                    <td class="text-center">
                        <span class="font-semibold">Dependencia:</span>
                        <u>{{ $i->dependencia }}</u>
                    </td>
                    <td class="text-right">
                        <span class="font-semibold">Dirección:</span>
                        <u>{{ $i->direccion }}, {{ $i->municipio }}, {{ $i->parroquia }}</u>
                    </td>
                </tr>
            </table>
            <div class="separator"></div>
        </div>
        @endforeach
        @else
        <div class="empty-state">
            <b>Los datos de la INSTITUCIÓN no están disponibles. Debe registrarlos en el módulo DATOS BÁSICOS.</b>
        </div>
        @endif

        <!-- Tabla de Asistencias -->
        @if ($asistencia_existe_int >= 1 && $fecha_existe_int >= 1)
        <table class="attendance-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Apellidos y Nombres</th>
                    @foreach ($dates as $date)
                    <th class="day-header">
                        <span class="day-name">
                            {{ ucfirst(mb_strtolower($date->locale('es')->shortDayName, 'UTF-8')) }}
                        </span>
                        <span class="day-number">
                            {{ sprintf('%02d', $date->day) }}
                        </span>
                    </th>
                    @endforeach
                    <th class="total-column">A</th>
                    <th class="total-column">F</th>
                    <th class="total-column">P</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($attendanceData as $key => $data)
                <tr>
                    <td>{{ $key + 1 }}</td>

                    <!-- CELDA DE NOMBRE CON LA INICIAL AGREGADA -->
                    <td>
                        @php
                        $nombresArray = explode(' ', $data['empleado']->nombres);
                        $primerNombre = '';

                        if (!empty($nombresArray)) {
                        $primerNombre = $nombresArray[0];
                        if (strcasecmp($primerNombre, 'Del') === 0 && isset($nombresArray[1])) {
                        $primerNombre .= ' ' . $nombresArray[1];
                        }
                        }

                        $apellidosArray = explode(' ', $data['empleado']->apellidos);
                        $primerApellido = $apellidosArray[0] ?? '';
                        @endphp

                        <span class="font-semibold text-11">
                            {{ $primerNombre }} {{ $primerApellido }}

                            {{-- AQUÍ MOSTRAMOS LA INICIAL SI EXISTE (SOLO PARA VIGILANTES) --}}
                            @if(!empty($data['inicial_cargo']))
                            <strong style="margin-left: 3px; font-size: 8pt; color: #444;">({{ $data['inicial_cargo'] }})</strong>
                            @endif
                        </span>
                    </td>

                    @foreach ($dates as $date)
                    <td>
                        @if (isset($data['attendance'][$date->toDateString()]))
                        @if ($data['attendance'][$date->toDateString()] == 'Asistio')
                        <div class="status-indicator status-asistio" title="Asistió">A</div>
                        @elseif ($data['attendance'][$date->toDateString()] == 'Falto')
                        <div class="status-indicator status-falto" title="Faltó">F</div>
                        @elseif ($data['attendance'][$date->toDateString()] == 'Permiso')
                        <div class="status-indicator status-permiso" title="Permiso">P</div>
                        @elseif ($data['attendance'][$date->toDateString()] == 'Nuevo Ingreso')
                        <span class="status-none" title="Nuevo Ingreso">**</span>
                        @else
                        {{ $data['attendance'][$date->toDateString()] }}
                        @endif
                        @else
                        &nbsp;
                        @endif
                    </td>
                    @endforeach

                    <td class="total-column">{{ $data['totals']['asistio'] }}</td>
                    <td class="total-column">{{ $data['totals']['falto'] }}</td>
                    <td class="total-column">{{ $data['totals']['permiso'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @elseif ($asistencia_existe_int >= 1 && $fecha_existe_int == 0)
        <div class="empty-state">
            <b>No hay asistencia para mostrar en
                {{ Carbon\Carbon::createFromDate($year, $month, 1)->locale('es')->monthName }}
                del {{ $year }}.</b>
        </div>
        @else
        <div class="empty-state">
            <b>No hay asistencia para mostrar de este tipo de empleado.</b>
        </div>
        @endif
    </div>
</body>

</html>