<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Matrícula Final {{ $periodo_escolar }}</title>
    <style>
        @page {
            margin: 1.0cm 3.0cm 1.5cm 3.0cm;
        }

        .text-11 {
            font-size: 11pt !important;
            font-family: sans-serif;
        }

        .text-12 {
            font-size: 12pt !important;
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }

        .container {
            margin-top: 0.4cm;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.4cm;
        }

        th {
            background-color: blue;
            color: white;
            padding: 4px;
        }

        td {
            border: 1px solid black;
            padding: 4px;
            font-size: 10pt;
        }
    </style>
</head>

<body>
    @if ($institucion->count() > 0)
    <div id="header">
        <table style="border: none;">
            <tr>
                <td class="text-center text-11" style="border: none;">
                    <b>MATRÍCULA FINAL DE ALUMNOS(AS) - PERIODO {{ $periodo_escolar }}</b>
                </td>
            </tr>
            <tr>
                <td class="text-center text-11" style="border: none;">
                    @foreach ($institucion as $i)
                    <b>{{ $i->nombre_de_la_institucion }}</b>
                    @endforeach
                </td>
            </tr>
        </table>
    </div>
    @endif

    <div class="container">
        <!-- CUADRO 1: TOTAL GENERAL -->
        <table>
            <thead>
                <tr>
                    <th colspan="3">TOTAL GENERAL POR GÉNERO</th>
                </tr>
            </thead>
            <tr style="font-weight: bold;">
                <td class="text-center">VARONES</td>
                <td class="text-center">HEMBRAS</td>
                <td class="text-center">TOTAL</td>
            </tr>
            {{-- 🔥 CORREGIDO: $totalmatricula es un objeto, no una colección --}}
            <tr>
                <td class="text-center">{{ $totalmatricula->totalm ?? 0 }}</td>
                <td class="text-center">{{ $totalmatricula->totalf ?? 0 }}</td>
                <td class="text-center">{{ $totalmatricula->total ?? 0 }}</td>
            </tr>
        </table>

        <!-- CUADRO 2: TOTAL POR GRADO -->
        <table>
            <thead>
                <tr>
                    <th colspan="4">TOTAL POR GRADO Y GÉNERO</th>
                </tr>
            </thead>
            <tr style="font-weight: bold;">
                <td class="text-center">GRADO</td>
                <td class="text-center">VARONES</td>
                <td class="text-center">HEMBRAS</td>
                <td class="text-center">TOTAL</td>
            </tr>
            @foreach ($totalporgrado as $r)
            <tr>
                <td class="text-center">{{ $r->grado }}</td>
                <td class="text-center">{{ $r->totalm }}</td>
                <td class="text-center">{{ $r->totalf }}</td>
                <td class="text-center">{{ $r->total }}</td>
            </tr>
            @endforeach
        </table>

        <!-- CUADRO 3: DETALLE POR SECCIÓN -->
        <table>
            <thead>
                <tr>
                    <th colspan="4">TOTAL POR GRADO, SECCIÓN Y GÉNERO</th>
                </tr>
            </thead>
            <tr style="font-weight: bold;">
                <td class="text-center">GRADO Y SECCIÓN</td>
                <td class="text-center">VARONES</td>
                <td class="text-center">HEMBRAS</td>
                <td class="text-center">TOTAL</td>
            </tr>
            @foreach ($totalporgradoiseccion as $r)
            <tr>
                <td class="text-center">{{ $r->grado_completo }}</td>
                <td class="text-center">{{ $r->totalm }}</td>
                <td class="text-center">{{ $r->totalf }}</td>
                <td class="text-center">{{ $r->total }}</td>
            </tr>
            @endforeach
        </table>
    </div>
</body>

</html>