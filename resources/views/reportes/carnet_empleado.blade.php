<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background-color: white;
        }

        .card {
            width: 65mm;
            height: 100mm;
            position: relative;
            overflow: hidden;
            border: 0.5pt solid #2563eb;
            box-sizing: border-box;
        }

        /* Header con logos */
        .header {
            background-color: #2563eb;
            height: 20mm;
            /* Aumentado un poco para el escudo */
            color: white;
            padding: 4mm 2mm 0 2mm;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: middle;
            text-align: center;
        }

        .logo-img-small {
            width: 9mm;
            height: 9mm;
            border-radius: 2px;
        }

        .header h1 {
            font-size: 7.5pt;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
        }

        .header p {
            font-size: 5pt;
            margin: 1px 0;
            opacity: 0.9;
        }

        /* ESCUDO CENTRAL GRANDE */
        .shield-center {
            position: absolute;
            top: 13mm;
            /* Posicionado sobre la línea de cambio de color */
            left: 50%;
            margin-left: -10mm;
            /* Mitad del ancho para centrar */
            width: 20mm;
            height: 20mm;
            background-color: white;
            border-radius: 50%;
            border: 2pt solid #2563eb;
            z-index: 50;
            text-align: center;
            overflow: hidden;
        }

        .shield-img-large {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        /* Area de información - Bajada para dar espacio al escudo */
        .info-area {
            margin-top: 15mm;
            padding: 0 6mm;
        }

        .info-row {
            margin-bottom: 4px;
            font-size: 9pt;
            text-align: left;
            border-bottom: 0.2pt solid #f1f5f9;
            padding-bottom: 2px;
        }

        .info-label {
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            font-size: 7pt;
        }

        .info-value {
            color: #1e293b;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 2px;
            font-size: 9pt;
        }

        /* Area QR */
        .qr-area {
            position: absolute;
            bottom: 6mm;
            left: 0;
            right: 0;
            text-align: center;
        }

        .qr-area img {
            width: 26mm;
            height: 26mm;
            border: 0.5pt solid #e2e8f0;
            padding: 2px;
            background-color: white;
        }

        .qr-area p {
            font-size: 5pt;
            color: #94a3b8;
            margin-top: 3px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .footer-bar {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 2mm;
            background-color: #2563eb;
        }
    </style>
</head>

<body>
    <div class="card">
        <!-- CABECERA AZUL -->
        <div class="header">
            <table class="header-table">
                <tr>
                   
                    <td width="100%">
                        <h1>{{ $institucion->nombre_de_la_institucion ?? 'IDENTIFICACIÓN' }}</h1>
                        <p>CONTROL DE ASISTENCIA PERSONAL</p>
                    </td>
                    
                </tr>
            </table>
        </div>

        <!-- ESCUDO CENTRAL GRANDE -->
        <div class="shield-center">
            <img src="{{ $logoInstitucion }}" class="shield-img-large">
        </div>

        <!-- DATOS DEL EMPLEADO -->
        <div class="info-area">
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">{{ $empleado->nombres }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Apellido:</span>
                <span class="info-value">{{ $empleado->apellidos }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cédula:</span>
                <span class="info-value" style="color: #2563eb;">{{ number_format($empleado->cedula, 0, ',', '.') }}</span>
            </div>
            <div class="info-row" style="border: none;">
                <span class="info-label">Cargo:</span>
                <span class="info-value" style="font-size: 8pt; color: #475569;">{{ $empleado->tipo_de_personal }}</span>
            </div>
        </div>

        <!-- QR DE ASISTENCIA -->
        <div class="qr-area">
            <img src="data:image/svg+xml;base64,{{ $qr }}">
            <p>Escaneo Biométrico Electrónico</p>
        </div>

        <div class="footer-bar"></div>
    </div>
</body>

</html>