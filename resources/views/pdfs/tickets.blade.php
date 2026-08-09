<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Tickets optimizados - tamaño reducido</title>
    <style>
        /* RESET Y CONFIGURACIÓN GLOBAL */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            margin: 0.6cm;
            size: portrait;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }

        .tabla-tickets {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .ticket-td {
            width: 50%;
            padding: 4px;
            vertical-align: top;
        }

        .ticket-border {
            border: 1px solid #222;
            padding: 8px 10px 10px 10px;
            background-color: #ffffff;
            position: relative;
            min-height: 115px;
            height: auto;
            box-sizing: border-box;
            border-radius: 2px;
            word-break: break-word;
        }

        .negrita {
            font-weight: 700;
            font-size: 13px;
            display: block;
            margin-bottom: 5px;
            padding-right: 86px;
            line-height: 1.2;
            color: #1e2a3e;
        }

        /* Total de estudiantes - pequeño pero visible */
        .total-estudiantes {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #2c5f2d;
            width: 68%;
            max-width: calc(100% - 82px);
        }

        /* Línea de cada niño: texto muy pequeño y compacto */
        .info-nino-linea {
            font-size: 12px;
            margin-bottom: 2px;
            line-height: 1.25;
            display: block;
            width: 68%;
            max-width: calc(100% - 82px);
            white-space: normal;
            word-break: break-word;
            font-family: monospace;
            letter-spacing: 0.2px;
        }

        /* Para empleados */
        .empleado-linea {
            font-size: 9.5px;
            margin-bottom: 3px;
            line-height: 1.3;
            display: block;
            width: 68%;
            max-width: calc(100% - 82px);
            white-space: normal;
        }

        .footer-alterno {
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px dashed #aaa;
            font-size: 10px;
            line-height: 1.25;
            width: 68%;
            max-width: calc(100% - 82px);
            color: #2c3e2f;
        }

        .sello {
            width: 72px;
            height: 72px;
            border: 1px solid #888;
            border-radius: 50%;
            position: absolute;
            right: 8px;
            top: 8px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fef9e6;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
        }

        .sello-texto {
            font-size: 7.5px;
            color: #5a4a2e;
            line-height: 1.2;
            text-align: center;
            padding: 4px;
            font-weight: 500;
        }

        .page-break {
            page-break-after: always;
            break-after: page;
        }
    </style>
</head>

<body>

    <table class="tabla-tickets">
        @foreach($coleccion->chunk(2) as $fila)
        <tr>
            @foreach($fila as $ticket)
            <td class="ticket-td">
                <div class="ticket-border">
                    {{-- HEADER (nombre del ticket: Estudiante / Empleado) --}}
                    <span class="negrita">{{ $ticket->header ?? ($ticket->tipo === 'estudiante' ? 'FICHA ESTUDIANTE' : 'DATOS EMPLEADO') }}</span>

                    {{-- =========================== --}}
                    {{-- LÓGICA PARA ESTUDIANTES (niños) --}}
                    {{-- =========================== --}}
                    @if(isset($ticket->niños) && count($ticket->niños) > 0)
                    {{-- TOTAL DE ESTUDIANTES --}}
                    <div class="total-estudiantes">
                        Total estudiantes: {{ count($ticket->niños) }}
                    </div>

                    {{-- Cada niño se muestra en una sola línea con formato nombre | sexo | fecha | edad --}}
                    @foreach($ticket->niños as $niño)
                    <div class="info-nino-linea">
                        {{ $niño->sexo ?? 'N/A' }} | ({{ $niño->fecha ?? '--' }}) | {{ $niño->edad ?? '?' }} Años | <span style="font-size: 10px; font-weight: bold;">{{ $niño->grado_seccion }}</span>
                    </div>
                    @endforeach
                    @elseif(isset($ticket->tipo) && $ticket->tipo == 'empleado')
                    {{-- =========================== --}}
                    {{-- LÓGICA PARA EMPLEADOS: toda la información en líneas pequeñas y lineales --}}
                    {{-- =========================== --}}
                    <div class="empleado-linea">
                        C.I: {{ $ticket->cedula ?? 'N/A' }}
                    </div>
                    <div class="empleado-linea">
                        F. Nac: {{ $ticket->fecha_nac ?? '—' }} ({{ $ticket->edad ?? '?' }} Años)
                    </div>
                    @if(!empty($ticket->cargo))
                    <div class="empleado-linea">
                        Cargo: {{ $ticket->cargo }}
                    </div>
                    @endif
                    @else
                    {{-- Caso genérico --}}
                    @if(isset($ticket->cedula))
                    <div class="empleado-linea">C.I: {{ $ticket->cedula }}</div>
                    <div class="empleado-linea">F. Nac: {{ $ticket->fecha_nac ?? '—' }} ({{ $ticket->edad ?? '?' }})</div>
                    @elseif(isset($ticket->fecha))
                    <div class="info-nino-linea">Fecha: {{ $ticket->fecha }} | Edad: {{ $ticket->edad ?? '—' }} Años</div>
                    @endif
                    @endif

                    {{-- =========================== --}}
                    {{-- FOOTER ALTERNO exclusivo para estudiantes (alterno + CI) --}}
                    {{-- =========================== --}}
                    @if(isset($ticket->tipo) && $ticket->tipo == 'estudiante')
                    <div class="footer-alterno">
                        Alterno: {{ $ticket->alterno ?? 'No registrado' }}
                        CI: {{ $ticket->alterno_ci ?? '---' }}
                    </div>
                    @endif

                    {{-- Sello institucional (posición absoluta) --}}
                    <div class="sello">
                        <div class="sello-texto">Sello y<br>firma</div>
                    </div>
                </div>
            </td>
            @endforeach

            {{-- si la fila tiene solo un ticket, agregamos celda vacía para mantener estructura de tabla --}}
            @if($fila->count() == 1)
            <td class="ticket-td">
                <div style="visibility: hidden; border: none; min-height: 0; height: 0;"></div>
            </td>
            @endif
        </tr>

        {{-- Control de página: Cada 7 filas (14 tickets) se fuerza salto de página --}}
        @if(($loop->iteration % 7 == 0) && !$loop->last)
    </table>

    <div class="page-break"></div>
    <table class="tabla-tickets">
        @endif
        @endforeach
    </table>

</body>

</html>