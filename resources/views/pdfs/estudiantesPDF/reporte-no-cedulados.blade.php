<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Reporte Estudiantes No Cedulados</title>
    <style>
        @page {
            margin: 1.5cm 1cm 1.5cm 1cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            color: #1e293b;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header img {
            max-height: 60px;
            margin-bottom: 10px;
        }

        .header .title {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #1e40af;
        }

        .header .subtitle {
            font-size: 11pt;
            color: #64748b;
            margin-top: 5px;
        }

        .header .periodo {
            font-size: 10pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 5px;
        }

        .info-box {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
        }

        .info-box .label {
            font-weight: bold;
            color: #475569;
        }

        .info-box .value {
            font-weight: bold;
            color: #0f172a;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9pt;
        }

        th {
            background: #1e40af;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            border: 1px solid #e2e8f0;
            padding: 6px;
            vertical-align: middle;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-no-cedulado {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #f59e0b;
        }

        .footer {
            margin-top: 25px;
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
        }

        .footer .total {
            font-weight: bold;
            color: #0f172a;
            font-size: 10pt;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    <!-- HEADER -->
    <div class="header">
        @if($logoDocumento)
        <img src="{{ $logoDocumento }}" alt="Logo">
        @endif
        <div class="title">
            {{ $institucion->nombre_de_la_institucion ?? 'Institución Educativa' }}
        </div>
        <div class="subtitle">
            REPORTE DE ESTUDIANTES NO CEDULADOS
        </div>
        <div class="periodo">
            Período Escolar: {{ $periodo ?? 'No definido' }}
        </div>
        <div style="font-size: 9pt; color: #64748b; margin-top: 3px;">
            Fecha de generación: {{ $fecha }}
        </div>
    </div>

    <!-- INFO BOX -->
    <div class="info-box">
        <div>
            <span class="label">Total Estudiantes:</span>
            <span class="value">{{ $totales['total'] }}</span>
        </div>
        <div>
            <span class="label">👨 Masculino:</span>
            <span class="value">{{ $totales['m'] }}</span>
        </div>
        <div>
            <span class="label">👩 Femenino:</span>
            <span class="value">{{ $totales['f'] }}</span>
        </div>
        @if($filtro_grado)
        <div>
            <span class="label">Grado:</span>
            <span class="value">{{ $filtro_grado->nombre_del_grado }} - {{ $filtro_grado->seccion }}</span>
        </div>
        @endif
    </div>

    <!-- TABLA DE ESTUDIANTES -->
    <table>
        <thead>
            <tr>
                <th width="5%">#</th>
                <th width="20%">Apellidos</th>
                <th width="20%">Nombres</th>
                <th width="12%">Documento</th>
                <th width="13%">Cédula</th>
                <th width="10%">Sexo</th>
                <th width="20%">Grado / Sección</th>
            </tr>
        </thead>
        <tbody>
            @forelse($estudiantes as $index => $est)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $est->apellido ?? '-' }}</td>
                <td>{{ $est->name ?? '-' }}</td>
                <td class="text-center">{{ $est->documento ?? '-' }}</td>
                <td class="text-center">
                    <span class="badge badge-no-cedulado">
                        {{ $est->cedula ?? 'SIN CÉDULA' }}
                    </span>
                </td>
                <td class="text-center">{{ $est->sexo == 'M' ? 'M' : 'F' }}</td>
                <td class="text-center">
                    {{ $est->grado ?? '-' }}
                    @if($est->seccion)
                    - Sección "{{ $est->seccion }}"
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="text-center" style="padding: 30px; color: #94a3b8; font-weight: bold;">
                    No hay estudiantes sin cédula en 5to o 6to grado
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FOOTER -->
    <div class="footer">
        <span class="total">Total de estudiantes no cedulados: {{ $totales['total'] }}</span>
        <br>
        Documento generado automáticamente el {{ $fecha }}
        <br>
        <span style="color: #cbd5e1;">Sistema de Gestión Escolar - v2.0</span>
    </div>

</body>

</html>