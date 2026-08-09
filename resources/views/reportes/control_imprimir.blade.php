<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte de Control Estudiantil</title>
    <style>
        @page {
            margin: 1cm;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 8.5pt;
            color: #333;
        }

        .page-break {
            page-break-after: always;
        }

        .page-break:last-child {
            page-break-after: never;
        }

        .header {
            text-align: center;
            margin-bottom: 12px;
        }

        .title {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 10pt;
            color: #444;
            font-style: italic;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        th {
            background-color: #f2f2f2;
            border: 0.5pt solid #000;
            padding: 4px 2px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7pt;
        }

        td {
            border: 0.5pt solid #000;
            padding: 4px 3px;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .nro {
            text-align: center;
            font-size: 7pt;
            padding: 0 !important;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }
    </style>
</head>

<body>

    @foreach($grados as $grado)
    <div class="page-break">
        <div class="header" style="position: relative; text-align: center; margin-bottom: 20px;">
            {{-- Logos --}}
            <div style="position: absolute; left: 0; top: 3%; transform: translateY(-50%); opacity: 0.5;">
                <img src="{{ $logoDocumento }}" style="height: 60px; width: 350px;">
            </div>
            <div style="position: absolute; right: 0; top: 3%; transform: translateY(-50%); opacity: 0.5;">
                <img src="{{ $logoInstitucion }}" style="max-height: 55px; max-width: 70px;">
            </div>

            <div style="position: relative; z-index: 1;">
                <div class="title">
                    República Bolivariana de Venezuela<br>
                    Ministerio del Poder Popular para la Educación<br>
                    <span>{{ $institucion->nombre_de_la_institucion ?? '' }}</span>
                </div>
                <div class="subtitle">
                    {{ $grado->nombre_del_grado }} - SECCIÓN "{{ $grado->seccion }}"
                </div>
                <div style="font-size: 12pt; font-weight: bold; margin-top:10px; text-transform: uppercase;">
                    {{ $tituloReporte }}
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="nro" style="width: 20px;">#</th>
                    @foreach($columnas as $col)
                    @php
                    $width = '';
                    if($col['campo'] == 'full_name') $width = 'style="width: 250px;"';
                    elseif(in_array($col['campo'], ['sexo', 'edad', 'cedula'])) $width = 'style="width: 45px;"';
                    elseif(str_contains($col['campo'], 'name_r')) $width = 'style="width: 250px;"';
                    @endphp
                    <th {!! $width !!}>{{ $col['titulo'] }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @php $n = 1; @endphp
                {{-- 🔥 CAMBIADO: Usar $grado->estudiantes en lugar de estudiantesactivos() --}}
                @foreach($grado->estudiantes as $est)
                @php
                $camposCentrados = ['cedula', 'sexo', 'fecha_de_nacimiento', 'edad', 'talla_de_camisa', 'talla_de_pantalon', 'talla_de_zapato', 'cedula_r', 'telefono_r'];
                @endphp
                <tr>
                    <td class="nro">{{ $n++ }}</td>
                    @foreach($columnas as $col)
                    <td class="{{ in_array(basename($col['campo']), $camposCentrados) ? 'text-center' : 'text-left' }}">
                        @if($col['campo'] == 'full_name')
                        {{ $est->apellido }} {{ $est->name }}
                        @elseif($col['campo'] == 'edad')
                        {{ $est->fecha_de_nacimiento ? \Carbon\Carbon::parse($est->fecha_de_nacimiento)->age : 'S/D' }}
                        @elseif(str_starts_with($col['campo'], 'virtual_'))
                        {{-- Celda vacía --}}
                        @elseif(str_contains($col['campo'], '.'))
                        {{-- Para relaciones como 'representante.name_r' --}}
                        @php
                        $parts = explode('.', $col['campo']);
                        $value = $est;
                        foreach($parts as $part) {
                        $value = $value->$part ?? null;
                        }
                        echo $value ?? '';
                        @endphp
                        @else
                        {{ $est->{$col['campo']} ?? '' }}
                        @endif
                    </td>
                    @endforeach
                </tr>
                @endforeach

                {{-- Filas vacías extras --}}
                @for($i = 0; $i < $filasVacias; $i++)
                    <tr>
                    <td class="nro">{{ $n++ }}</td>
                    @foreach($columnas as $col) <td></td> @endforeach
                    </tr>
                    @endfor
            </tbody>
        </table>
    </div>
    @endforeach
</body>

</html>