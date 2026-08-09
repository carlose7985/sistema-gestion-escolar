<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ficha de inscripción inicial</title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: 2.5cm;
            width: 100%;
        }

        .text-9 {
            font-size: 9pt !important;
        }

        .text-10 {
            font-size: 10pt !important;
        }

        .text-11 {
            font-size: 11pt !important;
            font-family: 'Rock Salt', cursive;
        }

        .text-12 {
            font-size: 12pt !important;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        table.table-header {
            width: 100%;
            border-collapse: collapse;
            border: none;
        }

        table.table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.6cm;
            margin-bottom: 0.5rem;
        }

        th,
        td {
            font-size: 10pt;
        }

        table.table-footer {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.5cm;
        }

        table.table-footer2 {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.5cm;
        }

        .image {
            position: relative;
            width: 90px;
            height: 80px;
            float: right;
            top: -40px;
        }

        .image2 {
            position: relative;
            width: 90px;
            height: 80px;
            float: right;
            top: -5px;
        }

        .image3 {
            position: relative;
            width: 90px;
            height: 80px;
            float: right;
            top: -5px;
        }

        .image4 {
            position: relative;
            width: 90px;
            height: 80px;
            float: right;
            top: -5px;
        }

        b {
            color: #454545;
        }
    </style>
</head>

<body>
    <div id="header">
        <table class="table-header" border="0">
            <tr>
                <td class="text-left" rowspan="3"><img src="{{ $logoDocumento }}" alt="imagen" width="100%"
                        height="50px" title=""></td>
            </tr>
        </table>

        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-12" width="100%"><b>FICHA DE INCRIPCIÓN</b></td>
            </tr>
        </table>

        <table class="table-header-a" border="0">
            <tr>
                <td class="text-right" width="80%"><b>Periodo Escolar:&nbsp;
                        <b><u> {{ $estudianteData->periodo_escolar ?? 'N/A' }}</u></b>
                </td>
                <td class="text-right" width="20%">Fecha:&nbsp;
                    <b><u>{{ Carbon\Carbon::now()->format('d-m-Y') }}</u></b>
                </td>
            </tr>
        </table>

        <table class="table-header-a" border="0">
            <tr>
                <td class="text-left" width="20%">
                    Grado:&nbsp;<b><u>{{ $estudianteData->grado ?? '' }} {{ $estudianteData->seccion ?? '' }}</u></b>
                </td>
                <td class="text-right" width="80%">
                    Docente(s):&nbsp; <b><u>{{ $estudianteData->docente ?? '' }}</u></b>
                </td>
            </tr>
        </table>
    </div>

    <div id="footer">
        <table class="table-footer2">
            <tr>
                <th class="text-center" width="33%">________________________________ </th>
                <th class="text-center" width="33%">________________________________</th>
                <th class="text-center" width="33%">_______________________________</th>
            </tr>
            <tr>
                <td class="text-center" width="33%"><b>Docente</b> </td>
                <td class="text-center" width="33%"><b>Director</b></td>
                <td class="text-center" width="33%"><b>Representante</b></td>
            </tr>
        </table>
    </div>

    <div class="container">
        <div class="image2">
            <img src="img/children.png" alt="imagen" width="70px" height="50px" title="">
        </div>

        <table style="width: 100%;border-collapse: collapse;border: none;" border="0">
            <thead>
                <tr>
                    <th class="text-center" width="100%"><b>I. IDENTIFICACIÓN DEL ESTUDIANTE</b></th>
                </tr>
            </thead>
        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;">
            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="100%"><b>Nombres y Apellidos:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->name ?? '' }} {{ $estudianteData->apellido ?? '' }}</u></span></td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm; margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>C.E o C.I:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->documento ?? '' }}{{ $estudianteData->cedula ?? '' }}</u></span></td>
                    <td class="text-center text-12"><b>F.N:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->fecha_de_nacimiento ? Carbon\Carbon::parse($estudianteData->fecha_de_nacimiento)->format('d-m-Y') : '' }}</u></span>
                    </td>
                    <td class="text-center text-12"><b>Edad:&nbsp;</b><span class="text-11"><u>{{ $estudianteData->edad ?? '' }}
                                Años</u></span></td>
                    <td class="text-center text-12"><b>Sexo:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->sexo ?? '' }}</u></span>&nbsp;&nbsp;</td>
                    <td class="text-right text-12"><b>Apreciación:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->apreciacion ?? '' }}</u></span>&nbsp;&nbsp;
                    </td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Lugar de Nacimiento:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->lugar_de_nacimiento ?? '' }} Edo.
                                {{ $estudianteData->entidad_federal ?? '' }}</u></span>
                    </td>
                </tr>
                <tr>
                    <td class="text-left text-12"><b>Dirección:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->direccion ?? '' }}</u></span>&nbsp;&nbsp;
                    </td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="70%"> <b>Ins. de Procedencia:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->instituto_de_procedencia ?? '' }}</u></span>
                    </td>
                </tr>
                <tr>
                    <td class="text-left text-12" width="30%"><b>Etnia:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->etnia ?? '' }}</u></span>&nbsp;&nbsp;
                    </td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Talla de Camisa:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->talla_de_camisa ?? '' }}</u></span></td>
                </tr>
                <tr>
                    <td class="text-left text-12"><b>Talla de Pantalón:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->talla_de_pantalon ?? '' }}</u></span></td>
                </tr>
                <tr>
                    <td class="text-left text-12"><b>Talla de Zapato:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->talla_de_zapato ?? '' }}</u></span>&nbsp;&nbsp;
                    </td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    @if (($estudianteData->enfermedades ?? '') == 'No')
                    <td class="text-left text-12" width="70%"><b>Enfermedades Padecidas:&nbsp;</b><span
                            class="text-11"><u>Ninguna</u></span>&nbsp;&nbsp;</td>
                    @else
                    <td class="text-left text-12" width="70%"><b>Enfermedades Padecidas:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->enfermedades ?? '' }}</u></span>&nbsp;&nbsp;</td>
                    @endif
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="100%"><b>Requiere Tratamiento Médico?</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->tratamiento_medico ?? '' }}</u></span>
                    </td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Es alergico?:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudianteData->alergico ?? '' }}</u></span></td>
                </tr>
                <tr>
                    <td class="text-left text-12"><b>Condición Especial:&nbsp;</b><span
                            class="text-11"><u>{{ $estudianteData->condicion_especial ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Problemas Físicos:</b>&nbsp;
                        <span class="text-11">
                            <u>{{ $estudianteData->problemas_fisicos ?? '' }}</u>&nbsp;&nbsp;
                        </span>
                    </td>
                </tr>
            </table>
        </table>

        <br>
        <div class="image4">
            <img src="img/representant.jpg" alt="imagen" width="70px" height="50px" title="">
        </div>
        <table style="width: 100%;border-collapse: collapse;border: none;" border="0">
            <thead>
                <tr>
                    <th class="text-center" width="100%"><b>II. DATOS DEL REPRESENTANTE</b></th>
                </tr>
            </thead>
        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;">
            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="100%"><b>Apellidos y Nombres:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->representante->name_r ?? '' }}</u></span></td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm; margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Cédula de Identidad:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->representante->documento_r ?? '' }}{{ $estudiante->representante->cedula_r ?? '' }}</u></span>
                    </td>
                    <td class="text-center text-12"><b>Fecha de Nacimiento:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->representante->fecha_de_nacimiento_r ? Carbon\Carbon::parse($estudiante->representante->fecha_de_nacimiento_r)->format('d-m-Y') : '' }}</u></span>
                    </td>
                    <td class="text-center text-12"><b>Edad:&nbsp;</b><span
                            class="text-11"><u>{{ $edad_r ?? '' }}</u></span></td>
                    <td class="text-right text-12"><b>Sexo:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->representante->sexo_r ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="35%"><b>Dirección:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->representante->direccion_r ?? '' }}</u></span></td>
                    <td class="text-center text-12" width="35%"><b>Ocupación:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->representante->ocupacion_r ?? '' }}</u></span></td>
                    <td class="text-right text-12" width="30%"><b>Télefono:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->representante->telefono_r ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="30%"><b>Parentesco:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->representante->parentesco ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>
        </table>

        <br>
        <div class="image3">
            <img src="img/father.jpg" alt="imagen" width="70px" height="50px" title="">
        </div>
        <table style="width: 100%;border-collapse: collapse;border: none;" border="0">
            <thead>
                <tr>
                    <th class="text-center" width="100%"><b>III. DATOS DEL PADRE/MADRE</b></th>
                </tr>
            </thead>
        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;">
            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="100%"><b>Apellidos y Nombres:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->padre->name_r ?? '' }}</u></span></td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm; margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12"><b>Cédula de Identidad:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->padre->documento_r ?? '' }}{{ $estudiante->padre->cedula_r ?? '' }}</u></span>
                    </td>
                    <td class="text-center text-12"><b>Fecha de Nacimiento:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->padre->fecha_de_nacimiento_r ? Carbon\Carbon::parse($estudiante->padre->fecha_de_nacimiento_r)->format('d-m-Y') : '' }}</u></span>
                    </td>
                    <td class="text-center text-12"><b>Edad:&nbsp;</b><span
                            class="text-11"><u>{{ $edad_p ?? '' }}</u></span></td>
                    <td class="text-right text-12"><b>Sexo:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->padre->sexo_r ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>

            <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;">
                <tr>
                    <td class="text-left text-12" width="35%"><b>Dirección:&nbsp;</b><span
                            class="text-11"><u>{{ $estudiante->padre->direccion_r ?? '' }}</u></span></td>
                    <td class="text-center text-12" width="35%"><b>Ocupación:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->padre->ocupacion_r ?? '' }}</u></span></td>
                    <td class="text-right text-12" width="30%"><b>Télefono:</b>&nbsp;<span
                            class="text-11"><u>{{ $estudiante->padre->telefono_r ?? '' }}</u></span>&nbsp;&nbsp;</td>
                </tr>
            </table>
        </table>
    </div>
</body>

</html>