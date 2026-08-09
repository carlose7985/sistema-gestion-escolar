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

    if ($edad) {
    $sectionContent .= ' de <b><u>' . $edad . '</b></u> Años de edad,';
    }

    if (isset($estudianteData->lugar_de_nacimiento)) {
    $sectionContent .= ' natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>,';
    }

    if (isset($estudianteData->entidad_federal)) {
    $sectionContent .= ' Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>,';
    }

    // Determinar si es activo o egresado según el status
    $esEgresado = isset($status) && str_contains($status, 'egresado');

    if ($esEgresado) {
    $sectionContent .= ' cursó el <b><u>6to Grado</b></u>';
    } else {
    $sectionContent .= ' cursa actualmente el <b><u>' . ($estudianteData->grado ?? '') . ' </b></u>';
    }

    $sectionContent .= ' de Educación Primaria en esta institución
    en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u>';

    if ($esEgresado) {
    $sectionContent .= ' habiendo demostrado una BUENA CONDUCTA durante el mismo.';
    } else {
    $sectionContent .= ' demostrando una BUENA CONDUCTA y desenvolvimiento positivo en el entorno escolar.';
    }
    } else {
    $sectionContent .= 'No se encontraron datos del estudiante.';
    }
    @endphp

    @include('partials.content', ['section' => $sectionContent])

    @include('partials.data_fecha')

    @include('partials.footer_2')

</body>

</html>