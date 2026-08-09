</html>
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

    $sectionContent .= 'tengo a bien dirigirme hasta su
    dependencia para informarle que ';

    if ($responsable->sexo == 'M') {
    $sectionContent .= 'el ciudadano '; // Added a space after 'el' for better readability
    }
    if ($responsable->sexo == 'F') {
    $sectionContent .= 'la ciudadana '; // Added a space after 'la'
    }

    $sectionContent .= '
    <b><u>' . $responsable->name_r . '</b></u>,
    C.I <b><u>' . $responsable->documento_r . $responsable->cedula_r . '</b></u>

    asistio a esta institución el día:_________________, para participar de forma presencial en una actividad o reunión convocada  por:______________________________________
    para tratar asuntos relacionados a: ___________________________________________
    ';

    @endphp

    @include('partials.content', ['section' => $sectionContent])

    @include('partials.data_fecha')

    @include('partials.footer_2')

</body>

</html>