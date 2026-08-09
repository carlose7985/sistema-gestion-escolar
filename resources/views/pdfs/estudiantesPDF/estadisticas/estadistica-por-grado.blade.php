<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        @if(isset($gradosData) && count($gradosData) > 0)
        Estadistica {{ $gradosData[0]['grado']->nombre_del_grado }} {{ $gradosData[0]['grado']->seccion }}
        @if(count($gradosData) > 1)
        y otros ({{ count($gradosData) }} grados)
        @endif
        @else
        Estadistica
        @endif
    </title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        .page-break {
            page-break-after: always;
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
            line-height: 0.5cm;

        }

        table.table-header-a {
            width: 100%;
            border-collapse: collapse;
            border: none;
            line-height: 0.6cm;
        }

        th,
        td,
        b {
            font-size: 10pt;
            color: gray;
        }

        table.table-footer {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            line-height: 0.8cm;
        }

        th.sin-borde {
            border-top: hidden;
            border-right: 1px;
            border-bottom: hidden;
            border-left: 1px;

        }

        th.sin-borde2 {
            border-top: 1px;
            border-right: hidden;
            border-bottom: hidden;
            border-left: hidden;

        }

        th.hidden {
            border-style: hidden;
        }

        th.borde-abajo {
            border-top: hidden;
            border-right: hidden;
            border-bottom: 1px;
            border-left: hidden;
        }

        th.borde-r {

            border-right: hidden;
        }

        .table-center {
            position: apsolute;
            width: 70%;
            float: right;
            margin-top: -500px;
        }

        .table-left {
            width: 28%;
        }

        .table-right {
            width: 70%;

        }
    </style>
</head>

<body>

    @if(isset($gradosData) && count($gradosData) > 0)
    @foreach ($gradosData as $index => $data)
    @if ($index > 0)
    <div class="page-break"></div>
    @endif

    @php
    $grado = $data['grado'];
    $asistenciasss = $data['asistenciasss'];
    $asistenciatotal = $data['asistenciatotal'];
    $asistenciatotalv = $data['asistenciatotalv'];
    $asistenciatotalh = $data['asistenciatotalh'];
    $total_por_edad = $data['total_por_edad'];
    $matriculaactiva = $data['matriculaactiva'];
    $ingresados = $data['ingresados'];
    $egresados = $data['egresados'];
    $ingresos = $data['ingresos'];
    $egresos = $data['egresos'];
    $director = $data['director'] ?? null;
    $institucion = $data['institucion'] ?? $institucion;
    @endphp

    <div id="header">
        <table class="table-header" border="0">
            <tr>
                <td class="text-center text-12" width="100%">República Bolivariana de Venezuela.</td>
            </tr>
            <tr>
                <td class="text-center text-12" width="100%">Ministerio del poder Popular Para la Educación.</td>
            </tr>

            <tr>
                <td class="text-center text-12" width="100%">{{ $institucion->nombre_de_la_institucion }}</td>
            </tr>


        </table>


        <table class="table-header-a" border="0">
            @foreach ($estadisticas as $e)
            <tr>
                <td class="text-left text-10">Fecha:&nbsp; <b><u>{{ ucfirst(Carbon\Carbon::parse($e->fecha)->translatedFormat('F')) }} {{ Carbon\Carbon::parse($e->fecha)->translatedFormat('Y') }}</u></b></td>
                <td class="text-left text-10">Docente(s):&nbsp; <b><u>{{ $grado->docente }}</u></b></td>


            </tr>
            @endforeach
        </table>

        <table class="table-header-a" border="0">

            @foreach ($estadisticas as $e)
            <tr>
                <td class="text-left text-10">Grado:&nbsp; <b><u>{{ $grado->nombre_del_grado }} {{ $grado->seccion }}</u></b></td>
                <td class="text-left text-12">Dias Habiles:&nbsp;
                    <b><u>{{ $e->dias_habiles }}</u></b>
                </td>
                <td class="text-left text-12">Dias Laborados:&nbsp;
                    <b><u>{{ $e->dias_laborados }}</u></b>
                </td>



            </tr>
            @endforeach
        </table>



    </div>

    <div class="table-left" style="float:left;">
        <table class="table-header-a" style="width: 100%; border-collapse: collapse;" border="0">
            <tr>
                <th class="text-center text-9">RESUMEN ESTADISTICO</th>
            </tr>
        </table>
        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height: 18px;" border="1">
            <tr>
                <th class="text-center" width="5%">Fecha</th>
                <th class="text-center" width="5%">Dias</th>
                <th class="text-center" width="5%">V</th>
                <th class="text-center" width="5%">H</th>
                <th class="text-center" width="5%">T</th>
            </tr>
            @foreach ($asistenciasss as $a)
            <tr>
                <th class="text-center">{{ Carbon\Carbon::parse($a->fecha)->format('d') }}</th>
                <td class="text-center">{{ ucfirst(Carbon\Carbon::parse($a->fecha)->locale('es')->isoFormat('ddd')) }}</td>
                <td class="text-center">{{ $a->varones }}</td>
                <td class="text-center">{{ $a->hembras }}</td>
                <td class="text-center">{{ $a->total }}</td>

            </tr>

            @if ( \Carbon\Carbon::parse($a->fecha)->locale('es')->isoFormat('dddd') == 'viernes'
            && \Carbon\Carbon::parse($a->fecha)->format('d') < 28 )
                <tr>

                <th class="text-center text-9">
                    {{ Carbon\Carbon::parse($a->fecha)->format('d')+1 }}/{{ Carbon\Carbon::parse($a->fecha)->format('d') +2 }}
                </th>
                <td class="text-center">--</td>
                <td class="text-center">--</td>
                <td class="text-center">--</td>
                <td class="text-center">--</td>
                </tr>
                @endif

                @endforeach

                <tr>
                    <th class="text-center text-9" colspan="2">Total</th>

                    <th class="text-center">{{ $asistenciatotalv }}</th>
                    <th class="text-center">{{ $asistenciatotalh }}</th>
                    <th class="text-center">{{ $asistenciatotal }}</th>


                </tr>

                @foreach ($estadisticas as $e)
                <tr>
                    <th class="text-center text-9" colspan="2">Promedio</th>

                    <th class="text-center">{{ number_format($asistenciatotalv / $e->dias_laborados, 0) }}%</th>
                    <th class="text-center">{{ number_format($asistenciatotalh / $e->dias_laborados, 0) }}%</th>
                    <th class="text-center">{{ number_format($asistenciatotal / $e->dias_laborados, 0) }}%</th>


                </tr>
                @endforeach

        </table>


    </div>


    <div class="table-right" style="float:right;">
        <table class="table-header-a" style="width: 100%; border-collapse: collapse;" border="0">

            <tr>

                <th class="text-center text-9">CLASIFICACION POR EDAD Y SEXO</th>
            </tr>

        </table>

        <table style="width: 100%;border-collapse: collapse;border: 1px solid black;line-height: 18px;" border="1">
            <tr>
                <th class="text-center" width="5%">Edad</th>
                <th class="text-center" width="5%">5</th>
                <th class="text-center" width="5%">6</th>
                <th class="text-center" width="5%">7</th>
                <th class="text-center" width="5%">8</th>
                <th class="text-center" width="5%">9</th>
                <th class="text-center" width="5%">10</th>
                <th class="text-center" width="5%">11</th>
                <th class="text-center" width="5%">12</th>
                <th class="text-center" width="5%">13</th>
                <th class="text-center" width="5%">14</th>
                <th class="text-center" width="5%">15</th>
                <th class="text-center" width="5%">16</th>
                <th class="text-center" width="8%">T0TAL</th>

            </tr>
            @foreach ($total_por_edad as $t)
            <tr>
                <th class="text-center">V</th>
                <td class="text-center">{{ $t->cincom + $t->cuatrom }}</td>
                <td class="text-center">{{ $t->seism }}</td>
                <td class="text-center">{{ $t->sietem }}</td>
                <td class="text-center">{{ $t->ochom }}</td>
                <td class="text-center">{{ $t->nuevem }}</td>
                <td class="text-center">{{ $t->diezm }}</td>
                <td class="text-center">{{ $t->oncem }}</td>
                <td class="text-center">{{ $t->docem }}</td>
                <td class="text-center">{{ $t->trecem }}</td>
                <td class="text-center">{{ $t->catorcem }}</td>
                <td class="text-center">{{ $t->quincem }}</td>
                <td class="text-center">{{ $t->dieciseism }}</td>
                <td class="text-center">{{ $t->totalm }}</td>
            </tr>
            <tr>
                <th class="text-center">H</th>
                <td class="text-center">{{ $t->cincof + $t->cuatrof }}</td>
                <td class="text-center">{{ $t->seisf }}</td>
                <td class="text-center">{{ $t->sietef }}</td>

                <td class="text-center">{{ $t->ochof }}</td>
                <td class="text-center">{{ $t->nuevef }}</td>
                <td class="text-center">{{ $t->diezf }}</td>
                <td class="text-center">{{ $t->oncef }}</td>
                <td class="text-center">{{ $t->docef }}</td>

                <td class="text-center">{{ $t->trecef }}</td>
                <td class="text-center">{{ $t->catorcef }}</td>
                <td class="text-center">{{ $t->quincef }}</td>
                <td class="text-center">{{ $t->dieciseisf }}</td>
                <td class="text-center">{{ $t->totalf }}</td>

            </tr>
            <tr>
                <th class="text-center">T</th>
                <td class="text-center">{{ $t->cincom + $t->cincof + $t->cuatrom + $t->cuatrof }}</td>
                <td class="text-center">{{ $t->seism + $t->seisf }}</td>
                <td class="text-center">{{ $t->sietem + $t->sietef }}</td>
                <td class="text-center">{{ $t->ochom + $t->ochof }}</td>
                <td class="text-center">{{ $t->nuevem + $t->nuevef }}</td>
                <td class="text-center">{{ $t->diezm + $t->diezf }}</td>
                <td class="text-center">{{ $t->oncem + $t->oncef }}</td>
                <td class="text-center">{{ $t->docem + $t->docef }}</td>
                <td class="text-center">{{ $t->trecem + $t->trecef }}</td>
                <td class="text-center">{{ $t->catorcem + $t->catorcef }}</td>
                <td class="text-center">{{ $t->quincem + $t->quincef }}</td>
                <td class="text-center">{{ $t->dieciseism + $t->dieciseisf }}</td>
                <td class="text-center">{{ $t->total }}</td>
            </tr>
            @endforeach
        </table>

        <table style="width: 100%;border-collapse:collapse;margin-top:40px" border="1">
            <thead>
                <tr>
                    <th class="text-center" colspan="6">Ingresos y Egresos</th>
                </tr>
                <tr>
                    <th class="text-center borde-r" width="10%"></th>
                    <th class="text-center" width="40%">Apellidos y Nombres</th>
                    <th class="text-center" width="10%">Edad</th>
                    <th class="text-center" width="10%">Sexo</th>
                    <th class="text-center" width="15%">Fecha</th>
                    <th class="text-center" width="15%">Motivo</th>
                </tr>
            </thead>

            @foreach ($ingresados as $i)

            <tr>
                <td class="text-center text-9">Ingreso</td>
                <td class="text-left text-8">{{ $i->apellido }} {{ $i->name }}</td>
                <td class="text-center text-8">{{ $i->age }}</td>
                <td class="text-center text-8">{{ $i->sexo }}</td>
                <td class="text-center text-8">{{ \Carbon\Carbon::parse($i->created_at)->format('d-m-Y') }}</td>
                <td class="text-center text-8">
                    {{ $i->tipo_de_movimiento == 'Cambio' ? 'Cambio de Grado' : $i->status }}
                </td>
            </tr>
            @endforeach

            @foreach ($egresados as $e)
            <tr>
                <td class="text-center text-9">Egreso</td>
                <td class="text-left text-8">{{ $e->apellido }} {{ $e->name }}</td>
                <td class="text-center text-8">{{ $e->age }}</td>
                <td class="text-center text-8">{{ $e->sexo }}</td>
                <td class="text-center text-8">{{ \Carbon\Carbon::parse($e->created_at)->format('d-m-Y') }}</td>
                <td class="text-center text-8">
                    {{ $e->tipo_de_movimiento == 'Cambio' ? 'Cambio de Grado' : $e->status }}
                </td>
            </tr>
            @endforeach
        </table>

        <table style="width: 100%;border-collapse:collapse;margin-top:40px" border="1">
            <thead>
                <tr>
                    <th class="text-center" colspan="5">Referencia matricula actualizada</th>
                </tr>
                <tr>
                    <th class="text-center" width="10%"></th>
                    <th class="text-center" width="25%">Matricula anterior</th>
                    <th class="text-center" width="20%">Egresos</th>
                    <th class="text-center" width="20%">Ingresos</th>
                    <th class="text-center" width="25%">Matricula activa</th>
                </tr>
            </thead>

            @foreach ($matriculaactiva as $m)
            @foreach ($egresos as $e)
            @foreach ($ingresos as $i)
            <tr>
                <th class="text-center" width="10%">V</th>
                <td class="text-center text-10">{{ ($m->totalmam ?? 0) + ($e->totalem ?? 0) - ($i->totalim ?? 0) }}</td>
                <td class="text-center text-10">{{ $e->totalem ?? 0 }}</td>
                <td class="text-center text-10">{{ $i->totalim ?? 0 }}</td>
                <td class="text-center text-10">{{ $m->totalmam ?? 0 }}</td>
            </tr>
            <tr>
                <th class="text-center" width="10%">H</th>
                <td class="text-center text-10">{{ ($m->totalmaf ?? 0) + ($e->totalef ?? 0) - ($i->totalif ?? 0) }}</td>
                <td class="text-center text-10">{{ $e->totalef ?? 0 }}</td>
                <td class="text-center text-10">{{ $i->totalif ?? 0 }}</td>
                <td class="text-center text-10">{{ $m->totalmaf ?? 0 }}</td>
            </tr>
            <tr>
                <th class="text-center" width="10%">T</th>
                <td class="text-center text-10">{{ ($m->totalma ?? 0) + ($e->totale ?? 0) - ($i->totali ?? 0) }}</td>
                <td class="text-center text-10">{{ $e->totale ?? 0 }}</td>
                <td class="text-center text-10">{{ $i->totali ?? 0 }}</td>
                <td class="text-center text-10">{{ $m->totalma ?? 0 }}</td>
            </tr>
            @endforeach
            @endforeach
            @endforeach
        </table>

    </div>

    <div style="position: fixed; bottom: 40px; width: 100%; text-align: center; z-index: 1000;">
        @if ($director)
        <div style="display: inline-block;">
            <b><u>{{ $director->nombre_y_apellido }}</b></u>
            <br>Director(a)
        </div>
        @else
        <div style="display: inline-block;">
            __________________________________________________
            <br>Director(a)
        </div>
        @endif
    </div>

    @endforeach
    @else
    <div style="text-align: center; padding: 50px;">
        <h2>No hay datos disponibles para generar el reporte</h2>
    </div>
    @endif

</body>

</html>