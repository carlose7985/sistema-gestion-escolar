<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{$titulo}}</title>
    <style>
        @page {
            margin: 1.0cm 3.0cm 1.5cm 3.0cm;
        }

        #footer {
            position: fixed;
            left: 0cm;
            bottom: -0.4cm;
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
        }

        th,
        td {
            font-size: 10pt;
        }

        .container {
            margin-top: 0.6cm;
        }

        .linea {
            line-height: 0.4cm;
        }
    </style>
</head>

<body>
    @if ($institucion && count($institucion) > 0)
    <div id="header">
        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>{{$titulo}}</b></td>
            </tr>
            <tr>
                <td class="text-center text-11" width="100%">
                    @foreach ($institucion as $i)
                    <b>{{ $i->nombre_de_la_institucion }}</b>
                    @endforeach
                </td>
            </tr>
        </table>
    </div>
    @else
    <center>
        <b>los datos de la INSTITUCION no están disponibles debe registrarlos en el modulo DATOS BASICOS.</b>
    </center>
    @endif

    <div class="container">
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.4cm;margin-left: 0.1cm;" border="1">
            <thead>
                <tr style="background-color: blue; color: white;">
                    <th class="text-center text-12" colspan="5" width="100%"><b>CAMBIOS POR GRADO Y GENERO</b></th>
                </tr>
            </thead>
            <tr>
                <td class="text-center text-12"><b>ESTUDIANTE</b></td>
                <td class="text-center text-12"><b>GRADO Y SECCIÓN ANTERIOR</b></td>
                <td class="text-center text-12"><b>GRADO Y SECCIÓN ACTUAL</b></td>
                <td class="text-center text-12"><b>GENERO</b></td>
                <td class="text-center text-12"><b>FECHA DEL CAMBIO</b></td>
            </tr>
            @forelse ($cambios as $r)
            <tr>
                <td class="text-center">{{ $r->apellido }} {{ $r->name }}</td>
                <td class="text-center">
                    @if($r->grado_anterior)
                    {{ $r->grado_anterior }} {{ $r->seccion_anterior }}
                    @else
                    <span style="color: red;">S/D</span>
                    @endif
                </td>
                <td class="text-center">
                    @if($r->grado_nuevo)
                    {{ $r->grado_nuevo }} {{ $r->seccion_nuevo }}
                    @else
                    <span style="color: red;">S/D</span>
                    @endif
                </td>
                <td class="text-center">{{ $r->sexo ?? 'N/A' }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($r->fecha_registro)->format('d-m-Y') }}</td>
            </tr>
            @empty
            <tr>
                <td class="text-center" colspan="5">No hay registros de cambios de grado para el período seleccionado</td>
            </tr>
            @endforelse
        </table>
    </div>
</body>

</html>