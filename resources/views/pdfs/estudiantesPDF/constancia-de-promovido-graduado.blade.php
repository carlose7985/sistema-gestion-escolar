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

    $sectionTitle = ($title_1);

    @endphp

    @include('partials.header' , ['section_title' => $sectionTitle])

    @php

    $sectionContent = ' ';

    $sectionContent .= 'certifica por medio de la presente que ';

    if ($estudiantes->sexo == 'M') {
    $sectionContent .= 'el ';
    }
    if ($estudiantes->sexo == 'F') {
    $sectionContent .= 'la ';
    }

    $sectionContent .= '
    estudiante <b><u>' . $estudiantes->name . ' ' . $estudiantes->apellido . '</b></u>,
    C.I o C.E <b><u>' . $estudiantes->documento . $estudiantes->cedula . '</b></u>,
    natural de <b><u>' . $estudiantes->lugar_de_nacimiento . '</b></u>,
    Estado <b><u>' . $estudiantes->entidad_federal . '</b></u>,'.
    ' con fecha de nacimiento ' . '<b><u>' .date('d-m-Y', strtotime($estudiantes->fecha_de_nacimiento)). '</b></u>,';


    $sectionContent .= ' cursó el ' . '<b><u>' .'6to Grado' . ' </b></u>';

    $sectionContent .= ' de EDUCACIÓN PRIMARIA en esta institución
    en el periodo escolar <b><u> ' . $estudiantes->periodo_escolar . '</b></u>
    ';

    $sectionContent .= ' correspondiendole el literal: ' . ' <b><u>' . $estudiantes->apreciacion .' </b></u>, ';

    if ($estudiantes->sexo == 'M') {
    $sectionContent .= ' siendo así ' . '<b><u>' .'PROMOVIDO' . ' </b></u>';
    }
    if ($estudiantes->sexo == 'F') {
    $sectionContent .= ' siendo así ' . '<b><u>' .'PROMOVIDA' . ' </b></u>';
    }

    $sectionContent .= ' al ' . '<b><u>' .'1er año' . ' </b></u>' . ' del nivel de
    EDUCACIÓN MEDIA, previo cumplimiento a los requisitos establecidos en Normativa Legal Vigente.';

    @endphp

    @include('partials.content', ['section' => $sectionContent])

    <div style="margin-top: -50px">
        @include('partials.data_fecha')

        @include('partials.footer_1')
    </div>

</body>
<!-- <div style="page-break-after:always;"></div> -->


</html>