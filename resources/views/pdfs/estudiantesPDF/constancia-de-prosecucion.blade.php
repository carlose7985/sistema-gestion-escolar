<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 1.5cm 2.0cm 1.5cm 2.0cm;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    {{-- BLOQUE 1: CONSTANCIA DE PROSECUCIÓN --}}
    @if($mostrarConstancia)
    <div class="{{ $mostrarDescriptivo ? 'page-break' : '' }}">
        @php
        $sectionTitle = $title_1;
        $sectionTitles = $title_2;
        @endphp

        @include('partials.header' , ['section_title' => $sectionTitle, 'section_titles' => $sectionTitles])

        @php
        $sectionContent = 'certifica por medio de la presente que ';
        $sectionContent .= ($estudianteData->sexo == 'M' ? 'el ' : 'la ') . 'estudiante <b><u>' . $estudianteData->name . ' ' . $estudianteData->apellido . '</b></u>, C.I o C.E <b><u>' . ($estudianteData->cedula ?? '') . '</b></u>';

        if (isset($estudianteData->lugar_de_nacimiento)) $sectionContent .= ', natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>';
        if (isset($estudianteData->entidad_federal)) $sectionContent .= ', Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>';
        if (isset($estudianteData->fecha_de_nacimiento)) $sectionContent .= ', con fecha de nacimiento <b><u>' . date('d-m-Y', strtotime($estudianteData->fecha_de_nacimiento)) . '</b></u>';

        $sectionContent .= ', cursó el <b><u>' . ($estudianteData->grado ?? '') . ' </b></u> de Educación Primaria en esta institución en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u>, correspondiendole el literal: <b><u>' . ($estudianteData->apreciacion ?? '') . '</b></u>,';
        $sectionContent .= ($estudianteData->sexo == 'M' ? ' siendo así <b><u>PROMOVIDO</b></u>' : ' siendo así <b><u>PROMOVIDA</b></u>');

        $grados = ['1er Grado' => '2do Grado', '2do Grado' => '3er Grado', '3er Grado' => '4to Grado', '4to Grado' => '5to Grado', '5to Grado' => '6to Grado'];
        $gradoSiguiente = $grados[$estudianteData->grado] ?? '';

        if ($gradoSiguiente) $sectionContent .= ' al <b><u>' . $gradoSiguiente . '</b></u>';
        $sectionContent .= ' del nivel de EDUCACIÓN PRIMARIA, previo cumplimiento a los requisitos establecidos en Normativa Legal Vigente.';
        @endphp

        @include('partials.content', ['section' => $sectionContent])

        <div style="margin-top: -50px">
            @include('partials.data_fecha')
            @include('partials.footer_1')
        </div>
    </div>
    @endif

    {{-- BLOQUE 2: INFORME DESCRIPTIVO --}}
    @if($mostrarDescriptivo)
    <div>
        @include('partials.header' , ['section_title' => $title_3])
        <div style="text-align: center; margin-top: -70px;">
            <h5><u>INFORME DESCRIPTIVO DE LA ACTUACIÓN GENERAL DEL ALUMNO(A)</u></h5>
        </div>
        <div>
            &nbsp; Nombres y Apellidos:&nbsp;<b><u>{{ $estudianteData->name }} {{ $estudianteData->apellido }}</u></b>
            &nbsp; Edad:&nbsp; <b><u>{{ $estudianteData->age ?? Carbon\Carbon::parse($estudianteData->fecha_de_nacimiento)->age }}</u></b>
            &nbsp; Grado:&nbsp; <b><u>{{ $estudianteData->grado ?? '' }} {{ $estudianteData->seccion ?? '' }}</u></b>
        </div>
        <div style="text-align: center;font-size: 1.0rem;line-height: 1.7;">
            @for ($i = 0; $i < 18; $i++)
                _________________________________________________________________________________<br>
                @endfor
        </div>
        <div style="margin-top: -30px">
            @include('partials.footer_3')
        </div>
    </div>
    @endif

</body>

</html>