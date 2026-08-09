<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            margin-top: 4px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
        }

        .logo {
            position: absolute;
            left: 0;
            top: 0;
            width: 350px;
        }

        .cintillo {
            width: 100%;
            margin-bottom: 10px;
        }

        .header-text {
            margin-top: 90px;
            font-weight: bold;
            line-height: 1.5;
            text-transform: uppercase;
            font-size: 12px;
        }

        .fecha {
            text-align: right;
            margin: 20px 0;
            text-transform: uppercase;
            font-weight: bold;
            text-decoration: underline;
        }

        .cuerpo-carta {
            text-align: justify;
            margin-top: 30px;
            font-size: 1rem;
            line-height: 1.9;
        }

        .negrita {
            font-weight: bold;
            text-decoration: underline;
        }

        .despedida {
            margin-top: 90px;
            text-align: center;
        }

        .firma-espacio {
            margin-top: 60px;
            border-top: 1px solid #000;
            width: 300px;
            margin-left: auto;
            margin-right: auto;
        }

        .page-break {
            page-break-after: always;
        }

        .titulo-tabla {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
            font-size: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
        }

        .text-left {
            text-align: left;
            padding-left: 8px;
        }

        .footer-stats {
            margin-top: 15px;
            font-size: 10px;
            font-weight: bold;
        }
    </style>
</head>

<body>

    @foreach($grupos as $plantelId => $estudiantes)
    @php
    $primerEstudiante = $estudiantes->first();

    // 🔥 Usar los campos directamente desde el stdClass
    $plantelNombre = $primerEstudiante->plantel_nombre ?? 'Sin plantel';
    $directorNombre = $primerEstudiante->director ?? '';

    $totalEstudiantes = $estudiantes->count();
    $totalVarones = $estudiantes->where('sexo', 'M')->count();
    $totalHembras = $estudiantes->where('sexo', 'F')->count();
    @endphp

    <!-- PÁGINA 1: LA CARTA DE SOLICITUD -->
    <div class="header">
        <img src="{{ $logoDocumento }}" class="logo">
        <div class="header-text">
            República Bolivariana de Venezuela<br>
            Ministerio del Poder Popular Para la Educación<br>
            {{ $institucion->nombre_de_la_institucion }}<br>
            {{ $institucion->municipio ?? '' }} - Estado {{ $institucion->estado ?? '' }}
        </div>
    </div>

    <div class="fecha">
        TUCUPITA, {{ $fechaActual }}
    </div>

    <div class="cuerpo-carta">
        &nbsp;&nbsp;&nbsp; Ciudadano(a) <span class="negrita">
            @if($directorNombre)
            {{ $directorNombre }}
            @else
            ________________________________
            @endif
        </span>, Director(a) del
        <span class="negrita">{{ $plantelNombre }}</span> reciba un cordial saludo, extensivo a todo el personal que dignamente labora en esa
        institución. Por medio de la presente, la dirección de la
        <span class="negrita">{{ $institucion->nombre_de_la_institucion }}</span> quien dirige la
        <span class="">
            @if ($institucion->director_nombre)
            <b><u>{{ $institucion->director_nombre }}</u></b>
            Cédula de identidad <b><u>{{ $institucion->director_cedula ?? '' }}</u></b>
            @else
            __________________________________________________ Cédula de identidad _________________________
            @endif
        </span>
        le solicitamos formalmente la asignación de cupos para <span class="negrita">({{ $totalEstudiantes }})</span> estudiantes que egresan de nuestro plantel.
        Esta solicitud responde al firme interés de los padres y representantes de dichos alumnos, quienes han manifestado su deseo de que sus representados continúen
        su formación académica en la prestigiosa institución que usted dirige.
        <br><br>
        Esperando una pronta respuesta satisfactoria, anexamos listado de estudiantes que egresan.
        <br><br>
        Sin más a que hacer referencia se despide.
    </div>

    <div class="despedida">
        Atentamente:
        <br><br>
        <div class="firma-espacio"></div>
        {{ $institucion->director_nombre ?? 'Firma Autorizada' }}<br>
        C.I: {{ $institucion->director_cedula ?? '' }}
    </div>

    <div class="page-break"></div>

    <!-- PÁGINA 2: EL LISTADO DE ESTUDIANTES -->
    <div class="header">
        <img src="{{ $logoDocumento }}" class="logo">
        <div class="header-text" style="margin-top: 90px;">
            LISTADO GENERAL EGRESADOS - PERIODO ESCOLAR: {{ $periodoSeleccionado }}
        </div>
        <div style="font-weight: bold; margin-top: 10px;">
            DESTINO: {{ $plantelNombre }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="30">#</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Cédula</th>
                <th width="40">Sexo</th>
                <th width="40">Edad</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estudiantes as $index => $est)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="text-left">{{ $est->apellido ?? '' }}</td>
                <td class="text-left">{{ $est->name ?? '' }}</td>
                <td>{{ $est->cedula ?? '' }}</td>
                <td>{{ $est->sexo ?? '' }}</td>
                <td>
                    @if(isset($est->fecha_de_nacimiento))
                    {{ \Carbon\Carbon::parse($est->fecha_de_nacimiento)->age }}
                    @else
                    -
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer-stats">
        TOTAL ESTUDIANTES: {{ $totalEstudiantes }} |
        VARONES: {{ $totalVarones }} |
        HEMBRAS: {{ $totalHembras }}
    </div>

    @if(!$loop->last)
    <div class="page-break"></div>
    @endif
    @endforeach

</body>

</html>