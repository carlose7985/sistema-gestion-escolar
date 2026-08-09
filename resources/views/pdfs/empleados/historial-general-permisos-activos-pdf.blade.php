<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte General de {{ $tipo }}s</title>
    <style>
        /* ... (Tus estilos se mantienen igual) ... */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            font-size: 10pt;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
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
            font-size: 9pt;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
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
    </style>
</head>

<body>
    <div class="header">
        @if ($institucion)
        <h1>{{ $institucion->nombre_de_la_institucion }}</h1>
        <h2>Dirección: {{ $institucion->direccion }}</h2>
        <p>Teléfono: {{ $institucion->telefono ?? 'N/A' }} | Email: {{ $institucion->email ?? 'N/A' }}</p>
        @endif
        <hr>
        {{-- Usamos la variable $tipo que enviamos desde el controlador --}}




        @if($tipo == "Vacacion")
        <h3>REPORTE GENERAL PERMISOS DE {{ strtoupper($tipo) }}ES</h3>

        @else
          <h3>REPORTE GENERAL PERMISOS  {{ strtoupper($tipo) }}ES</h3>
        @endif
      

        <p>Rango: {{ \Carbon\Carbon::parse($desde)->format('d/m/Y') }} al {{ \Carbon\Carbon::parse($hasta)->format('d/m/Y') }}</p>
        <p>Fecha de Emisión: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    </div>

    @if ($permisosActivosConsolidados->isNotEmpty())
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Empleado</th>
                    <th>Cédula</th>
                    <th>Tipo de Personal</th>
                    <th>Descripción / Motivo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Final</th>
                    <th style="text-align: center;">Días</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($permisosActivosConsolidados as $permiso)
                <tr>
                    {{-- CORRECCIÓN AQUÍ: de 'empleados' a 'empleado' --}}
                    <td>{{ $permiso->empleado->nombres ?? 'N/A' }} {{ $permiso->empleado->apellidos ?? '' }}</td>
                    <td>{{ $permiso->empleado->cedula ?? 'N/A' }}</td>
                    <td>{{ $permiso->empleado->tipo_de_personal ?? 'N/A' }}</td>
                    <td>{{ $permiso->descripcion }}</td>
                    <td>{{ \Carbon\Carbon::parse($permiso->fecha_de_inicio)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($permiso->fecha_final)->format('d/m/Y') }}</td>
                    <td style="text-align: center;">
                        {{-- Cálculo de días corregido (+1 para incluir el día final) --}}
                        {{ \Carbon\Carbon::parse($permiso->fecha_de_inicio)->diffInDays(\Carbon\Carbon::parse($permiso->fecha_final)) + 1 }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
    <div class="no-records">
        <p>No se encontraron registros de {{ $tipo }} para el rango seleccionado.</p>
    </div>
    @endif

    <div class="footer">
        <p>Generado por el Sistema de Gestión de Personal</p>
        <div class="signature-line">
            Firma Autorizada
        </div>
    </div>
</body>

</html>