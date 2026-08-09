<!DOCTYPE html>
<html>

<head>
    <style>
        @page {
            /* Definimos el margen físico de la hoja */
            margin: 0.5cm;
        }

        body {
            font-family: sans-serif;
            font-size: 9px;
            margin: 0;
            /* Importante: dejar en 0 para que mande el margen de @page */
            padding: 0;
            width: 100%;
        }

        .page-wrapper {
            /* Quitamos el padding extra que tenías de 10px para ganar espacio */
            page-break-after: always;
            width: 100%;
        }

        .page-wrapper:last-child {
            page-break-after: avoid;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        .blue-header {
            /* background-color: blue; */
            color: black;
            text-align: center;
            font-weight: bold;
            padding: 10px;
            font-size: 12px;
        }

        .info-box {
            border: 1px solid #000;
            width: 60%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .info-box td {
            border: 1px solid #000;
            padding: 4px;
            font-weight: bold;
            /* color: #0070c0#0070c0; */
            text-transform: uppercase;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            font-size: 0.7rem;
            color: black;
            border: 1px solid #000;
            padding: 5px;
            text-transform: uppercase;

        }

        .data-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            font-size: 0.7rem;
            text-transform: uppercase;
            height: 24px;
        }

        .footer-signatures {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }

        .signature-box {
            border: 1px solid #000;
            height: 70px;
            width: 45%;
            text-align: center;
            vertical-align: bottom;
            padding-bottom: 5px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    @foreach($paginas as $numPagina => $grupo)
    <div class="page-wrapper">
        <table class="header-table">
            <tr>
                <td width="35%"><img src="{{ $logo }}" style="width: 330px;"></td>
                <td class="blue-header">
                    EVALUACIONES {{ $grupo->first()->periodo_actual }} PLANTELES EDUCATIVOS
                    ({{ $grupo->first()->periodo_evaluacion }})
                    ESTADO DELTA AMACURO ({{ $titulo_cargo }})
                </td>
            </tr>
        </table>

        <table class="info-box">
            <tr>
                <td>Nombre De La Institucion: {{ $institucion->nombre_de_la_institucion ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>NOMBRE DEL DIRECTOR: {{ $director->nombres ?? '' }} {{ $director->apellidos ?? '' }}</td>
            </tr>
            <tr>
                <td>CEDULA DEL DIRECTOR: {{ $director->cedula ?? '' }}</td>
            </tr>
            <tr>
                <td>NUMERO TELEFONICO DEL DIRECTOR: {{ $director->telefono ?? '' }}</td>
            </tr>
            <tr>
                <td>CORREO ELECTRONICO DEL DIRECTOR: {{ $director->correo_electronico ?? '' }}</td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th>N</th>
                    <th>Apellidos</th>
                    <th>Nombres</th>
                    <th>Cédula</th>
                    <th>Institución</th>
                    <th>Cargo</th>
                    <th>Estado</th>
                    <th>Municipio</th>
                    <th>Parroquia</th>
                    <th>Punt.</th>
                    <th>Firma</th>
                    <th>Huella</th>
                </tr>
            </thead>
            <tbody>
                @foreach($grupo as $index => $ev)
                <tr>
                    <td>{{ ($numPagina * 14) + ($loop->index + 1) }}</td>
                    <td style="text-align: left;">{{ $ev->empleado->apellidos }}</td>
                    <td style="text-align: left;">{{ $ev->empleado->nombres }}</td>
                    <td>{{ $ev->empleado->cedula }}</td>
                    <td>{{ $institucion->nombre_de_la_institucion ?? '' }}</td>
                    <td>{{ $ev->empleado->cargo_en_el_perror }}</td>
                    <td>{{ $institucion->estado ?? 'DELTA AMACURO' }}</td>
                    <td>{{ $institucion->municipio ?? '' }}</td>
                    <td>{{ $institucion->parroquia ?? '' }}</td>
                    <td style="font-weight: bold;">{{ $ev->puntuacion }}</td>
                    <td></td>
                    <td></td>

                </tr>
                @endforeach

                {{-- Relleno de filas para completar las 15 siempre --}}
                @for ($i = count($grupo); $i < 14; $i++)
                    <tr>
                    @for ($j = 0; $j < 12; $j++) <td>&nbsp;</td> @endfor
                        </tr>
                        @endfor
            </tbody>
        </table>

        <table class="footer-signatures">
            <tr>
                <td class="signature-box">FIRMA Y SELLO DEL DIRECTOR</td>
                <td width="10%"></td>
                <td class="signature-box">FIRMA Y FECHA RECEPCION SUPERVISOR</td>
            </tr>
        </table>
    </div>
    @endforeach
</body>

</html>