<!DOCTYPE html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 0.5cm 2.0cm 0.5cm 2.0cm;
        }

        body {
            /* Fuente con serifa para que se parezca a la de la imagen (tipo Word) */
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
        }

        .fecha {
            text-align: left;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 15px;
        }

        .destinatario {
            margin-bottom: 20px;
        }

        .linea-completa {
            border-bottom: 1px solid black;
            width: 80%;
            margin-bottom: 5px;
            height: 12px;
        }

        .asunto {
            text-align: center;
            font-weight: bold;
            margin: 30px 0;
        }

        .contenido {
            text-align: justify;
        }

        .contenido p {
            margin-bottom: 15px;
        }

        .atentamente {
            text-align: center;
            margin-top: 40px;
            margin-bottom: 60px;
        }

        .firma-seccion {
            text-align: center;
        }

        .linea-firma {
            border-top: 1px solid #888;
            width: 100%;
            margin-bottom: 10px;
        }

        .bold {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td style="text-align: left; border: none;">
                <img src="{{ $logoDocumento }}" style="height: 50px; width: 600px;" alt="Logo Doc">
            </td>
        </tr>
    </table>

    <div class="fecha">
        Tucupita,
        @php
        $meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        $mes_actual = $meses[date('n')-1];
        @endphp
        {{ $mes_actual }} del {{ date('Y') }}
    </div>

    <div class="destinatario">
        <span class="bold">Ciudadano:</span>
        <div class="linea-completa"></div>
        <span class="bold">Director del CDCEE Delta Amacuro Presente.</span>
        <br><br>
        <span class="bold">Atención:</span>
        <div class="linea-completa"></div>
        <span class="bold">Coordinadora de Gestión Humana</span>
    </div>

    <div class="asunto">
        Asunto: Remisión de Permiso Vacacional.
    </div>

    <div class="contenido">
        <p>Reciba un saludo institucional, bolivariano y revolucionario.</p>

        <p>La presente tiene como finalidad hacer de su conocimiento y tramitar formalmente el permiso correspondiente al disfrute de vacaciones del ciudadano
             <span class="bold">{{ $empleado->nombres }} {{ $empleado->apellidos }}</span>,
              CI: <span class="bold">{{ $empleado->documento }}{{ $empleado->cedula }}</span>
               quien se desempeña como <span class="bold">{{ $empleado->funcion_en_el_plantel }}</span>
                en la siguiente institución, <span class="bold">{{$institucion->nombre_de_la_institucion}}</span>.</p>

        <p>Dicho período de descanso legal ha sido autorizado por esta dirección, desde el:_____/______/______</p>

        <p>Es importante destacar que esta solicitud se realiza en cumplimiento de los derechos laborales del trabajador y en concordancia con la planificación administrativa de este plantel, garantizando que las funciones de resguardo y vigilancia queden debidamente cubiertas durante su ausencia.</p>

        <p>Sin más a que hacer referencia, agradeciendo de antemano su atención y la gestión correspondiente ante el departamento que usted dirige.</p>
    </div>

    <div class="atentamente">
        Atentamente,
    </div>

    <div class="firma-seccion">
        <div class="linea-firma"></div>
        @if ($director)
        <span class="bold">{{ $director->nombre_y_apellido }}</span><br>
        <span class="bold">C.I. {{ $director->cedula }}</span>
        @else

        @endif

    </div>

</body>

</html>