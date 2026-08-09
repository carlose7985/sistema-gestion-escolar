<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 1.5cm 2.0cm 1.5cm 2.0cm;
        }

        .content-header {
            text-align: justify;
            line-height: 1.7;
            margin-top: 2px;
            font-size: 1.1rem;
        }

        .content-header::first-letter {
            margin-left: 20px;
        }
    </style>
</head>

<body>
    @php
    $sectionTitle = $title;
    @endphp

    @include('partials.header' , ['section_title' => $sectionTitle])

    @php
    $sectionContent = ' ';

    if (isset($cupoestudiante) && $cupoestudiante) {
    $sectionContent .= ' tengo a bien dirigirme hasta su dependencia para informarle que acepto ';

    if ($cupoestudiante->sexo == 'M') {
    $sectionContent .= 'al ';
    }
    if ($cupoestudiante->sexo == 'F') {
    $sectionContent .= 'a la ';
    }

    $sectionContent .= '
    estudiante <b><u>' . ($cupoestudiante->name ?? '') . '</b></u>,

    C.I o C.E <b><u>' . ($cupoestudiante->documento ?? '') . ($cupoestudiante->cedula ?? '') . '</b></u>

    quien procede de la institución <b><u>' . ($cupoestudiante->institucion_procedencia ?? 'N/A') . '</b></u>,

    ubicada en la ciudad de <b><u>' . ($cupoestudiante->ciudad_procedencia ?? 'N/A') . '</b></u>,

    para cursar el <b><u>' . ($cupoestudiante->grado_nombre ?? '') . ' ' . ($cupoestudiante->seccion ?? '') . '</b></u>, de Educación Primaria en esta institución
    durante el periodo escolar <b><u> ' . ($cupoestudiante->periodo_escolar ?? '') . '</b></u>.';

    } else {
    $sectionContent .= 'No se encontraron datos del cupo.';
    }
    @endphp

    @include('partials.content', ['section' => $sectionContent])

    @include('partials.data_fecha')

    @include('partials.footer_2')
</body>

</html>