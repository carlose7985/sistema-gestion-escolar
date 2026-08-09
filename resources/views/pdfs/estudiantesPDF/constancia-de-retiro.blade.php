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

    // Campos opcionales
    if (isset($estudianteData->lugar_de_nacimiento)) {
    $sectionContent .= ' natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>,';
    }

    if (isset($estudianteData->entidad_federal)) {
    $sectionContent .= ' Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>,';
    }

    if (isset($estudianteData->fecha_de_nacimiento)) {
    $sectionContent .= ' con fecha de nacimiento ' . '<b><u>' . date('d-m-Y', strtotime($estudianteData->fecha_de_nacimiento)) . '</b></u>,';
    }

    $sectionContent .= ' cursó el '. '<b><u>' . ($estudianteData->grado ?? '') . '</b></u>, ';

    $sectionContent .= 'de Educación Primaria en esta institución
    en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u>,';

    if ($estudianteData->sexo == 'M') {
    $sectionContent .= ' siendo RETIRADO ';
    }
    if ($estudianteData->sexo == 'F') {
    $sectionContent .= ' siendo RETIRADA ';
    }

    // Datos del representante
    if (isset($estudianteData->name_r)) {
    $sectionContent .= ' por su representante legal '. '<b><u>' . $estudianteData->name_r . '</b></u>, ';
    }

    if (isset($estudianteData->documento_r)) {
    $sectionContent .= ' titular de la cédula de identidad '. '<b><u>' . $estudianteData->documento_r . ($estudianteData->cedula_r ?? '') . '</b></u>, ';
    }

    $sectionContent .= ' por el motivo siguiente: '. '<b><u>' . ($estudianteData->status_escolar ?? '') . '</b></u>.';
    } else {
    $sectionContent .= 'No se encontraron datos del estudiante.';
    }
    @endphp

    @include('partials.content', ['section' => $sectionContent])
    <div style="margin-top: -30px">
        @include('partials.data_fecha')
        @include('partials.footer_1')
    </div>

</body>

</html>