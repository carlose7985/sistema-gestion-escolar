<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Historial de Asistencias</title>
    <style>
        @page {
            margin: 1cm;
            font-family: sans-serif;
        }

        body {
            font-size: 10px;
            color: #333;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }

        .titulo {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Contenedor del mes */
        .mes-container {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .mes-titulo {
            background: #1e3a8a;
            color: white;
            padding: 5px 10px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            margin-bottom: 0;
            display: inline-block;
            border-radius: 4px 4px 0 0;
        }

        /* Tabla Principal */
        .tabla-asistencia {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }

        .tabla-asistencia th,
        .tabla-asistencia td {
            border: 1px solid #000;
            text-align: center;
            padding: 3px;
        }

        /* Encabezados de Días (Lun 03) */
        .th-dia {
            width: 28px;
            background-color: #f3f4f6;
        }

        .dia-nombre {
            display: block;
            font-size: 8px;
            text-transform: uppercase;
            color: #555;
        }

        .dia-numero {
            display: block;
            font-size: 11px;
            font-weight: bold;
            color: #000;
            margin-top: 2px;
        }

        /* Columnas de Datos Personales */
        .th-persona {
            text-align: left;
            padding-left: 8px;
            background-color: #f3f4f6;
        }

        .col-nombre {
            text-align: left;
            padding-left: 8px;
            font-weight: bold;
            font-size: 11px;
        }

        /* Columnas Totales */
        .th-total {
            width: 25px;
            background-color: #e5e7eb;
            font-weight: bold;
        }

        .td-total {
            font-weight: bold;
            font-size: 12px;
            background-color: #f9fafb;
        }

        /* Estilos de los círculos (Badges) */
        .circle {
            height: 20px;
            width: 20px;
            line-height: 17px;
            border-radius: 50%;
            /* Esto hace el círculo */
            display: inline-block;
            font-weight: bold;
            font-size: 10px;
        }

        /* Colores exactos de la imagen */
        .badge-green {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
        }

        .badge-red {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
        }

        .badge-yellow {
            background-color: #fef9c3;
            color: #a16207;
            border: 1px solid #fde047;
        }

        .empty-cell {
            color: #ccc;
        }

        .text-lg {
            font-size: 16px;
        }

        .header-grid {
            display: table;
            width: 100%;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .header-col {
            display: table-cell;
            font-weight: bold;
            font-size: 11px;
        }
    </style>
</head>

<body>

    <div class="header">
        <table style="width: 100%; border: none; margin-bottom: 10px;">
            <tr>
                <td style="width: 85%; border: none; text-align: left;">
                    <img src="{{ $logoDocumento }}" style="width: 500px; height: 50px;" alt="Logo Documento">
                </td>
                <td style="width: 15%; border: none; text-align: right;">
                    <img src="{{ $logoInstitucion }}" style="width: 50px; height: 50px;" alt="Logo Institución">
                </td>
            </tr>
        </table>

        @foreach ($institucion as $i)
        <div class="header-grid">
            <div class="header-col">Plantel: <u>{{ $i->nombre_de_la_institucion }}</u></div>
            <div class="header-col">Dependencia: <u>{{ $i->dependencia }}</u></div>
            <div class="header-col" style="text-align: right;">Dirección: <u>{{ $i->direccion }}</u></div>
        </div>
        @endforeach
        <table width="100%">
            <tr>
                <td class="titulo">Historial de Asistencia(s)</td>
                <td align="right" class="text-lg">Empleado: <strong>{{ $nombreCompleto }}</strong> | C.I: {{ $cedula }} | Año: {{ $year }}</td>
            </tr>
        </table>
    </div>

    @foreach($reporteData as $mes)
    <div class="mes-container">
        <div class="mes-titulo">{{ $mes['nombre_mes'] }}</div>

        <table class="tabla-asistencia">
            <thead>
                <tr>

                    @foreach($mes['dias'] as $dia)
                    <th class="th-dia">
                        <span class="dia-nombre">{{ $dia['nombre_dia'] }}</span>
                        <span class="dia-numero">{{ $dia['num_dia'] }}</span>
                    </th>
                    @endforeach

                    <!-- Totales -->
                    <th class="th-total">A</th>
                    <th class="th-total">F</th>
                    <th class="th-total">P</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <!-- Celdas de Asistencia -->
                    @foreach($mes['dias'] as $dia)
                    <td>
                        @if($dia['letra'] !== '-')
                        <div class="circle {{ $dia['clase'] }}">
                            {{ $dia['letra'] }}
                        </div>
                        @else
                        <!-- Celda vacía o guión -->
                        <span class="empty-cell">**</span>
                        @endif
                    </td>
                    @endforeach

                    <!-- Celdas de Totales -->
                    <td class="td-total">{{ $mes['totales']['A'] }}</td>
                    <td class="td-total">{{ $mes['totales']['F'] }}</td>
                    <td class="td-total">{{ $mes['totales']['P'] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endforeach

    <div>
        Leyenda:
        <span style="color:#15803d"><strong>A:</strong> Asistencia</span> |
        <span style="color:#b91c1c"><strong>F:</strong> Falta</span> |
        <span style="color:#a16207"><strong>P:</strong> Permiso/Retardo</span>
        <br>
        <span style="font-size: 9px; color: #666; margin-top: 5px;">Fecha de impresión: {{ $fecha_actual }}</span>
    </div>


</body>

</html>