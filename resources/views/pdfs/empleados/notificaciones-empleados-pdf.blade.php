<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación</title>
    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        .logo {
            margin-top: 0.5cm;
        }

        .title {
            margin-top: 0cm;
            text-align: center;
        }

        .content {
            margin-top: 0.5cm;
        }

        .parrafo-1 {
            line-height: 1.9;
            white-space: initial;
            text-align: justify;
            font-size: 1.0rem;
        }

        .parrafo-2 {
            line-height: 1.9;
            white-space: initial;
            text-align: justify;
            font-size: 1.0rem;
            margin-top: 1.0cm;
        }

        .parrafo-3 {

            margin-top: 3.5cm;
            line-height: 1.0;
            white-space: initial;
            text-align: left;
            font-size: 1.0rem;
            align-items: center;
        }

        .parrafo-4 {
            margin-top: 0.3cm;
            text-align: center;
            font-size: 1.0rem;
        }

        .logo {
            margin-top: 0.5cm;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: 1.5cm;
            width: 100%;
        }

        b {
            color: #454545;
        }

        .color {
            color: #665e52;
        }

        .header-container {
            position: relative;
            width: 100%;
            text-align: center;
            padding-top: 10px;
        }

        /* Escudo de fondo */
        .escudo-bg {
            position: absolute;
            top: 30px;
            /* Ajusta según sea necesario */
            left: 50%;
            transform: translateX(-50%);
            width: 90px;
            /* Tamaño del escudo */
            opacity: 0.15;
            /* Nivel de opacidad (opaco) */
            z-index: 0;
            /* Asegura que esté detrás del texto */
        }

        /* Contenido del header */
        .header-content {
            position: relative;
            z-index: 1;
            line-height: 20px;
            /* El texto queda por encima del escudo */
        }

        .institucion-nombre {
            text-transform: uppercase;
            /* font-weight: bold; */
            /* margin-top: 10px; */
        }

        .ml-3 {
            margin-left: 10px;
        }
    </style>
</head>


<body>

    @if ($institucion && count($institucion) > 0)

    <table style="width: 100%; border: none; margin-bottom: 10px;">
        <tr>
            <td style="width: 85%; border: none; text-align: left;">
                <img src="{{ $logoDocumento }}" style="width: 500px; height: 50px;" alt="Logo Documento">
            </td>
            <td style="width: 15%; border: none; text-align: right;">
                <img src="{{ $logoInstitucion }}" style="width: 50px; height: 50px;" alt="Logo Institución">
            </td>
        </tr>
    </table>

    <div class="header-container">
        <img src="img/escudo.png" alt="Escudo" class="escudo-bg">

        <div class="header-content">
           
            <div class="title" style="margin-top: 10px">REPÚBLICA BOLIVARIANA DE VENEZUELA</div>
            <div class="title">MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN</div>
            <div class="title">TUCUPITA EDO. DELTA AMACURO</div>

            <div class="title institucion-nombre">
                @foreach ($institucion as $i)
                {{ strtoupper($i->nombre_de_la_institucion) }}
                @endforeach
            </div>

            <div class="title" style="margin-top: 15px">
                <h4><b>NOTIFICACIÓN</b></h4>
            </div>
        </div>
    </div>
    <div class="content color">

        @if ($asistencia_existe >= 1)

        <div class="parrafo-1">


            @if ($empleado->sexo == 'F')
            <span class="ml-3">Ciudadana:</span> <b><u>{{ $empleado->nombres}} {{ $empleado->apellidos }}</b></u>,
            @else
            Ciudadano: <b><u>{{ $empleado->nombres }} {{ $empleado->apellidos }}</b></u>,
            @endif
            titular de la C.I: <b><u>{{ $empleado->cedula }}</b></u>,
            por medio de la presente se le informa la relación de asistencias e inasistencias registradas en
            el mes de: <b><u>{{ ucfirst(Carbon\Carbon::parse($mes)->translatedFormat('F')) }}</u></b> del año
            <b><u>{{ $aho }}</u></b>.
            <div class="">
                Días hábiles en el mes: <b><u>{{ $totalAsistencias }}</u></b>
            </div>
            <div class="">
                Días laborados: <b><u>({{ $asistencias }})</u></b>
                @foreach ($fechasAsistencias as $fechaa)
                <u><b>{{ Carbon\Carbon::parse($fechaa['fecha'])->format('d') }} -</b></u>
                @endforeach
            </div>

            <div class="">
                Días no laborados: <b><u>({{ $faltas }})</u></b>
                @foreach ($fechasFaltas as $fechaf)
                <u><b>{{ Carbon\Carbon::parse($fechaf['fecha'])->format('d') }} -</b> </u>
                @endforeach
            </div>

            <div class="">
                Días no laborados justificados: <b><u>({{ $permisos }})</u></b>
                @foreach ($fechasPermiso as $fechap)
                <u><b>{{ Carbon\Carbon::parse($fechap['fecha'])->format('d') }} -</b></u>
                @endforeach
            </div>

        </div>

        <div class="text-center" style="margin-top: 20px">
            La presente es para fines de control de asistencias.

        </div>

        <div style="margin-top: 15px">
            Emitido por:
            ________________________________________________
        </div>

        <div style="margin-top: 10px">
            Recibido por:
            ________________________________________________
        </div>

        <div class="title" style="margin-top: 20px">
            OBSERVACIÓN
        </div>

        <div class="parrafo-3 ml-3">Notificación que se expide en

            @if ($dia == 01)
            Tucupita al primer <b><u> {{ $dia }} </b></u> día del mes de:
            <b><u>{{ ucfirst($meses) }}</b></u> del año: <b><u> {{ $aho }} </b></u>
            @endif
            @if ($dia != 01)
            Tucupita a los <b><u> {{ $dia }} </b></u> dias del mes de:
            <b><u>{{ ucfirst($meses) }}</b></u>
            del año: <b><u> {{ $aho }} </b></u>
            @endif
        </div>

        <div id="footer">
            @if ($director)
            <div class="parrafo-4"><b><u>______________________________________________________</b></u></div>
            <div class="parrafo-4"><b>Director(a)</b></div>

            <div class="parrafo-4"><b><u>{{ $director->nombre_y_apellido }}</b></u></div>
            <div class="parrafo-4"> C.I: <b><u>{{ $director->cedula }}</b></u>
                @endif

            </div>
        </div>
        @else
        <center>

            <b class="mt-10">No existen notificaciones en este mes.</b>
        </center>
        @endif
    </div>
    @else
    <center>
        <b>los datos de la INSTITUCION no están disponibles debe registrarlos en el modulo DATOS BASICOS.</b>
    </center>
    @endif
</body>

</html>