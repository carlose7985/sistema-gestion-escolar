<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 0.5cm 1.5cm 0.5cm 1.5cm;
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

    $sectionContent .= 'certifica por medio de la presente que ';

    // Verificar que $estudianteData existe
    if (isset($estudianteData)) {
    if ($estudianteData->sexo == 'M') {
    $sectionContent .= 'el ';
    }
    if ($estudianteData->sexo == 'F') {
    $sectionContent .= 'la ';
    }

    $sectionContent .= '
    estudiante <b><u>' . $estudianteData->name . ' ' . $estudianteData->apellido . '</b></u>,
    C.I o C.E <b><u>' . ($estudianteData->cedula ?? '') . '</b></u>,';

    // Verificar si existen los campos adicionales
    if (isset($estudianteData->lugar_de_nacimiento)) {
    $sectionContent .= ' natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>,';
    }

    if (isset($estudianteData->entidad_federal)) {
    $sectionContent .= ' Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>,';
    }

    if (isset($estudianteData->fecha_de_nacimiento)) {
    $sectionContent .= ' con fecha de nacimiento ' . '<b><u>' . date('d-m-Y', strtotime($estudianteData->fecha_de_nacimiento)) . '</b></u>,';
    }

    $sectionContent .= ' cursó el ' . '<b><u>' . ($estudianteData->grado ?? '') . ' </b></u>';

    $sectionContent .= ' de Educación Primaria en esta institución
    en el periodo escolar <b><u> ' . ($periodo_escolar ?? '') . '</b></u>';

    $sectionContent .= ' y no logro adquirir las
    competencias mínimas requeridas para ser promovido al grado inmediato superior, ';

    $sectionContent .= ' correspondiendole la expresión literal: ' . ' <b><u> ' . ($estudianteData->apreciacion ?? '') . ' </b></u>, ';

    $sectionContent .= ' de acuerdo con las
    categorias establecidas en la escala alfabética para la interpretación de los resultados del rendimiento
    estudiantil, emanada del Ministerio del Poder Popular para la Educación, Según Gaceta Nro 36.787
    en fecha 15-09-1999 del Régimen de evaluación para la Educación Primaria.';
    } else {
    $sectionContent .= 'No se encontraron datos del estudiante.';
    }
    @endphp

    @include('partials.content', ['section' => $sectionContent])

    <div style="margin-top: -50px">
        @include('partials.data_fecha')
    </div>
    <div style="margin-top: -10px">
        @include('partials.footer_1')
    </div>

</body>

</html>