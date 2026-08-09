<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Ficha de la Institución</title>
    <style>
        /* Configuración General */
        @page {
            margin: 0cm 0cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            color: #333;
            margin-top: 3cm;
            /* Espacio para el header */
            margin-bottom: 2cm;
            /* Espacio para el footer */
            margin-left: 1.5cm;
            margin-right: 1.5cm;
            line-height: 1.4;
        }

        /* Header Fijo */
        header {
            position: fixed;
            top: 0cm;
            left: 0cm;
            right: 0cm;
            height: 2.5cm;
            background-color: #f8f9fa;
            border-bottom: 3px solid #2c3e50;
            padding: 0.5cm 1.5cm;
            vertical-align: middle;
        }

        /* Footer Fijo */
        footer {
            position: fixed;
            bottom: 0cm;
            left: 0cm;
            right: 0cm;
            height: 1.5cm;
            background-color: #2c3e50;
            color: white;
            text-align: center;
            line-height: 1.5cm;
            font-size: 9pt;
        }

        /* Tablas de Layout */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        /* Estilos de Logo y Título en Header */
        .header-table td {
            vertical-align: middle;
        }

        .logo-img {
            max-height: 70px;
            max-width: 150px;
        }

        .header-title {
            text-align: right;
            color: #2c3e50;
        }

        .header-title h1 {
            margin: 0;
            font-size: 16pt;
            text-transform: uppercase;
        }

        .header-title p {
            margin: 2px 0 0;
            font-size: 9pt;
            color: #666;
        }

        /* Secciones del Cuerpo */
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            margin-top: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Tabla de Datos */
        .data-table th {
            width: 35%;
            text-align: left;
            padding: 6px;
            font-weight: bold;
            color: #555;
            background-color: #fff;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        .data-table td {
            width: 65%;
            padding: 6px;
            color: #000;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        /* Para filas alternas si quisieras color: tr:nth-child(even) { background: #f9f9f9; } */

        /* Clases de utilidad */
        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .badge {
            background-color: #eee;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 8pt;
            border: 1px solid #ddd;
        }
    </style>
</head>

<body>

    <!-- Encabezado -->
    <header>
        <table class="header-table">
            <tr>
                <td width="30%">
                    <img src="{{ $logoInstitucion }}" class="logo-img" alt="Logo">
                </td>
                <td width="70%" class="header-title">
                    <h1>Ficha Institucional</h1>
                    <p>Reporte generado el: {{ date('d-m-Y h:i A') }}</p>
                    <p>{{ $institucion->nombre_de_la_institucion }}</p>
                </td>
            </tr>
        </table>
    </header>

    <!-- Pie de página -->
    <footer>
        Sistema de Gestión Escolar &copy; {{ date('Y') }} - {{ $institucion->nombre_de_la_institucion }}
    </footer>

    <!-- Contenido Principal -->
    <main>
        <!-- Sección 1: Datos Principales -->
        <div class="section-title">Información General</div>
        <table class="data-table">
            <tr>
                <th>Nombre Oficial</th>
                <td>{{ $institucion->nombre_de_la_institucion }}</td>
            </tr>
            <tr>
                <th>Identificación Fiscal (RIF)</th>
                <td>{{ $institucion->rif }}</td>
            </tr>
            <tr>
                <th>NIF</th>
                <td>{{ $institucion->nif ?: 'No registrado' }}</td>
            </tr>
            <tr>
                <th>Fecha de Fundación</th>
                <td>
                    @if($institucion->fecha_de_fundada)
                    {{ \Carbon\Carbon::parse($institucion->fecha_de_fundada)->format('d/m/Y') }}
                    <!-- Calculamos la edad aquí mismo con PHP -->
                    <span class="badge">
                        ({{ \Carbon\Carbon::parse($institucion->fecha_de_fundada)->age }} Años)
                    </span>
                    @else
                    <span style="color: #999;">No indicada</span>
                    @endif
                </td>
            </tr>
            <tr>
                <th>Tipo de Escuela</th>
                <td>{{ $institucion->tipo_de_escuela }} ({{ $institucion->turno }})</td>
            </tr>
            <tr>
                <th>Dependencia</th>
                <td>{{ $institucion->dependencia }}</td>
            </tr>
        </table>

        <!-- Sección 2: Ubicación y Contacto -->
        <div class="section-title">Ubicación y Contacto</div>
        <table class="data-table">
            <tr>
                <th>Dirección Física</th>
                <td>{{ $institucion->direccion }}</td>
            </tr>
            <tr>
                <th>Ubicación Geográfica</th>
                <td>
                    {{ $institucion->municipio }}, Edo. {{ $institucion->estado }}<br>
                    <small style="color: #666;">Parroquia: {{ $institucion->parroquia }} | Comuna: {{ $institucion->comuna }}</small>
                </td>
            </tr>
            <tr>
                <th>Zona Educativa</th>
                <td>{{ $institucion->zona_educativa }}</td>
            </tr>
            <tr>
                <th>Contacto</th>
                <td>
                    <b>Tel:</b> {{ $institucion->telefono }} <br>
                    <b>Email:</b> {{ $institucion->email }}
                </td>
            </tr>
        </table>

        <!-- Sección 3: Códigos Administrativos (Diseño a 2 columnas para ahorrar espacio) -->
        <div class="section-title">Códigos Administrativos</div>
        <table class="data-table">
            <tr>
                <!-- Columna Izquierda -->
                <td style="padding: 0; border: none;" width="50%">
                    <table style="margin: 0;">
                        <tr>
                            <th style="width: 50%;">Código DEA</th>
                            <td>{{ $institucion->codigo_dea }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Código Estadístico</th>
                            <td>{{ $institucion->codigo_estadistico }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Código Dependencia</th>
                            <td>{{ $institucion->codigo_de_dependencia }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Código Circuital</th>
                            <td>{{ $institucion->codigo_circuito }}</td>
                        </tr>
                    </table>
                </td>
                <!-- Espaciador -->
                <td style="width: 5%; border: none;"></td>
                <!-- Columna Derecha -->
                <td style="padding: 0; border: none;" width="45%">
                    <table style="margin: 0;">
                        <tr>
                            <th style="width: 50%;">Código CENAE</th>
                            <td>{{ $institucion->codigo_cenae }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Código Electoral</th>
                            <td>{{ $institucion->codigo_electoral }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Circuito</th>
                            <td>{{ $institucion->circuito }}</td>
                        </tr>
                        <tr>
                            <th style="width: 50%;">Medio</th>
                            <td>{{ $institucion->medio }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Sección 4: Dirección del Plantel -->
        @if ($director)
        <div class="section-title">Director(a) del Plantel</div>
        <table class="data-table">
            <tr>
                <th>Nombre del Director(a)</th>
                <td>{{ $director->nombre_y_apellido }}</td>
            </tr>
            <tr>
                <th>Cédula de Identidad</th>
                <td>{{ $director->cedula }}</td>
            </tr>
            <tr>
                <th>Teléfono de Contacto</th>
                <td>{{ $director->telefono }}</td>
            </tr>
        </table>
        @endif

    </main>
</body>

</html>