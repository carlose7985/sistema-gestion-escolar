<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Listado de Recaudos por Cargo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0;
            font-size: 18px;
            color: #1e293b;
        }

        .header p {
            margin: 5px 0;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th {
            background: #1e293b;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        td {
            padding: 6px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
        }

        tr:hover {
            background-color: #f8fafc;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }

        .nro-col {
            width: 35px;
            text-align: center;
        }

        .cargo-col {
            width: 120px;
        }

        .talla-col {
            width: 50px;
            text-align: center;
            font-weight: bold;
        }

        .etiqueta-col {
            width: 100px;
            text-align: center;
        }

        .etiqueta-badge {
            background: #f3e8ff;
            padding: 2px 10px;
            border-radius: 12px;
            color: #7e22ce;
            font-weight: bold;
            font-size: 8px;
            display: inline-block;
        }

        .tipo-badge {
            background: #dbeafe;
            padding: 2px 10px;
            border-radius: 12px;
            color: #1e40af;
            font-weight: bold;
            font-size: 8px;
            display: inline-block;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>LISTADO GENERAL EMPLEADOS</h2>
        <p>Fecha: {{ date('d/m/Y H:i') }}</p>
        <p style="font-size: 9px; color: #94a3b8;">
            Total de registros: {{ $empleadosOrdenados->count() }}
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="nro-col">Nº</th>
                <th>Nombre</th>
                <th class="cargo-col">Cargo</th>
                <th>Profesión</th>
                <th class="etiqueta-col">Etiqueta</th>
                <th class="talla-col">Talla</th>
            </tr>
        </thead>
        <tbody>
            @forelse($empleadosOrdenados as $index => $emp)
            <tr>
                <td class="nro-col">{{ $index + 1 }}</td>
                <td>{{ $emp['nombre_formateado'] }}</td>
                <td class="cargo-col">{{ $emp['cargo'] }}</td>
                <td>{{ $emp['profesion'] }}</td>
                <td class="etiqueta-col">{{ $emp['etiqueta'] }}</td>
                <td class="talla-col">{{ $emp['talla'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">
                    No hay registros disponibles
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Este listado es generado automáticamente por el sistema de gestión de recaudos
    </div>
</body>

</html>