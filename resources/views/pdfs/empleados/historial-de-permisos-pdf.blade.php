<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Permisos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 10pt;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 18pt;
            color: #333;
        }

        .header h2 {
            margin: 5px 0 15px 0;
            font-size: 14pt;
            color: #555;
        }

        .header p {
            margin: 2px 0;
            font-size: 10pt;
            color: #666;
        }

        .employee-info {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }

        .employee-info p {
            margin: 5px 0;
            font-size: 11pt;
        }

        .table-container {
            margin-top: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 9pt;
        }

        td {
            font-size: 9pt;
        }

        .no-records {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #777;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 8pt;
            color: #888;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 250px;
            margin: 60px auto 10px auto;
            text-align: center;
            padding-top: 5px;
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
    </style>
</head>

<body>
    <div class="header">
        @if ($institucion)
        <h1>{{ $institucion->nombre_de_la_institucion ?? 'Nombre de la Institución' }}</h1>
        <h2>Dirección: {{ $institucion->direccion ?? 'Dirección de la Institución' }}</h2>
        <p>Teléfono: {{ $institucion->telefono ?? 'N/A' }} | Email: {{ $institucion->email ?? 'N/A' }}</p>
        @else
        <h1>Nombre de la Institución</h1>
        <h2>Dirección de la Institución</h2>
        <p>Teléfono: N/A | Email: N/A</p>
        @endif
        <hr>
        <h3>REPORTE DE HISTORIAL DE PERMISOS </h3>
        <h3>{{ strtoupper($tipo) }}ES</h3>
        <p>Fecha de Emisión: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    </div>

    {{-- Los datos del empleado se recuperan directamente del objeto $empleado --}}
    @if ($empleado) {{-- Aseguramos que el objeto empleado exista --}}
    <div class="employee-info">
        <p><strong>Empleado:</strong> {{ $empleado->nombres }} {{ $empleado->apellidos }}</p>
        <p><strong>Cédula:</strong> {{ $empleado->cedula }}</p>
        <p><strong>Cargo:</strong> {{ $empleado->tipo_de_personal ?? 'N/A' }}</p> {{-- Agregado ?? 'N/A' por si el cargo puede ser nulo --}}
        <p><strong>Situación Laboral:</strong> {{ $empleado->situacion_laboral ?? 'N/A' }}</p> {{-- Agregado ?? 'N/A' --}}
    </div>
    @endif

    @if ($permisos->isNotEmpty())
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Fecha de Inicio</th>
                    <th>Fecha Final</th>
                    <th>Días</th>
                    <th>Motivo</th>
                    <th>Status</th>
                    <th>Fecha de Registro</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($permisos as $permiso)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($permiso->fecha_de_inicio)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($permiso->fecha_final)->format('d/m/Y') }}</td>
                    <td class="text-center">
                        @php
                        $inicio = \Carbon\Carbon::parse($permiso->fecha_de_inicio);
                        $fin = \Carbon\Carbon::parse($permiso->fecha_final);
                        echo $inicio->diffInDays($fin);
                        @endphp
                    </td>
                    <td>{{ $permiso->descripcion }}</td>
                    <td>{{ $permiso->status }}</td>

                    <td>{{ \Carbon\Carbon::parse($permiso->fecha)->format('d/m/Y') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
    <div class="no-records">
        <p>No se encontraron permisos eventuales para este empleado.</p>
    </div>
    @endif

    <div class="footer">
        <p>Generado por el Sistema de Gestión de Escolar</p>
        <div class="signature-line">
            Firma del Encargado
        </div>
    </div>
</body>

</html>