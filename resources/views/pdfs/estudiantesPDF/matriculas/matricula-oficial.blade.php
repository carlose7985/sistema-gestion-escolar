<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Matrícula Oficial Comparativa</title>
    <style>
        @page {
            margin: 0.8cm 1cm;
        }

        body {
            font-family: sans-serif;
            font-size: 8.5pt;
        }

        .text-center {
            text-align: center;
        }

        .bg-blue {
            background-color: #0047ab;
            color: white;
        }

        .bg-gray {
            background-color: #f2f2f2;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 4px;
        }

        /* Colores de variación */
        .ingreso {
            color: #008000;
            font-weight: bold;
        }

        /* Verde */
        .egreso {
            color: #cc0000;
            font-weight: bold;
        }

        /* Rojo */
        .sin-cambio {
            color: #666;
        }
    </style>
</head>

<body>
    <div class="text-center">
        <h2 style="margin:0;">MATRÍCULA OFICIAL: COMPARATIVA INICIAL VS FINAL</h2>
        <h3 style="margin:0; text-transform: uppercase;">PERIODO ESCOLAR: {{ $periodo_escolar }}</h3>
        @foreach($institucion as $i)
        <p style="margin:2px;">{{ $i->nombre_de_la_institucion }}</p>
        @endforeach
    </div>

    <!-- CUADRO DE RESUMEN -->
    <table style="width: 40%; margin: 15px auto;">
        <tr class="bg-blue">
            <th>TOTAL INICIAL</th>
            <th>TOTAL FINAL</th>
            <th>VARIACIÓN</th>
        </tr>
        <tr>
            <td class="text-center">{{ $totales['ini_t'] }}</td>
            <td class="text-center">{{ $totales['fin_t'] }}</td>
            <td class="text-center {{ $totales['diferencia'] >= 0 ? 'ingreso' : 'egreso' }}">
                {{ $totales['diferencia'] > 0 ? '+' : '' }}{{ $totales['diferencia'] }}
            </td>
        </tr>
    </table>

    <!-- TABLA DETALLADA -->
    <table>
        <thead>
            <tr class="bg-blue">
                <th rowspan="2">GRADO Y SECCIÓN</th>
                <th colspan="3">MATRÍCULA INICIAL</th>
                <th colspan="3">MATRÍCULA FINAL</th>
                <th colspan="3">VARIACIÓN (MOVIMIENTO)</th>
                <th rowspan="2">ESTADO</th>
            </tr>
            <tr class="bg-blue">
                <!-- Inicial -->
                <th>V</th>
                <th>H</th>
                <th>T</th>
                <!-- Final -->
                <th>V</th>
                <th>H</th>
                <th>T</th>
                <!-- Variación -->
                <th>V</th>
                <th>H</th>
                <th>T</th>
            </tr>
        </thead>
        <tbody>
            @foreach($comparativa as $c)
            @php
            // Calculamos diferencias por género y total
            $v_m = ($c->fin_m ?? 0) - $c->ini_m;
            $v_h = ($c->fin_f ?? 0) - $c->ini_f;
            $v_t = ($c->fin_t ?? 0) - $c->ini_t;
            @endphp
            <tr>
                <td>{{ $c->grado }}</td>

                <!-- MATRICULA INICIAL -->
                <td class="text-center">{{ $c->ini_m }}</td>
                <td class="text-center">{{ $c->ini_f }}</td>
                <td class="text-center bg-gray"><b>{{ $c->ini_t }}</b></td>

                <!-- MATRICULA FINAL -->
                <td class="text-center">{{ $c->fin_m ?? 0 }}</td>
                <td class="text-center">{{ $c->fin_f ?? 0 }}</td>
                <td class="text-center bg-gray"><b>{{ $c->fin_t ?? 0 }}</b></td>

                <!-- VARIACIÓN V - H - T -->
                <td class="text-center {{ $v_m > 0 ? 'ingreso' : ($v_m < 0 ? 'egreso' : '') }}">
                    {{ $v_m > 0 ? '+' : '' }}{{ $v_m }}
                </td>
                <td class="text-center {{ $v_h > 0 ? 'ingreso' : ($v_h < 0 ? 'egreso' : '') }}">
                    {{ $v_h > 0 ? '+' : '' }}{{ $v_h }}
                </td>
                <td class="text-center bg-gray {{ $v_t > 0 ? 'ingreso' : ($v_t < 0 ? 'egreso' : '') }}">
                    <b>{{ $v_t > 0 ? '+' : '' }}{{ $v_t }}</b>
                </td>

                <!-- ESTADO TEXTUAL -->
                <td class="text-center" style="font-size: 7pt;">
                    @if($v_t > 0)
                    <span class="ingreso">INGRESO</span>
                    @elseif($v_t < 0)
                        <span class="egreso">EGRESO</span>
                        @else
                        <span class="sin-cambio">SIN CAMBIOS</span>
                        @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 20px; font-size: 8pt; color: #555;">
        <p>* V: Varones | H: Hembras | T: Total.</p>
        <p>* Variación positiva (+) indica nuevos ingresos durante el periodo. Variación negativa (-) indica retiros.</p>
    </div>
</body>

</html>