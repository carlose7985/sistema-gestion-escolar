<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0.5cm;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 7.5px;
            color: #1a1a1a;
        }

        .header-title {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 12px;
        }

        th,
        td {
            border: 0.5px solid #000;
            text-align: center;
            height: 16px;
            overflow: hidden;
        }

        .bg-slate {
            background-color: #f1f5f9;
        }

        .bg-blue {
            background-color: #e0f2fe;
            font-size: 9px;
        }

        .text-left {
            text-align: left;
            padding-left: 4px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .font-black {
            font-weight: bold;
        }

        .dia-header {
            font-size: 10px;
            display: block;
            font-weight: normal;
            color: black;
        }

        .dia-numero {
            font-size: 12px;
            font-weight: bold;
        }

        /* Estilo para salto de página */
        .page-break {
            page-break-before: always;
            border-top: 2px dashed #ccc;
            margin: 10px 0;
            padding-top: 10px;
        }

        /* Evitar que las tablas se rompan en medio */
        table {
            page-break-inside: avoid;
        }

        /* Forzar salto de página después de la primera tabla si es necesario */
        .table-container {
            page-break-inside: avoid;
        }

        /* Asegurar que el header de la segunda tabla se mantenga junto */
        .second-table-header {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>
    <div class="header-title">
        CONTROL MENSUAL DE DESPENSA Y CONSUMO DIARIO - <span style="color: #2563eb;">{{ strtoupper($mes_nombre) }} {{ $anio }}</span>
    </div>

    @php
    $fechasRecepcion = $recepciones->keys()->toArray();
    // Array de días de la semana en español
    $diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Calcular el número de filas para determinar si la segunda tabla cabe
    $numFilasInsumos = count($insumos);
    $numFilasComensales = 4; // Estudiantes, Cocineras, Personal, Total
    $totalFilas = $numFilasInsumos + $numFilasComensales;

    // Calcular el espacio aproximado que ocupará cada tabla
    // Altura de cada fila: 16px + border, más el header
    $alturaFila = 17; // 16px + 1px de border
    $alturaHeader = 50; // Aproximado
    $alturaTabla1 = ($totalFilas * $alturaFila) + $alturaHeader + 20; // 20px de margen
    $alturaTabla2 = ($totalFilas * $alturaFila) + $alturaHeader + 20;

    // Determinar si necesitamos salto de página (si la tabla2 no cabe junto a la tabla1)
    // Aproximadamente 1 página tiene ~800px de altura disponible
    $necesitaSalto = ($alturaTabla1 + $alturaTabla2) > 800;
    @endphp

    <!-- TABLA 1: DÍAS 1 AL 15 -->
    <div class="table-container">
        <table>
            <thead>
                <tr class="bg-slate">
                    <th width="90px" rowspan="2">RUBRO ALIMENTICIO</th>
                    <th width="35px" rowspan="2">DESPENSA</th>
                    <th colspan="2">RECEPCIONES</th>
                    <th colspan="15">CONSUMO DIARIO (DÍAS 1 AL 15)</th>
                    <th width="35px" rowspan="2">CONSUMO TOTAL</th>
                    <th width="40px" rowspan="2">DESPENSA</th>
                </tr>
                <tr>
                    <th class="bg-blue">{{ isset($fechasRecepcion[0]) ? date('d/m/Y', strtotime($fechasRecepcion[0])) : 'I' }}</th>
                    <th class="bg-blue">{{ isset($fechasRecepcion[1]) ? date('d/m/Y', strtotime($fechasRecepcion[1])) : 'II' }}</th>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $fechaDia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $numeroDiaSemana=date('w', strtotime($fechaDia));
                        $nombreDia=$diasSemana[$numeroDiaSemana] ?? '' ;
                        @endphp
                        <th>
                        <span class="dia-header">{{ $nombreDia }}</span>
                        <span class="dia-numero">{{ $i }}</span>
                        </th>
                        @endfor
                </tr>
            </thead>
            <tbody>
                @foreach($insumos as $insumo)
                @php
                // IMPORTANTE: Construimos la llave EXACTA como se guardó en el JSON
                $key = trim($insumo->nombre . " " . $insumo->peso_medida . $insumo->unidad_medida);

                // 1. Inventario Inicial del cierre pasado
                $invInicial = $inventarioInicial[$insumo->nombre] ?? 0;

                // 2. Recepciones (Entradas) - Usamos la llave construida
                $r1 = isset($fechasRecepcion[0]) ? ($recepciones[$fechasRecepcion[0]]->first()->rubros_cantidad[$key] ?? 0) : 0;
                $r2 = isset($fechasRecepcion[1]) ? ($recepciones[$fechasRecepcion[1]]->first()->rubros_cantidad[$key] ?? 0) : 0;

                $gastoQ1 = 0;
                @endphp
                <tr>
                    <td class="text-left">{{ $insumo->nombre }} {{ $insumo->peso_medida }}{{ $insumo->unidad_medida }}</td>
                    <td class="bg-slate">{{ (float)$invInicial ?: '' }}</td>
                    <td class="bg-blue">{{ (float)$r1 ?: '' }}</td>
                    <td class="bg-blue">{{ (float)$r2 ?: '' }}</td>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        // 3. Consumo Diario - Usamos la llave construida
                        $cant=isset($consumos[$dia]) ? ($consumos[$dia]->rubros_cantidad[$key] ?? 0) : 0;
                        $gastoQ1 += $cant;
                        @endphp
                        <td>{{ (float)$cant ?: '' }}</td>
                        @endfor
                        <td class="bg-slate font-black">{{ (float)$gastoQ1 ?: '' }}</td>
                        @php $stockAl15 = ($invInicial + $r1 + $r2) - $gastoQ1; @endphp
                        <td class="font-black">{{ (float)$stockAl15 }}</td>
                </tr>
                @endforeach
                <!-- DESGLOSE DE COMENSALES Q1 -->
                @php
                $tEst = 0; $tCoc = 0; $tPer = 0; $tGral = 0;
                @endphp

                <tr class="bg-slate">
                    <td colspan="4" class="text-left font-black">ESTUDIANTES</td>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $val=isset($consumos[$dia]) ? $consumos[$dia]->estudiantes : 0;
                        $tEst += $val;
                        @endphp
                        <td>{{ $val ?: '' }}</td>
                        @endfor
                        <td class="font-black">{{ $tEst ?: '' }}</td>
                        <td></td>
                </tr>
                <tr class="bg-slate">
                    <td colspan="4" class="text-left font-black">COCINERAS</td>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $val=isset($consumos[$dia]) ? $consumos[$dia]->cocineras : 0;
                        $tCoc += $val;
                        @endphp
                        <td>{{ $val ?: '' }}</td>
                        @endfor
                        <td class="font-black">{{ $tCoc ?: '' }}</td>
                        <td></td>
                </tr>
                <tr class="bg-slate">
                    <td colspan="4" class="text-left font-black">PERSONAL</td>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $val=isset($consumos[$dia]) ? $consumos[$dia]->personal : 0;
                        $tPer += $val;
                        @endphp
                        <td>{{ $val ?: '' }}</td>
                        @endfor
                        <td class="font-black">{{ $tPer ?: '' }}</td>
                        <td></td>
                </tr>
                <tr class="total-row" style="background-color: #e2e8f0; font-weight: bold;">
                    <td colspan="4" class="text-left">TOTAL COMENSALES</td>
                    @for($i=1; $i<=15; $i++)
                        @php
                        $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $sumDia=isset($consumos[$dia]) ? ($consumos[$dia]->estudiantes + $consumos[$dia]->cocineras + $consumos[$dia]->personal) : 0;
                        $tGral += $sumDia;
                        @endphp
                        <td>{{ $sumDia ?: '' }}</td>
                        @endfor
                        <td colspan="2" class="text-center" style="background-color: #334155; color: white;">{{ $tGral }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- SALTO DE PÁGINA CONDICIONAL -->
    @if($necesitaSalto)
    <div class="page-break"></div>
    @endif

    <!-- TABLA 2: DÍAS 16 AL FINAL -->
    <div class="table-container {{ $necesitaSalto ? 'second-table-header' : '' }}">
        <table>
            <thead>
                <tr class="bg-slate">
                    <th width="90px" rowspan="2">RUBRO ALIMENTICIO</th>
                    <th width="35px" rowspan="2">DESPENSA</th>
                    <th colspan="2">RECEPCIONES</th>
                    <th colspan="{{ ($diasDelMes - 15) }}">CONSUMO DIARIO (16 AL {{ $diasDelMes }})</th>
                    <th width="35px" rowspan="2">CONSUMO TOTAL</th>
                    <th width="40px" rowspan="2">INV. FINAL</th>
                </tr>
                <tr>
                    <th class="bg-blue">{{ isset($fechasRecepcion[2]) ? date('d/m/Y', strtotime($fechasRecepcion[2])) : 'III' }}</th>
                    <th class="bg-blue">{{ isset($fechasRecepcion[3]) ? date('d/m/Y', strtotime($fechasRecepcion[3])) : 'IV' }}</th>
                    @for($i=16; $i<=$diasDelMes; $i++)
                        @php
                        $fechaDia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                        $numeroDiaSemana=date('w', strtotime($fechaDia));
                        $nombreDia=$diasSemana[$numeroDiaSemana] ?? '' ;
                        @endphp
                        <th>
                        <span class="dia-header">{{ $nombreDia }}</span>
                        <span class="dia-numero">{{ $i }}</span>
                        </th>
                        @endfor
                </tr>
            </thead>
            <tbody>
                @foreach($insumos as $insumo)
                @php
                $key = trim($insumo->nombre . " " . $insumo->peso_medida . $insumo->unidad_medida);
                $invInicial = $inventarioInicial[$insumo->nombre] ?? 0;

                // Cálculo de lo que viene de la Tabla 1
                $r1_2 = (isset($fechasRecepcion[0]) ? ($recepciones[$fechasRecepcion[0]]->first()->rubros_cantidad[$key] ?? 0) : 0) +
                (isset($fechasRecepcion[1]) ? ($recepciones[$fechasRecepcion[1]]->first()->rubros_cantidad[$key] ?? 0) : 0);
                $gQ1 = 0;
                for($j=1; $j<=15; $j++){ $d=$fecha_base . str_pad($j, 2, '0' , STR_PAD_LEFT); $gQ1 +=isset($consumos[$d]) ? ($consumos[$d]->rubros_cantidad[$key] ?? 0) : 0; }
                    $vieneDe15 = ($invInicial + $r1_2) - $gQ1;

                    // Recepciones Q2
                    $r3 = isset($fechasRecepcion[2]) ? ($recepciones[$fechasRecepcion[2]]->first()->rubros_cantidad[$key] ?? 0) : 0;
                    $r4 = isset($fechasRecepcion[3]) ? ($recepciones[$fechasRecepcion[3]]->first()->rubros_cantidad[$key] ?? 0) : 0;

                    $gastoQ2 = 0;
                    @endphp
                    <tr>
                        <td class="text-left">{{ $insumo->nombre }} {{ $insumo->peso_medida }}{{ $insumo->unidad_medida }}</td>
                        <td class="bg-slate">{{ (float)$vieneDe15 }}</td>
                        <td class="bg-blue">{{ (float)$r3 ?: '' }}</td>
                        <td class="bg-blue">{{ (float)$r4 ?: '' }}</td>
                        @for($i=16; $i<=$diasDelMes; $i++)
                            @php
                            $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                            $cant=isset($consumos[$dia]) ? ($consumos[$dia]->rubros_cantidad[$key] ?? 0) : 0;
                            $gastoQ2 += $cant;
                            @endphp
                            <td>{{ (float)$cant ?: '' }}</td>
                            @endfor
                            <td class="bg-slate font-black">{{ (float)$gastoQ2 ?: '' }}</td>
                            <td class="font-black bg-slate">{{ (float)($vieneDe15 + $r3 + $r4 - $gastoQ2) }}</td>
                    </tr>
                    @endforeach
                    <!-- DESGLOSE DE COMENSALES Q2 -->
                    @php
                    $tEst2 = 0; $tCoc2 = 0; $tPer2 = 0; $tGral2 = 0;
                    @endphp

                    <tr class="bg-slate">
                        <td colspan="4" class="text-left font-black">ESTUDIANTES</td>
                        @for($i=16; $i<=$diasDelMes; $i++)
                            @php
                            $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                            $val=isset($consumos[$dia]) ? $consumos[$dia]->estudiantes : 0;
                            $tEst2 += $val;
                            @endphp
                            <td>{{ $val ?: '' }}</td>
                            @endfor
                            <td class="font-black">{{ $tEst2 ?: '' }}</td>
                            <td></td>
                    </tr>
                    <tr class="bg-slate">
                        <td colspan="4" class="text-left font-black">COCINERAS</td>
                        @for($i=16; $i<=$diasDelMes; $i++)
                            @php
                            $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                            $val=isset($consumos[$dia]) ? $consumos[$dia]->cocineras : 0;
                            $tCoc2 += $val;
                            @endphp
                            <td>{{ $val ?: '' }}</td>
                            @endfor
                            <td class="font-black">{{ $tCoc2 ?: '' }}</td>
                            <td></td>
                    </tr>
                    <tr class="bg-slate">
                        <td colspan="4" class="text-left font-black">PERSONAL</td>
                        @for($i=16; $i<=$diasDelMes; $i++)
                            @php
                            $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                            $val=isset($consumos[$dia]) ? $consumos[$dia]->personal : 0;
                            $tPer2 += $val;
                            @endphp
                            <td>{{ $val ?: '' }}</td>
                            @endfor
                            <td class="font-black">{{ $tPer2 ?: '' }}</td>
                            <td></td>
                    </tr>
                    <tr class="total-row" style="background-color: #e2e8f0; font-weight: bold;">
                        <td colspan="4" class="text-left">TOTAL COMENSALES</td>
                        @for($i=16; $i<=$diasDelMes; $i++)
                            @php
                            $dia=$fecha_base . str_pad($i, 2, '0' , STR_PAD_LEFT);
                            $sumDia=isset($consumos[$dia]) ? ($consumos[$dia]->estudiantes + $consumos[$dia]->cocineras + $consumos[$dia]->personal) : 0;
                            $tGral2 += $sumDia;
                            @endphp
                            <td>{{ $sumDia ?: '' }}</td>
                            @endfor
                            <td colspan="2" class="text-center" style="background-color: #334155; color: white;">{{ $tGral2 }}</td>
                    </tr>
            </tbody>
        </table>
    </div>
</body>

</html>