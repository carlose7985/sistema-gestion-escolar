<!-- resources/views/pdf/reporte-guardias.blade.php -->
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
        }

        .dia-header {
            background-color: #2563eb;
            color: white;
            padding: 8px;
            margin-top: 15px;
            text-transform: uppercase;
            font-weight: bold;
            border-radius: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        th,
        td {
            border: 1px solid #e2e8f0;
            padding: 6px;
            text-align: left;
        }

        th {
            background-color: #f8fafc;
            color: #64748b;
            font-size: 9px;
            text-transform: uppercase;
        }

        .no-data {
            color: #94a3b8;
            font-style: italic;
            padding: 10px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
    </style>
</head>

<body>
    <h2 style="text-align: center;">ROL DE GUARDIAS POR DÍA</h2>

    @foreach($reportePorDia as $dia => $empleados)
    <div class="dia-header">{{ $dia }}</div>
    @if($empleados->count() > 0)
    <table>
        <thead>
            <tr>
                <th width="40%">Nombre del Vigilante</th>
                <th width="30%">Cédula</th>
                <th width="30%">Condición</th>
            </tr>
        </thead>
        <tbody>
            @foreach($empleados as $v)
            <tr>
                <td>{{ $v->empleado->nombres }} {{ $v->empleado->apellidos }}</td>
                <td>{{ $v->empleado->cedula }}</td>
                <td>{{ $v->empleado->condicion_del_cargo }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">No hay personal asignado para este día</div>
    @endif
    @endforeach
</body>

</html>