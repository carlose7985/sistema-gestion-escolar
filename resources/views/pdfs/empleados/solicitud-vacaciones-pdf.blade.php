<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 1.5cm 2.0cm 1.5cm 2.0cm;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
        }

        .fecha {
            text-align: right;
            margin-bottom: 20px;
        }

        .destinatario {
            margin-bottom: 20px;
        }

        .asunto {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 20px;
        }

        .contenido {
            text-align: justify;
            margin-bottom: 20px;
        }

        .despedida {
            margin-top: 30px;
        }

        .firma {
            margin-top: 2px;
            text-align: center;
        }

        .datos-personales {
            margin-top: 10px;
            text-align: center;
        }
    </style>

</head>

<body>

    <!-- @include('partials.header', ['section_title' => $title]) -->

    <div class="fecha">
        <strong>Tucupita, {{ date('d') }} de
            @php
            $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            @endphp
            {{ $meses[date('n')-1] }} de {{ date('Y') }}</strong>
    </div>

    <div class="destinatario">
        <strong>Ciudadana:</strong><br>
        <strong>MSc. Profe. Cruz Torres</strong><br>
        <strong>Directora de Escuela Carlos Rafael Contreras.</strong>
    </div>

    <div class="asunto">
        <strong>Asunto: Solicitud de disfrute de vacaciones reglamentarias.</strong>
    </div>

    <div class="contenido">
        <p>Reciba un cordial y respetuoso saludo, extendido a todo el personal que dignamente dirige.</p>

        <p>La presente tiene como finalidad dirigirme a su despacho a fines de solicitar formalmente el disfrute del período vacacional correspondiente al año en curso, derecho que hasta la fecha no he gozado de acuerdo con el cronograma de actividades de la institución Escuela Carlos Rafael Contreras.</p>

        @php
        $genero = $empleado->sexo == 'M' ? 'el' : 'la';
        $ciudadano = $empleado->sexo == 'M' ? 'el ciudadano' : 'la ciudadana';
        $desempeno = $empleado->sexo == 'M' ? 'desempeño' : 'desempeñé';
        @endphp

        <p>En la cual me {{ $desempeno }} en el cargo de <strong>{{ $empleado->cargo }}</strong>, cumpliendo con las responsabilidades inherentes al resguardo de la planta física y bienes del Estado. En este sentido, y en apego a la normativa legal vigente que rige la materia laboral y administrativa del personal del Ministerio del Poder Popular para la Educación, solicito sea gestionado mi permiso vacacional para el descanso necesario y la renovación de mis facultades físicas y mentales.</p>

        <p>El inicio para el disfrute de vacaciones está contemplada desde la siguiente fecha:_________________</p>

    </div>

    <div class="despedida">
        <p>Sin más a que hacer referencia y en espera de una respuesta favorable a la presente solicitud, queda de usted.</p>
    </div>

    <div class="firma">
        <p><strong>Atentamente,</strong></p>
        <br>
        <p><strong>________________________________________</strong></p>
        <p><strong>{{ $empleado->nombres }} {{ $empleado->apellidos }}</strong></p>
        <p><strong>C.I.: {{ $empleado->documento }}{{ $empleado->cedula }}</strong></p>
    </div>

    <!-- @include('partials.data_fecha') -->

    <!-- @include('partials.footer_2') -->

</body>

</html>