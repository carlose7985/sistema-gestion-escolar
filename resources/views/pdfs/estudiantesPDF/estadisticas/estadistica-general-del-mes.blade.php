<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen estadistico del mes</title>
    <style>
        @page {
            margin: 1.0cm 0.5cm 1.0cm 0.5cm;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: -1.2cm;
            width: 100%;

        }

        .text-8 {
            font-size: 8pt !important;
        }

        .text-9 {
            font-size: 9pt !important;
        }

        .text-10 {
            font-size: 10pt !important;
        }

        .text-11 {
            font-size: 11pt !important;
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
            line-height: 0.6cm;

        }

        table.table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.6cm;
        }

        th,
        td {
            font-size: 11pt;
        }

        table.table-footer {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            line-height: 0.8cm;
        }

        .table-center {
            position: apsolute;
            width: 70%;
            float: right;
            margin-top: -500px;
        }

        .table-left {
            width: 40%;

        }

        .table-right {
            width: 55%;

        }

        .table-leftt {
            width: 49%;

        }

        .table-rightt {
            width: 49%;

        }
    </style>
</head>

<body>
    <div id="">
        <table class="table-header" border="0">
            <tr>
                <td width="100%"><img src="{{ $logoDocumento }}" alt="imagen" width="100%" height="50px"
                        title=""></td>
            </tr>
            <tr>
                <td class="text-center " width="100%"><big><b>RESUMEN ESTADISTICO PRIMARIA</b></big></td>
            </tr>
        </table>


        <table class="table-header-a" border="0">

            <tr>
                @foreach ($estadisticas as $e)
                <td class="text-center">RESUMEN ESTADISTICO DEL MES:&nbsp; <b><u>{{ ucfirst(Carbon\Carbon::parse($e->fecha)->translatedFormat('F')) }}
                            {{ Carbon\Carbon::parse($e->fecha)->year }}
                        </u></b></td>
                <td class="text-left">AÑO ESCOLAR:&nbsp;
                    @if ($proceso_de_inscripcion == 'Abierto')
                    <b><u> {{ $periodo_escolar_pasado }}</u></b>
                    @else
                    <b><u> {{ $periodo_escolar_actual }}</u></b>
                    @endif
                </td>
                @endforeach
            </tr>

        </table>
    </div>

    <div class="" style="margin-top:5px;">
        @if ($institucion && count($institucion) > 0)
        <table style="width:100%;border-collapse:collapse;border:1px solid black;" border="1">


            <tr>
                <th class="text-left text-9">&nbsp;PLANTEL</th>
                <th class="text-center text-9">CÓDIGO</th>
                <th class="text-center text-9">DEPENDENCIA</th>
                <th class="text-center text-9">LOCALIDAD</th>
                <th class="text-center text-9">MUNICIPIO</th>
                <th class="text-center text-9">PARROQUIA</th>
                <th class="text-center text-9">SECTOR</th>


            </tr>
            <tr>
                @foreach ($institucion as $i)
                <td class="text-left">&nbsp;{{ $i->nombre_de_la_institucion }}</td>
                <td class="text-center">{{ $i->codigo_dea }}</td>
                <td class="text-center">{{ $i->dependencia }}</td>
                <td class="text-center">{{ $i->estado }}</td>
                <td class="text-center">{{ $i->municipio }}</td>
                <td class="text-center">{{ $i->parroquia }}</td>
                <td class="text-center">{{ $i->direccion }}</td>
                @endforeach
            </tr>




        </table>
        @else
        <center>
            <b>los datos de la INSTITUCION no están disponibles debe registrarlos en el modulo DATOS BASICOS.</b>
        </center>
        @endif
        <table style="width:100%;border-collapse:collapse;border:1px solid black;" border="1">


            <tr>
                <th class="text-left text-9" colspan="2">&nbsp;TURNO</th>
                <th class="text-center text-9" colspan="3">MEDIO</th>
                <th class="text-center text-9" colspan="3">ESCUELA</th>
                <th class="text-center text-9" colspan="3">CAPACIDAD</th>
                <th class="text-center text-9" colspan="2">DOC</th>
                <th class="text-center text-9" colspan="2">OBRE</th>
                <th class="text-center text-9" colspan="2">ADMIN</th>
                <th class="text-center text-9" colspan="2">CENAE</th>
                <th class="text-center text-9" colspan="2">VIGI</th>

            </tr>

            <tr>
                <th class="text-center text-8 text-gray-900">M</th>
                <th class="text-center text-8 text-gray-900">T</th>
                <th class="text-center text-8 text-gray-900">URB.</th>
                <th class="text-center text-8 text-gray-900">RURAL</th>
                <th class="text-center text-8 text-gray-900">FRONTERA INDIGENA</th>
                <th class="text-center text-8 text-gray-900">NAC.</th>
                <th class="text-center text-8 text-gray-900">ESTADAL.</th>
                <th class="text-center text-8 text-gray-900">PRI/SIBV</th>
                <th class="text-center text-8 text-gray-900">AULAS</th>
                <th class="text-center text-8 text-gray-900">SECCIONES</th>
                <th class="text-center text-8 text-gray-900">OTROS</th>
                <th class="text-center text-8 text-gray-900">N</th>
                <th class="text-center text-8 text-gray-900">E</th>
                <th class="text-center text-8 text-gray-900">N</th>
                <th class="text-center text-8 text-gray-900">E</th>
                <th class="text-center text-8 text-gray-900">N</th>
                <th class="text-center text-8 text-gray-900">E</th>
                <th class="text-center text-8 text-gray-900">N</th>
                <th class="text-center text-8 text-gray-900">E</th>
                <th class="text-center text-8 text-gray-900">N</th>
                <th class="text-center text-8 text-gray-900">E</th>
            </tr>
            @foreach ($institucion as $i)
            <tr>
                @if ($i->turno == 'Mañana')
                <td class="text-center">X</td>
                <td class="text-center"></td>
                @else
                <td class="text-center"></td>
                <td class="text-center">X</td>
                @endif

                @if ($i->medio == 'Urbano')
                <td class="text-center">X</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                @endif
                @if ($i->medio == 'Rural')
                <td class="text-center"></td>
                <td class="text-center">X</td>
                <td class="text-center"></td>
                @endif
                @if ($i->medio == 'Frontera Indigena')
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center">X</td>
                @endif

                @if ($i->tipo_de_escuela == 'Nacional')
                <td class="text-center">X</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                @endif

                @if ($i->tipo_de_escuela == 'Estadal')
                <td class="text-center"></td>
                <td class="text-center">X</td>
                <td class="text-center"></td>
                @endif
                @if ($i->tipo_de_escuela == 'Privada')
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center">X</td>
                @endif
                @if ($i->tipo_de_escuela == 'Subvencionada')
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center">X</td>
                @endif

                <td class="text-center">{{ $i->numero_de_aulas }}</td>

                <td class="text-center">{{ $i->numero_de_secciones }}</td>
                <td class="text-center">{{ $i->otras_aulas }}</td>
                @foreach ($total_empleados as $e)
                <td class="text-center">{{ $e->docenteN }}</td>
                <td class="text-center">{{ $e->docenteE  }}</td>

                <td class="text-center">{{ $e->obreroN }}</td>
                <td class="text-center">{{ $e->obreroE }}</td>

                <td class="text-center">{{ $e->adminN }}</td>
                <td class="text-center">{{ $e->adminE }}</td>

                <td class="text-center">{{ $e->cenaeN }}</td>
                <td class="text-center">{{ $e->cenaeE }}</td>


                <td class="text-center">{{ $e->vigiN }}</td>
                <td class="text-center">{{ $e->vigiE }}</td>
                @endforeach

            </tr>
            @endforeach

        </table>

    </div>

    <div class="table-left" style="float:left;margin-top:20px;">

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height:25px;" border="1">

            <tr>
                <th class="text-center text-10" rowspan="2">RESUMEN DE LA MATRICULA</th>
                <th class="text-center" colspan="3">sexo</th>
            </tr>

            <tr>
                <th class="text-center" width="8%">M</th>
                <th class="text-center" width="8%">F</th>
                <th class="text-center" width="8%">T</th>
            </tr>
            @foreach ($ingresados as $i)
            @foreach ($egresados as $e)
            @foreach ($estudiantesactuales as $es)
            <tr>
                <th class="text-left text-9">&nbsp;TOTAL DE ALUMNOS PARA EL 1ER DÍA DEL MES</th>
                <th class="text-center">{{ $es->totalactualesM - $i->ingresoM + $e->egresoM }}</th>
                <th class="text-center">{{ $es->totalactualesF - $i->ingresoF + $e->egresoF }}</th>
                <th class="text-center">
                    {{ $es->totalactualesM - $i->ingresoM + $e->egresoM + $es->totalactualesF - $i->ingresoF + $e->egresoF }}
                </th>
            </tr>

            <tr>
                <th class="text-left text-9">&nbsp;ALUMNOS MATRICULADOS EN EL MES</th>
                <th class="text-center">{{ $i->ingresoM }}</th>
                <th class="text-center">{{ $i->ingresoF }}</th>
                <th class="text-center">{{ $i->ingresot }}</th>
            </tr>

            <tr>
                <th class="text-left text-9">&nbsp;TOTAL DE ALUMNOS RETIRADOS EN EL MES</th>
                <th class="text-center">{{ $e->egresoM }}</th>
                <th class="text-center">{{ $e->egresoF }}</th>
                <th class="text-center">{{ $e->egresot }}</th>
            </tr>
            <tr>
                <th class="text-left text-9">&nbsp;TOTAL ALUMNOS PARA EL ULTIMO DÍA DEL MES</th>
                <th class="text-center">{{ $es->totalactualesM }}</th>
                <th class="text-center">{{ $es->totalactualesF }}</th>
                <th class="text-center">{{ $es->totalactuales }}</th>
            </tr>
            @endforeach
            @endforeach
            @endforeach
        </table>

        <table style="width: 100%;border-collapse:collapse;margin-top:35px;line-height:30px;" border="1">
            <thead>
                @foreach ($estadisticas as $esta)
                <tr>
                    <th class="text-left text-9" width="60%">&nbsp;NÚMERO DE DÍAS HABILES</th>
                    <th class="text-center">{{ $esta->dias_habiles }} Días</th>
                </tr>

                <tr>

                    <th class="text-left text-9" width="60%">&nbsp;NÚMERO DE DÍAS LABORADOS</th>
                    <th class="text-center">{{ $esta->dias_laborados }} Días</th>
                </tr>
                @endforeach

            </thead>
        </table>


        <table style="width: 100%;border-collapse:collapse;margin-top:33px;line-height:30px;" border="1">
            <thead>

                <tr>
                    <th class="text-left text-8" width="40%">&nbsp;NOMBRE DEL DIRECTOR</th>
                    <th class="text-left"></th>
                </tr>

                <tr>

                    <th class="text-left text-8" width="40%">&nbsp;CÉDULA DE IDENTIDAD</th>
                    <th class="text-left"></th>
                </tr>
                <tr>

                    <th class="text-left text-8" width="40%">&nbsp;FIRMA</th>
                    <th class="text-center"></th>
                </tr>

                <tr>

                    <th class="text-center text-8" colspan="2" style="line-height:70px;">&nbsp;SELLO</th>

                </tr>



            </thead>
        </table>



    </div>

    <div class="table-right" style="float:right;margin-top:10px;">

        <!-- esta tabla destinada a porcentaje de asistencia por cargo. -->
        <table style="width: 100%;border-collapse:collapse;margin-top:10px" border="1">
            <thead>
                <tr>
                    <th class="text-center text-9" colspan="6" width="15%">PORCENTAJE DE ASISTENCIA DEL PERSONAL</th>

                </tr>
                <tr>
                    <th class="text-center text-9" width="15%">DOCENTE</th>
                    <th class="text-center text-9" width="15%">OBRERO</th>
                    <th class="text-center text-9" width="15%">ADMIN</th>
                    <th class="text-center text-9" width="15%">CENAE</th>
                    <th class="text-center text-9" width="15%">VIGI</th>
                    <th class="text-center text-9" width="15%">Total</th>
                </tr>
            </thead>

            <tr>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajesPersonal['Docente'] ?? 0, 0) }}%
                </td>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajesPersonal['Obrero'] ?? 0, 0) }}%
                </td>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajesPersonal['Administrativo'] ?? 0, 0) }}%
                </td>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajesPersonal['Cenae'] ?? 0, 0) }}%
                </td>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajesPersonal['Vigilante'] ?? 0, 0) }}%
                </td>
                <td class="text-center" width="15%">
                    {{ number_format($porcentajeTotalPersonal, 0) }}%
                </td>
            </tr>
        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height:18px;margin-top:15px"
            border="1">
            <tr>
                <th class="text-center text-9" colspan="9">ALUMNOS INSCRITOS CLASIFICADOS POR GRADO Y SEXO</th>
            </tr>
            <tr>
                <th class="text-center text-9">DEP</th>
                <th class="text-center text-9">SEXO</th>
                <th class="text-center text-8">1er grado</th>
                <th class="text-center text-9">2do grado</th>
                <th class="text-center text-8">3er grado</th>
                <th class="text-center text-8">4to grado</th>
                <th class="text-center text-8">5to grado</th>
                <th class="text-center text-8">6to grado</th>
                <th class="text-center text-9 ">TOTAL</th>

            </tr>
            @foreach ($totalalumnos as $t)
            <tr>
                <th class="text-center text-9" rowspan="3">NAC.</th>
                <th class="text-center text-9">MASC</th>
                @foreach ($grados as $g)
                @if ($g->grado == '1er Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '2do Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '3er Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '4to Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '5to Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '6to Grado')
                <th class="text-center">{{ $g->totalm }}</th>
                @endif
                @endforeach
                <th class="text-center">{{ $t->totalm }}</th>
            </tr>
            <tr>

                <th class="text-center text-9">FEM</th>
                @foreach ($grados as $g)
                @if ($g->grado == '1er Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '2do Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '3er Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '4to Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '5to Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '6to Grado')
                <th class="text-center">{{ $g->totalf }}</th>
                @endif
                @endforeach
                <th class="text-center">{{ $t->totalf }}</th>

            </tr>
            <tr>

                <th class="text-center text-9">TOTAL</th>
                @foreach ($grados as $g)
                @if ($g->grado == '1er Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '2do Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '3er Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '4to Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '5to Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                @foreach ($grados as $g)
                @if ($g->grado == '6to Grado')
                <th class="text-center">{{ $g->total }}</th>
                @endif
                @endforeach
                <th class="text-center">{{ $t->totalm + $t->totalf }}</th>
            </tr>
            @endforeach
        </table>



        @if ($asistenciascount > 0)
        <table style="width:100%;border-collapse: collapse;border:1px solid black;line-height:15px;margin-top:15px"
            border="1">
            <tr>
                <th class="text-center text-10" rowspan="2">Grado</th>
                <th class="text-center text-9" colspan="3">Matricula general</th>
            </tr>
            <tr>
                <th class="text-center">V</th>
                <th class="text-center">H</th>
                <th class="text-center">T</th>
            </tr>

            @foreach ($total_alumnos_por_edad_y_grado as $t)
            <tr>
                <th class="text-center">{{ $t->grado }}</th>
                <td class="text-center">{{ $t->totalm }}</td>
                <td class="text-center">{{ $t->totalf }}</td>
                <td class="text-center">{{ $t->totalm + $t->totalf }}</td>


            </tr>
            @endforeach

            @foreach ($total_alumnos_por_edad as $t)
            <tr>
                <th class="text-center">Total</th>
                <td class="text-center">{{ $t->totalm }}</td>
                <td class="text-center">{{ $t->totalf }}</td>
                <td class="text-center">{{ $t->totalm + $t->totalf }}</td>

            </tr>
            @endforeach
        </table>

        <table
            style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height:18px;margin-top:15px"
            border="1">
            <tr>
                <th class="text-center text-9" colspan="8">PROMEDIO DE ASISTENCIAS POR GRADO Y SEXO</th>
            </tr>
            <tr>
                <th class="text-center text-9">SEXO</th>
                <th class="text-center text-8">1er grado</th>
                <th class="text-center text-9">2do grado</th>
                <th class="text-center text-8">3er grado</th>
                <th class="text-center text-8">4to grado</th>
                <th class="text-center text-8">5to grado</th>
                <th class="text-center text-8">6to grado</th>
                <th class="text-center text-9">TOTAL</th>

            </tr>
            @foreach ($estadisticas as $x)
            <tr>
                <th class="text-center text-9">MASC</th>
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '1er Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '2do Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '3er Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '4to Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '5to Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasv as $av)
                @if ($av->grado == '6to Grado')
                <th class="text-center">{{ number_format($av->totalv / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastv as $avt)
                <th class="text-center">{{ number_format($avt->totalesv / 6 / $x->dias_laborados, 0) }}%
                </th>
                @endforeach
            </tr>
            <tr>

                <th class="text-center text-9">FEM</th>
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '1er Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '2do Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '3er Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '4to Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '5to Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciash as $ah)
                @if ($ah->grado == '6to Grado')
                <th class="text-center">{{ number_format($ah->totalh / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciasth as $aht)
                <th class="text-center">{{ number_format($aht->totalesh / 6 / $x->dias_laborados, 0) }}%
                </th>
                @endforeach

            </tr>
            <tr>
                <th class="text-center text-9">TOTAL</th>
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '1er Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '2do Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '3er Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '4to Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '5to Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach
                @foreach ($asistenciastotales as $a)
                @if ($a->grado == '6to Grado')
                <th class="text-center">{{ number_format($a->total / $x->dias_laborados, 0) }}%</th>
                @endif
                @endforeach

                @foreach ($asistenciasth as $aht)
                @foreach ($asistenciastv as $avt)
                <th class="text-center">
                    {{ number_format($aht->totalesh / 6 / $x->dias_laborados, 0) + number_format($avt->totalesv / 6 / $x->dias_laborados, 0) }}%
                </th>
                @endforeach
                @endforeach
            </tr>
            @endforeach
        </table>

        @else
        <table
            style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height:18px;margin-top:10px"
            border="1">
            <tr>
                <th class="text-center" colspan="9">PROMEDIO DE ASISTENCIAS POR GRADO Y SEXO</th>
            </tr>
            <tr>
                <th class="text-center">DEP</th>
                <th class="text-center">SEXO</th>
                <th class="text-center">1°</th>
                <th class="text-center">2°</th>
                <th class="text-center">3°</th>
                <th class="text-center">4°</th>
                <th class="text-center">5°</th>
                <th class="text-center">6°</th>
                <th class="text-center">TOTAL</th>

            </tr>
            <tr>

                <th class="text-center" rowspan="3">NAC.</th>

                <th class="text-center">MASC</th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
            </tr>
            <tr>

                <th class="text-center">FEM</th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>

            </tr>
            <tr>

                <th class="text-center">TOTAL</th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
                <th class="text-center"></th>
            </tr>

        </table>

        <table
            style="width:100%;border-collapse: collapse;border: 1px solid black;line-height:18px;margin-top:10px"
            border="1">
            <tr>
                <th class="text-center" colspan="3">Asistencia</th>
                <th class="text-center" width="5%" rowspan="2">Prom</th>
            </tr>
            <tr>
                <th class="text-center">V</th>
                <th class="text-center">H</th>
                <th class="text-center">T</th>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
            <tr>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0</td>
                <td class="text-center">0%</td>
            </tr>
        </table>
        @endif




    </div>

    <div style="page-break-after:always;"> </div>

    <div class="table-leftt" style="float:left;">
        <table style="width: 100%;border-collapse:collapse;margin-top:20px;line-height:15px;" border="1">
            <thead>

                <tr>
                    <th class="text-center text-9" colspan="14">ALUMNOS POR GRADO EDAD Y SEXO</th>
                </tr>
                <tr>
                    <th class="text-center text-9" colspan="14">MASCULINO</th>
                </tr>

                <tr>

                    <th class="text-center text-9">GRADO</th>
                    <th class="text-center">5</th>
                    <th class="text-center">6</th>
                    <th class="text-center">7</th>
                    <th class="text-center">8</th>
                    <th class="text-center">9</th>
                    <th class="text-center">10</th>
                    <th class="text-center">11</th>
                    <th class="text-center">12</th>
                    <th class="text-center">13</th>
                    <th class="text-center">14</th>
                    <th class="text-center">15</th>
                    <th class="text-center">16</th>
                    <th class="text-center">Total</th>

                </tr>

                @foreach ($total_alumnos_por_edad_y_grado as $t)
                <tr>
                    <th class="text-center">{{ $t->grado }}</th>
                    @if ($t->cuatrom + $t->cincom > 0)
                    <td class="text-center">{{ $t->cuatrom + $t->cincom }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->seism > 0)
                    <td class="text-center">{{ $t->seism }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->sietem > 0)
                    <td class="text-center">{{ $t->sietem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->ochom > 0)
                    <td class="text-center">{{ $t->ochom }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->nuevem > 0)
                    <td class="text-center">{{ $t->nuevem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->diezm > 0)
                    <td class="text-center">{{ $t->diezm }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->oncem > 0)
                    <td class="text-center">{{ $t->oncem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->docem > 0)
                    <td class="text-center">{{ $t->docem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->trecem > 0)
                    <td class="text-center">{{ $t->trecem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->catorcem > 0)
                    <td class="text-center">{{ $t->catorcem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->quincem > 0)
                    <td class="text-center">{{ $t->quincem }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->dieciseism > 0)
                    <td class="text-center">{{ $t->dieciseism }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    <th class="text-center">{{ $t->totalm }}</th>

                </tr>
                @endforeach

                @foreach ($total_alumnos_por_edad as $t)
                <tr>

                    <th class="text-center">Totales</th>
                    <th class="text-center">{{ $t->cuatrom + $t->cincom }}</th>
                    <th class="text-center">{{ $t->seism }}</th>
                    <th class="text-center">{{ $t->sietem }}</th>
                    <th class="text-center">{{ $t->ochom }}</th>
                    <th class="text-center">{{ $t->nuevem }}</th>
                    <th class="text-center">{{ $t->diezm }}</th>
                    <th class="text-center">{{ $t->oncem }}</th>
                    <th class="text-center">{{ $t->docem }}</th>
                    <th class="text-center">{{ $t->trecem }}</th>
                    <th class="text-center">{{ $t->catorcem }}</th>
                    <th class="text-center">{{ $t->quincem }}</th>
                    <th class="text-center">{{ $t->dieciseism }}</th>
                    <th class="text-center">{{ $t->totalm }}</th>

                </tr>
                @endforeach
            </thead>
        </table>
    </div>

    <div class="table-rightt" style="float:right;">
        <table style="width: 100%;border-collapse:collapse;margin-top:20px;line-height:15px;" border="1">
            <thead>

                <tr>
                    <th class="text-center text-9" colspan="14">ALUMNOS POR GRADO EDAD Y SEXO</th>
                </tr>
                <tr>
                    <th class="text-center text-9" colspan="14">FEMENINO</th>
                </tr>

                <tr>

                    <th class="text-center text-9">GRADO</th>
                    <th class="text-center">5</th>
                    <th class="text-center">6</th>
                    <th class="text-center">7</th>
                    <th class="text-center">8</th>
                    <th class="text-center">9</th>
                    <th class="text-center">10</th>
                    <th class="text-center">11</th>
                    <th class="text-center">12</th>
                    <th class="text-center">13</th>
                    <th class="text-center">14</th>
                    <th class="text-center">15</th>
                    <th class="text-center">16</th>
                    <th class="text-center">Total</th>

                </tr>
                @foreach ($total_alumnos_por_edad_y_grado as $t)
                <tr>
                    <th class="text-center">{{ $t->grado }}</th>
                    @if ($t->cuatrof + $t->cincof > 0)
                    <td class="text-center">{{ $t->cuatrof + $t->cincof }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->seisf > 0)
                    <td class="text-center">{{ $t->seisf }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->sietef > 0)
                    <td class="text-center">{{ $t->sietef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->ochof > 0)
                    <td class="text-center">{{ $t->ochof }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->nuevef > 0)
                    <td class="text-center">{{ $t->nuevef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->diezf > 0)
                    <td class="text-center">{{ $t->diezf }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->oncef > 0)
                    <td class="text-center">{{ $t->oncef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->docef > 0)
                    <td class="text-center">{{ $t->docef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->trecef > 0)
                    <td class="text-center">{{ $t->trecef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->catorcef > 0)
                    <td class="text-center">{{ $t->catorcef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->quincef > 0)
                    <td class="text-center">{{ $t->quincef }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    @if ($t->dieciseisf > 0)
                    <td class="text-center">{{ $t->dieciseisf }}</td>
                    @else
                    <td class="text-center"> 0 </td>
                    @endif
                    <th class="text-center">{{ $t->totalf }}</th>

                </tr>
                @endforeach

                @foreach ($total_alumnos_por_edad as $t)
                <tr>

                    <th class="text-center">Totales</th>
                    <th class="text-center">{{ $t->cuatrof + $t->cincof }}</th>
                    <th class="text-center">{{ $t->seisf }}</th>
                    <th class="text-center">{{ $t->sietef }}</th>
                    <th class="text-center">{{ $t->ochof }}</th>
                    <th class="text-center">{{ $t->nuevef }}</th>
                    <th class="text-center">{{ $t->diezf }}</th>
                    <th class="text-center">{{ $t->oncef }}</th>
                    <th class="text-center">{{ $t->docef }}</th>
                    <th class="text-center">{{ $t->trecef }}</th>
                    <th class="text-center">{{ $t->catorcef }}</th>
                    <th class="text-center">{{ $t->quincef }}</th>
                    <th class="text-center">{{ $t->dieciseisf }}</th>
                    <th class="text-center">{{ $t->totalf }}</th>

                </tr>
                @endforeach
            </thead>
        </table>
    </div>

    <div class="" style="margin-top:220px;">
        <table style="width: 100%;border-collapse: collapse;border:1px solid black;line-height:18px;" border="1">
            <tr>
                <th class="text-center" colspan="5">ALUMNOS QUE EGRESARON DEL PLANTEL</th>
            </tr>
            <tr>
                <th class="text-left text-10">&nbsp;APELLIDOS Y NOMBRES</th>
             
                <th class="text-center text-10">EDAD</th>
                <th class="text-center text-10">SEXO</th>
                <th class="text-center text-10">GRADO</th>
                <th class="text-center text-10">FECHA</th>

            </tr>

            @foreach ($egresos as $e)
            <tr>
                <td class="text-left">&nbsp;{{ $e->apellido }} {{ $e->name }}</td>
             
                <td class="text-center">{{ $e->age }}</td>
                <td class="text-center">{{ $e->sexo }}</td>
                <td class="text-center">{{ $e->grado }}</td>
                <td class="text-center">
                    {{ \Carbon\Carbon::parse($e->created_at)->format('d-m-Y') }}
                </td>

            </tr>
            @endforeach

        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height:18px;margin-top:20px;"
            border="1">
            <tr>
                <th class="text-center" colspan="7">ALUMNOS QUE INGRESARON AL PLANTEL</th>
            </tr>
            <tr>
                <th class="text-left text-10">&nbsp;APELLIDOS Y NOMBRES</th>
               
                <th class="text-center text-10">EDAD</th>
                <th class="text-center text-10">SEXO</th>
                <th class="text-center text-10">GRADO</th>
                <th class="text-center text-10">REG</th>
                <th class="text-center text-10">REP</th>
                <th class="text-center text-10">FECHA</th>

            </tr>
            @foreach ($ingresos as $i)
            <tr>
                <td class="text-left">&nbsp;{{ $i->apellido }} {{ $i->name }}</td>
              
                <td class="text-center">{{ $i->age }}</td>
                <td class="text-center">{{ $i->sexo }}</td>
                <td class="text-center">{{ $i->grado }}</td>
                @if ($i->condicion == 'Regular')
                <td class="text-center">X</td>
                <td class="text-center"></td>
                @endif
                @if ($i->condicion == 'Repitiente')
                <td class="text-center"></td>
                <td class="text-center">X</td>
                @endif

                <td class="text-center">
                    {{ \Carbon\Carbon::parse($i->created_at)->format('d-m-Y') }}

                </td>

            </tr>
            @endforeach

        </table>
    </div>
</body>

</html>