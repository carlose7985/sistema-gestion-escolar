<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Cierre de Actividad</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 10px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0;
            text-transform: uppercase;
            color: #1e293b;
        }

        .header p {
            margin: 5px 0;
            font-weight: bold;
            color: #64748b;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 0.5pt solid #ccc;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f8fafc;
            text-transform: uppercase;
            font-size: 9px;
        }

        .signature-box {
            height: 35px;
            width: 80px;
        }

        .thumb-box {
            height: 35px;
            width: 40px;
            border: 1px dashed #ccc;
        }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #eee;
            pt: 10px;
        }

        .total {
            font-size: 12px;
            font-weight: bold;
            text-align: right;
        }

        .text-center {
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Reporte Final de Recaudación</h2>
        <!-- Cambiado: Ahora indica que es un consolidado de la actividad -->
        <p>Actividad: Cobro {{ $actividad->nombre }}</p>
        <p>Fecha de Emisión: {{ $fecha_reporte }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" width="20">#</th>
                <th class="text-center" width="60">Cédula</th>
                <th>Nombre del Empleado</th>
                <th class="text-center">Cargo</th>
                <th class="text-center" width="80">Monto Cobrado</th>
                <th class="text-center" width="80">Firma</th>
                <th class="text-center" width="40">Huella</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pagos as $index => $pago)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">{{ $pago->empleado->cedula }}</td>
                <td style="text-transform: uppercase;">
                    {{ $pago->empleado->nombres }} {{ $pago->empleado->apellidos }}
                </td>
                <td class="text-center">{{ $pago->empleado->tipo_de_personal ?? 'N/A' }}</td>
                <td class="text-center">{{ number_format($pago->monto_item + $pago->monto_transporte, 2) }} Bs.</td>
                <td class="signature-box"></td>
                <td class="thumb-box"></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <div class="total">
            TOTAL CONSOLIDADO: {{ number_format($pagos->sum('monto_item') + $pagos->sum('monto_transporte'), 2) }} Bs.
        </div>
        <p style="font-size: 8px; color: #94a3b8; margin-top: 20px;">
            Este documento representa el cierre total de la actividad cobro de "{{ $actividad->nombre }}".
            Registros totales: {{ $pagos->count() }}
        </p>
    </div>
</body>

</html>