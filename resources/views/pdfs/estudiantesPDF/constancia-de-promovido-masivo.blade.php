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

        body {
            font-family: sans-serif;
        }
    </style>
</head>

<body>

    @foreach($listaEstudiantes as $estudianteData)

    {{-- BLOQUE 1: CERTIFICADO --}}
    @if($mostrarCertificado)
    {{-- Saltamos página si hay secciones siguientes O si hay más alumnos en la lista --}}
    <div class="{{ ($mostrarBuenaConducta || $mostrarDescriptivo || !$loop->last) ? 'page-break' : '' }}">
        @include('partials.header' , ['section_title' => $title_1])
        @php
        $sectionContent = 'certifica por medio de la presente que ' . ($estudianteData->sexo == 'M' ? 'el ' : 'la ') . 'estudiante <b><u>' . $estudianteData->name . ' ' . $estudianteData->apellido . '</b></u>, C.I o C.E <b><u>' . ($estudianteData->cedula ?? '') . '</b></u>';
        if (isset($estudianteData->lugar_de_nacimiento)) $sectionContent .= ', natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>';
        if (isset($estudianteData->entidad_federal)) $sectionContent .= ', Estado <b><u>' . $estudianteData->entidad_federal . '</b></u>';
        if (isset($estudianteData->fecha_de_nacimiento)) $sectionContent .= ', con fecha de nacimiento <b><u>' . date('d-m-Y', strtotime($estudianteData->fecha_de_nacimiento)) . '</b></u>';

        $sectionContent .= ', cursó el <b><u>6to Grado</b></u> de EDUCACIÓN PRIMARIA en esta institución en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u>, correspondiendole el literal: <b><u>' . ($estudianteData->apreciacion ?? '') . '</b></u>,';
        $sectionContent .= ($estudianteData->sexo == 'M' ? ' siendo así <b><u>PROMOVIDO</b></u>' : ' siendo así <b><u>PROMOVIDA</b></u>');
        $sectionContent .= ' al <b><u>1er año</b></u> del nivel de EDUCACIÓN MEDIA, previo cumplimiento a los requisitos establecidos en Normativa Legal Vigente.';
        @endphp
        @include('partials.content', ['section' => $sectionContent])
        <div style="margin-top: -50px">
            @include('partials.data_fecha')
            @include('partials.footer_1')
        </div>
    </div>
    @endif

    {{-- BLOQUE 2: BUENA CONDUCTA --}}
    @if($mostrarBuenaConducta)
    {{-- Saltamos página si falta el descriptivo O si hay más alumnos --}}
    <div class="{{ ($mostrarDescriptivo || !$loop->last) ? 'page-break' : '' }}">
        @include('partials.header' , ['section_title' => $title_2])
        @php
        $edad = $estudianteData->age;
        $sectionContent = 'hace constar por medio de la presente que ' . ($estudianteData->sexo == 'M' ? 'el ' : 'la ') . 'estudiante <b><u>' . $estudianteData->name . ' ' . $estudianteData->apellido . '</b></u>, C.I o C.E <b><u>' . ($estudianteData->cedula ?? '') . '</b></u>';
        if (isset($estudianteData->lugar_de_nacimiento)) $sectionContent .= ', natural de <b><u>' . $estudianteData->lugar_de_nacimiento . '</b></u>';
        $sectionContent .= ' de <b><u>' . $edad . '</b></u> Años de edad, cursó el <b><u>6to Grado</b></u> de Educación Primaria en esta institución en el periodo escolar <b><u> ' . ($estudianteData->periodo_escolar ?? '') . '</b></u> habiendo demostrado una BUENA CONDUCTA durante el mismo.';
        @endphp
        @include('partials.content', ['section' => $sectionContent])
        <div style="margin-top: -50px">
            @include('partials.data_fecha')
            @include('partials.footer_2')
        </div>
    </div>
    @endif

    {{-- BLOQUE 3: INFORME DESCRIPTIVO --}}
    @if($mostrarDescriptivo)
    {{-- Solo saltamos página si NO es el último alumno del lote --}}
    <div class="{{ !$loop->last ? 'page-break' : '' }}">
        @include('partials.header' , ['section_title' => $title_3])
        <div style="text-align: center; margin-top: -70px;">
            <h5><u>INFORME DESCRIPTIVO DE LA ACTUACIÓN GENERAL DEL ALUMNO(A)</u></h5>
        </div>
        <div>
            &nbsp; Nombres y Apellidos:&nbsp;<b><u>{{ $estudianteData->name }} {{ $estudianteData->apellido }}</u></b>
            &nbsp; Edad:&nbsp; <b><u>{{ $estudianteData->age }}</u></b>
            &nbsp; Grado:&nbsp; <b><u>{{ $estudianteData->grado ?? '' }} {{ $estudianteData->seccion ?? '' }}</u></b>
        </div>
        <div style="text-align: center;font-size: 1.0rem;line-height: 1.7;">
            @for ($i = 0; $i < 16; $i++)
                _________________________________________________________________________________<br>
                @endfor
        </div>
        <div style="margin-top: -20px">
            @include('partials.footer_3')
        </div>
    </div>
    @endif

    @endforeach

</body>

</html>