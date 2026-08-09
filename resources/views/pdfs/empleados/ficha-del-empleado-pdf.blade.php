<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ficha empleado</title>


    <style>
        @page {
            margin: 1.0cm 1.5cm 2.0cm 1.5cm;
        }

        #header {

            width: 100%;
            margin-top: 0cm;
            left: 0cm;
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
            top: -45px;
        }

        .color {
            color: #665e52;
        }
    </style>
</head>

<body>
    <div id="header color">
        <table class="table-header" border="0">
            <tr>
                <td class="text-left" rowspan="3" width="100%"><img src="{{ $logo->logodoc ?? '' }}" alt="imagen"
                        width="100%" height="50px" title=""></td>

            </tr>

        </table>


        <table class="table-header-a color" border="0">

            <tr>
                <td class="text-center text-11" width="100%"><b>FICHA DEL EMPLEADO</b></td>
            </tr>

        </table>


    </div>
    <div class="container color">

        <table style="width:100%;border-collapse: collapse;border:1px ; line-height: 0.6cm;margin-left: 0.1cm;"
            border="1">
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Apellidos y Nombres:</b></td>
                <td class="text-left text-12" width="60%"><span class="text-11">&nbsp;&nbsp;{{ $empleado->nombres }}
                        {{ $empleado->apellidos }}</span></td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Documento de Identidad:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->cedula }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Lugar de Nacimiento:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->lugar_de_nacimiento }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Fecha de Nacimiento:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ Carbon\Carbon::parse($empleado->fecha_de_nacimiento)->format('d-m-Y') }}</span>
                </td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Edad:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->age }}&nbsp;
                        Años</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Sexo:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->sexo }}</span></td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Dirección de Habitación:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->direccion_de_habitacion }}</span></td>
            </tr>


            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Parroquia:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->parroquia }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Email:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->correo_electronico }}</span>
                </td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Télefono:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->telefono }}</span>
                </td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Grado de Intrucción:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->grado_de_intruccion }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Titulo obtenido:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->profesion }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Status Laboral:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->situacion_laboral }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Cargo:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->tipo_de_personal }}</span>
                </td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Codigo del cargo:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->codigo_del_cargo }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Carga horaria:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->carga_horaria }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Asignación en el plantel:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->funcion_en_el_plantel }}</span></td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Dependencia:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->dependencia }}</span></td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Codigo de dependencia:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->codigo_de_dependencia }}</span></td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Condición del Cargo:</b></td>
                <td class="text-left text-12" width="60%"><span
                        class="text-11">&nbsp;&nbsp;{{ $empleado->condicion_del_cargo }}
                        {{ $empleado->status_del_cargo }}</span></td>
            </tr>

            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Ingreso al MPPE:</b></td>
                <td class="text-left text-12" width="60%"><span class="text-11">
                        &nbsp;&nbsp;{{ Carbon\Carbon::parse($empleado->fecha_de_ingreso_al_cargo)->format('d-m-Y') }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Ingreso al plantel:</b></td>
                <td class="text-left text-12" width="60%"><span class="text-11">
                        &nbsp;&nbsp;{{ Carbon\Carbon::parse($empleado->año_de_ingreso_al_plantel)->format('d-m-Y') }}</span>
                </td>
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Años de servicio:</b></td>
                @if ($empleado->ages < '1')
                    <td class="text-left text-12" width="60%"><span class="text-11">&nbsp;&nbsp;Menos de un
                            año</span>
                    </td>
                @elseif($empleado->ages == '1')
                    <td class="text-left text-12" width="60%"><span
                            class="text-11">&nbsp;&nbsp;{{ $empleado->ages }}&nbsp;Año</span></td>
                @elseif($empleado->ages > '1')
                    <td class="text-left text-12" width="60%"><span
                            class="text-11">&nbsp;&nbsp;{{ $empleado->ages }}&nbsp;Años</span></td>
                @endif
            </tr>
            <tr>
                <td class="text-left text-12" width="40%"><b>&nbsp;&nbsp;Años en el Plantel:</b></td>
                @if ($empleado->agep < '1')
                    <td class="text-left text-12" width="60%"><span class="text-11">&nbsp;&nbsp;Menos de un
                            año</span>
                    </td>
                @elseif($empleado->agep == '1')
                    <td class="text-left text-12" width="60%"><span
                            class="text-11">&nbsp;&nbsp;{{ $empleado->agep }}&nbsp;Año</span></td>
                @elseif($empleado->agep > '1')
                    <td class="text-left text-12" width="60%"><span
                            class="text-11">&nbsp;&nbsp;{{ $empleado->agep }}&nbsp;Años</span></td>
                @endif
            </tr>

        </table>
    </div>
</body>

</html>
