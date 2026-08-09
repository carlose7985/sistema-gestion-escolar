<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 8.5pt;
            color: #1a1a1a;
            margin: 0;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            margin-bottom: 8px;
            padding-bottom: 5px;
        }

        h2 {
            margin: 0;
            font-size: 13pt;
            text-transform: uppercase;
        }

        .column-container {
            column-count: 2;
            column-gap: 25px;
            column-rule: 0.5pt solid #eee;
        }

        /* Cada grupo se mantiene entero en una columna */
        .grupo-wrapper {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 8px;
        }

        .badge-grupo {
            display: inline-block;
            background-color: #333;
            color: white;
            font-size: 10pt;
            font-weight: bold;
            padding: 2px 8px;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .estudiante-item {
            display: block;
            border-bottom: 0.1pt solid #f0f0f0;
            padding: 2px 0;
            white-space: nowrap;
        }

        .estudiante-item:last-child {
            border-bottom: none;
        }

        .numero {
            display: inline-block;
            width: 18px;
            font-weight: bold;
            color: #666;
            text-align: right;
            margin-right: 5px;
        }

        .nombre {
            text-transform: uppercase;
            font-size: 12pt;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: right;
            font-size: 5pt;
            color: #999;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>LISTADO DE GRADUANDOS - 6TO GRADO</h2>
    </div>

    <div class="column-container">
        @php
        $global_index = 1;
        $mitad = ceil(count($estudiantes) / 2); // Calcular la mitad
        @endphp

        {{-- PRIMERA MITAD - COLUMNA IZQUIERDA --}}
        @foreach($estudiantes as $index => $grupo)
        @if($loop->index < $mitad)
            <div class="grupo-wrapper">
            <div class="badge-grupo">Grupo {{ $index + 1 }}</div>
            @foreach($grupo as $estudiante)
            <div class="estudiante-item">
                <span class="numero">{{ $global_index++ }}.</span>
                <span class="nombre" >{{ $estudiante->name }} {{ $estudiante->apellido }},</span>
            </div>
            @endforeach
    </div>
    @endif
    @endforeach

    {{-- SEGUNDA MITAD - COLUMNA DERECHA --}}
    @foreach($estudiantes as $index => $grupo)
    @if($loop->index >= $mitad)
    <div class="grupo-wrapper">
        <div class="badge-grupo">Grupo {{ $index + 1 }}</div>
        @foreach($grupo as $estudiante)
        <div class="estudiante-item">
            <span class="numero">{{ $global_index++ }}.</span>
            <span class="nombre">{{ $estudiante->name }} {{ $estudiante->apellido }} </span>
        </div>
        @endforeach
    </div>
    @endif
    @endforeach
    </div>

    <div class="footer">
        Impreso el: {{ date('d/m/Y h:i A') }}
    </div>
</body>

</html>