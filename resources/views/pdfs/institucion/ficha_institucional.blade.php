<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Ficha Institucional</title>
    <style>
        /* CSS optimizado para DomPDF */
        @page {
            margin: 0.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Header */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .logo {
            width: 100px;
        }

        .title-container {
            text-align: right;
        }

        .title {
            color: #1e293b;
            font-size: 22px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 5px;
        }

        /* Secciones */
        .section-title {
            background-color: #f8fafc;
            color: #1e3a8a;
            /* Azul institucional */
            font-size: 14px;
            font-weight: bold;
            padding: 8px 10px;
            border-bottom: 2px solid #1e3a8a;
            margin-top: 20px;
            text-transform: uppercase;
        }

        /* Tablas de Datos */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        .data-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }

        .label {
            font-weight: bold;
            color: #475569;
            width: 35%;
        }

        .value {
            color: #000;
            width: 65%;
        }

        /* Píldora de años */
        .badge {
            background-color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            color: #475569;
            font-weight: bold;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #334155;
            color: white;
            text-align: center;
            padding: 10px;
            font-size: 9px;
            font-style: italic;
        }
    </style>
</head>

<body>

    <!-- Encabezado -->
    <table class="header-table">
        <tr>
            <td class="logo">
                <!-- Asegúrate de tener el logo en public/img/logo.png -->
                <img src="{{ public_path('img/logo.png') }}" width="80">
            </td>
            <td class="title-container">
                <h1 class="title">Ficha Institucional</h1>
                <div class="subtitle">
                    Reporte generado el: {{ date('d-m-Y h:i A') }}<br>
                    {{ $institucion->nombre_de_la_institucion }}
                </div>
            </td>
        </tr>
    </table>

    <!-- SECCIÓN 1 -->
    <div class="section-title">Información General</div>
    <table class="data-table">
        <tr>
            <td class="label">Nombre Oficial</td>
            <td class="value">{{ $institucion->nombre_de_la_institucion }}</td>
        </tr>
        <tr>
            <td class="label">Identificación Fiscal (RIF)</td>
            <td class="value">{{ $institucion->rif }}</td>
        </tr>
        <tr>
            <td class="label">NIF</td>
            <td class="value">{{ $institucion->nif }}</td>
        </tr>
        <tr>
            <td class="label">Fecha de Fundación</td>
            <td class="value">
                {{ \Carbon\Carbon::parse($institucion->fecha_de_fundada)->format('d/m/Y') }}
                |  Antiguedad:<span class="badge">({{ $antiguedad }} Años)</span>
            </td>
        </tr>
        <tr>
            <td class="label">Tipo de Escuela</td>
            <td class="value">{{ $institucion->tipo_de_escuela }} | Turno: ({{ $institucion->turno }})</td>
        </tr>
    </table>

    <!-- SECCIÓN 2 -->
    <div class="section-title">Ubicación y Contacto</div>
    <table class="data-table">
        <tr>
            <td class="label">Dirección Física</td>
            <td class="value">{{ $institucion->direccion }}</td>
        </tr>
        <tr>
            <td class="label">Ubicación Geográfica</td>
            <td class="value">
                {{ $institucion->municipio }}, Edo. {{ $institucion->estado }}<br>
                <small style="color: #64748b">Parroquia: {{ $institucion->parroquia }} | Comuna: {{ $institucion->comuna }}</small>
            </td>
        </tr>
        <tr>
            <td class="label">Zona Educativa</td>
            <td class="value">{{ $institucion->zona_educativa }}</td>
        </tr>
        <tr>
            <td class="label">Contacto</td>
            <td class="value">
                <strong>Tel:</strong> {{ $institucion->telefono }}<br>
                <strong>Email:</strong> {{ $institucion->email }}
            </td>
        </tr>
    </table>

    <!-- SECCIÓN 3 -->
    <div class="section-title">Códigos Administrativos</div>
    <table class="data-table">
        <tr>
            <td class="label">Código DEA</td>
            <td class="value">{{ $institucion->codigo_dea }}</td>
            <td class="label">Código CENAE</td>
            <td class="value">{{ $institucion->codigo_cenae }}</td>
        </tr>
        <tr>
            <td class="label">Código Estadístico</td>
            <td class="value">{{ $institucion->codigo_estadistico }}</td>
            <td class="label">Código Electoral</td>
            <td class="value">{{ $institucion->codigo_electoral }}</td>
        </tr>
        <tr>
            <td class="label">Cód. Dependencia</td>
            <td class="value">{{ $institucion->codigo_de_dependencia }}</td>
            <td class="label">Circuito</td>
            <td class="value">{{ $institucion->circuito }}</td>
        </tr>
        <tr>
            <td class="label">Cód. Circuital</td>
            <td class="value">{{ $institucion->codigo_circuito }}</td>
            <td class="label">Medio</td>
            <td class="value">{{ $institucion->medio }}</td>
        </tr>
    </table>

    <!-- Pie de página -->
    <div class="footer">
        Sistema de Gestión Escolar © {{ date('Y') }} • {{ $institucion->nombre_de_la_institucion }}
    </div>

</body>

</html>