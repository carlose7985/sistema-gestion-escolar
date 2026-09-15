<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte Caja - {{ $accion->nombre }}</title>
    <style>
        @page {
            size: letter landscape;
            margin: 1cm;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }

        .reporte-container {
            width: 100%;
        }

        .tabla-layout {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 15px;
        }

        .tabla-layout td {
            vertical-align: top;
            padding: 0;
        }

        .header-left h2 {
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0;
        }

        .header-left p {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            margin: 2px 0;
        }

        .header-right {
            text-align: right;
        }

        .header-divider {
            border-bottom: 2px solid #000;
            margin-bottom: 15px;
            padding-bottom: 5px;
        }

        .titulo-seccion {
            text-align: center;
            margin-bottom: 15px;
        }

        .titulo-seccion h1 {
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            text-decoration: underline;
            margin: 0;
        }

        .status-badge {
            color: #059669;
            font-weight: bold;
        }

        .tabla-reporte {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .tabla-reporte thead th {
            background-color: #f1f5f9;
            border: 1px solid #000;
            padding: 6px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }

        .tabla-reporte tbody td {
            border: 1px solid #000;
            padding: 6px;
            text-transform: uppercase;
            font-size: 9px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .font-mono {
            font-family: monospace;
        }

        .fila-total {
            background-color: #e2e8f0;
        }

        .fila-total td {
            font-weight: 900;
            font-size: 11px;
            padding: 10px;
        }

        .tabla-firmas {
            width: 100%;
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .firma-espacio {
            width: 40%;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 5px;
        }

        .firma-gap {
            width: 20%;
        }

        .cargo {
            font-weight: 900;
            font-size: 10px;
            margin: 0;
        }

        .subtexto {
            font-size: 8px;
            color: #94a3b8;
        }

        .badge-metodo {
            display: inline-block;
            background-color: #e0e7ff;
            color: #4338ca;
            padding: 1px 8px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="reporte-container">

        <!-- ENCABEZADO -->
        <table class="tabla-layout">
            <tr>
                <td class="header-left">
                    <h2>{{ $institucion->nombre_de_la_institucion ?? 'SISTEMA ESCOLAR' }}</h2>
                    <p>Reporte de Recaudación Administrativa</p>
                </td>
                <td class="header-right">
                    <p><strong>FECHA DE CIERRE:</strong> {{ \Carbon\Carbon::parse($fechaReporte)->format('d/m/Y') }}</p>
                    <p style="color: #94a3b8;"><strong>HORA:</strong> {{ \Carbon\Carbon::parse($fechaReporte)->format('h:i A') }}</p>
                </td>
            </tr>
        </table>

        <div class="header-divider"></div>

        <!-- TÍTULO -->
        <div class="titulo-seccion">
            <h1>{{ $accion->nombre }}</h1>
            <p>ESTADO: <span class="status-badge">FINALIZADO</span></p>
            <p style="font-size: 10px; color: #64748b;">Total Empleados: {{ $totalEmpleados }}</p>
        </div>

        <!-- TABLA DE REGISTROS -->
        <table class="tabla-reporte">
            <thead>
                <tr>
                    <th width="30">#</th>
                    <th>Nombres y Apellidos</th>
                    <th width="80">Cédula</th>
                    <th width="80">Fecha Pago</th>
                    <th width="120">Método(s)</th>
                    <th width="100">Referencia(s)</th>
                    <th width="100" class="text-right">Monto Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($empleadosConPagos as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-bold">{{ $item->empleado->nombres }} {{ $item->empleado->apellidos }}</td>
                    <td class="text-center font-mono">{{ $item->empleado->cedula }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->fecha_pago)->format('d-m-Y') }}</td>
                    <td class="text-center">
                        <span class="badge-metodo">{{ $item->metodos }}</span>
                    </td>
                    <td class="text-center"><em>{{ $item->referencias ?? 'N/A' }}</em></td>
                    <td class="text-right font-bold">${{ number_format($item->monto_total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="fila-total">
                    <td colspan="6" class="text-right">TOTAL GENERAL RECAUDADO:</td>
                    <td class="text-right">${{ number_format($totalRecaudado, 2) }}</td>
                </tr>
            </tfoot>
        </table>

        <!-- FIRMAS -->
        <table class="tabla-firmas">
            <tr>
                <td class="firma-espacio">
                    <p class="cargo">Administración / Recaudador</p>
                    <p class="subtexto">Firma y Sello</p>
                </td>
                <td class="firma-gap"></td>
                <td class="firma-espacio">
                    <p class="cargo">Dirección del Plantel</p>
                    <p class="subtexto">Firma y Sello</p>
                </td>
            </tr>
        </table>

    </div>
</body>

</html>