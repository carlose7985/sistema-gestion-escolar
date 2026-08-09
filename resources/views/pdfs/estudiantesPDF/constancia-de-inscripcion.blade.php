<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 1.5cm 2.0cm 1.5cm 2.0cm;
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

    if (isset($estudianteData)) {
    $sectionContent .= 'hace constar por medio de la presente que ';

    if ($estudianteData->sexo == 'M') {
    $sectionContent .= 'el ';
    }
    if ($estudianteData->sexo == 'F') {
    $sectionContent .= 'la ';
    }

    $sectionContent .= '
    estudiante <b><u>' . $estudianteData->name . ' ' . $estudianteData->apellido . '</b></u>,
    C.I o C.E <b><u>' . ($estudianteData->cedula ?? '') . '</b></u>';

    // Calcular edad si no viene
    $edad = $estudianteData->age ?? ($estudianteData->fecha_de_nacimiento ? \Carbon\Carbon::parse($estudianteData->fecha_de_nacimiento)->age : null);

    if (isset($estudianteData->lugar_de_nacimiento)) {
    $sectionContent .= ' de <b><u>' . $edad . '</b></u> Años de edad,';
    }

    if (isset($estudianteData->lugar_de_nacimiento)) {
    $sectionContent .= ' natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>,';
    }

    if (isset($estudianteData->entidad_federal)) {
    $sectionContent .= ' Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>,';
    }

    $sectionContent .= ' esta formalmente ';

    if ($estudianteData->sexo == 'M') {
    $sectionContent .= 'inscrito para cursar el ';
    }
    if ($estudianteData->sexo == 'F') {
    $sectionContent .= 'inscrita para cursar el ';
    }

    $sectionContent .= '<b><u>' . ($estudianteData->grado ?? '') . '</b></u>, ';

    $sectionContent .= 'de Educación Primaria en esta institución
    en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u>.';
    } else {
    $sectionContent .= 'No se encontraron datos del estudiante.';
    }
    @endphp

    @include('partials.content', ['section' => $sectionContent])

    @include('partials.data_fecha')

    @include('partials.footer_1')

</body>

</html>