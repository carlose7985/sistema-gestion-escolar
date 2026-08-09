<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte de Morosidad WiFi</title>
    <style>
        @page {
            size: letter landscape;
            margin: 1cm;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.4;
        }

        /* Encabezado de Logos */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: none;
        }

        .header-table td {
            border: none;
            vertical-align: middle;
        }

        /* Títulos */
        .report-title {
            text-align: center;
            margin-top: 10px;
            margin-bottom: 5px;
        }

        .report-title h2 {
            font-size: 18px;
            margin: 0;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 1px;
        }

        .report-subtitle {
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        /* Resumen de totales */
        .summary-bar {
            background-color: #f8fafc;
            border-left: 4px solid #1d4ed8;
            padding: 10px 15px;
            margin-bottom: 20px;
        }

        .summary-bar span {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
            color: #475569;
        }

        /* Estilos de Tabla */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
        }

        table.main-table th {
            background-color: #0f172a;
            color: white;
            padding: 10px 5px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 0.5px solid #0f172a;
        }

        table.main-table td {
            padding: 8px 6px;
            border: 0.5px solid #cbd5e1;
            vertical-align: middle;
        }

        /* Columna de Empleado */
        .emp-name {
            font-weight: bold;
            font-size: 10px;
            color: #0f172a;
            text-transform: uppercase;
        }

        .emp-id {
            font-size: 8px;
            color: #64748b;
            font-family: 'Courier', monospace;
        }

        /* Badge de Cantidad */
        .deuda-badge {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 9px;
            display: inline-block;
        }

        /* Tags de Meses */
        .periodo-tag {
            background-color: #f1f5f9;
            color: #334155;
            padding: 2px 6px;
            margin: 2px;
            border-radius: 3px;
            border: 0.5px solid #e2e8f0;
            display: inline-block;
            font-size: 8px;
            text-transform: uppercase;
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-black {
            font-weight: 900;
        }
    </style>
</head>

<body>
    {{-- Configurar idioma español para las fechas --}}
    @php \Carbon\Carbon::setLocale('es'); @endphp

    <!-- <table class="header-table">
        <tr>
            <td style="width: 70%;">
                <img src="{{ $logoDocumento }}" style="height: 55px;" alt="Logo Documento">
            </td>
            <td style="width: 30%;" class="text-right">
                <img src="{{ $logoInstitucion }}" style="height: 55px;" alt="Logo Institución">
            </td>
        </tr>
    </table> -->

    <div class="report-title">
        <h2>Control de Morosidad WiFi</h2>
    </div>
    <div class="report-subtitle">
        Auditoría de servicios de red institucional
    </div>

    <div class="summary-bar">
        <span>Total de Personal con Saldo Pendiente: <b>{{ $afiliadosConDeuda->count() }} Casos Detectados</b></span>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th style="width: 250px;">Apellidos y Nombres / Cédula</th>
                <th style="width: 100px;">Estado de Cuenta</th>
                <th>Desglose de Meses Pendientes</th>
            </tr>
        </thead>
        <tbody>
            @foreach($afiliadosConDeuda as $afiliado)
            <tr>
                <td class="text-center" style="color: #94a3b8;">{{ $loop->iteration }}</td>
                <td>
                    <div class="emp-name">{{ $afiliado->empleados->nombres }} {{ $afiliado->empleados->apellidos }}</div>
                    <div class="emp-id">C.I: {{ $afiliado->empleados->cedula }}</div>
                </td>
                <td class="text-center">
                    <div class="deuda-badge">
                        {{ $afiliado->pagos->count() }} PERIODOS
                    </div>
                </td>
                <td>
                    @foreach($afiliado->pagos as $pago)
                    {{-- translatedFormat('F Y') pone el mes completo en español --}}
                    <span class="periodo-tag">
                        {{ \Carbon\Carbon::parse($pago->periodo_pagado)->translatedFormat('F Y') }}
                    </span>
                    @endforeach
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 30px; text-align: right; color: #94a3b8; font-size: 8px; font-style: italic;">
        Generado el: {{ \Carbon\Carbon::now()->translatedFormat('d \d\e F \d\e Y, g:i a') }}
    </div>

</body>

</html>