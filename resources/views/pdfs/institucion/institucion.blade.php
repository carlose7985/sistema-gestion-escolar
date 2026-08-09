<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte Institucional</title>
    <style>
        @page {
            margin: 2cm;
        }

        body {
            font-family: 'Helvetica', sans-serif;
            color: #1e1b4b;
            /* Indigo 950 */
            line-height: 1.5;
            font-size: 11px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
        }

        .header h1 {
            text-transform: uppercase;
            font-size: 18px;
            margin: 0;
            color: #4f46e5;
        }

        .header p {
            margin: 2px 0;
            font-weight: bold;
            color: #64748b;
            font-style: italic;
        }

        .section-title {
            background-color: #f8fafc;
            padding: 8px 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #4f46e5;
            border-left: 4px solid #4f46e5;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .data-table td {
            padding: 6px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            font-size: 9px;
            width: 35%;
        }

        .value {
            color: #0f172a;
            font-weight: bold;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 5px;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>REPORTE DE DATOS DE LA INSTITUCION</h1>
        <p>Sistema de Gestión Educativa SIS-GES-ESCOLAR</p>
    </div>

    <div class="section-title">I. Identidad Institucional</div>
    <table class="data-table">
        <tr>
            <td class="label">Nombre de la Institución:</td>
            <td class="value">{{ $institucion->nombre_de_la_institucion }}</td>
        </tr>
        <tr>
            <td class="label">RIF / NIF:</td>
            <td class="value">{{ $institucion->rif }} / {{ $institucion->nif }}</td>
        </tr>
        <tr>
            <td class="label">Correo Electrónico:</td>
            <td class="value">{{ $institucion->email }}</td>
        </tr>
        <tr>
            <td class="label">Teléfono:</td>
            <td class="value">{{ $institucion->telefono }}</td>
        </tr>
        <tr>
            <td class="label">Fecha de Fundación:</td>
            <td class="value">{{ \Carbon\Carbon::parse($institucion->fecha_de_fundada)->format('d/m/Y') }}</td>
        </tr>
    </table>

    <div class="section-title">II. Códigos y Dependencia</div>
    <table class="data-table">
        <tr>
            <td class="label">Código DEA:</td>
            <td class="value">{{ $institucion->codigo_dea }}</td>
            <td class="label">Cód. Estadístico:</td>
            <td class="value">{{ $institucion->codigo_estadistico }}</td>
        </tr>
        <tr>
            <td class="label">Zona Educativa:</td>
            <td class="value">{{ $institucion->zona_educativa }}</td>
            <td class="label">Circuito / Cód:</td>
            <td class="value">{{ $institucion->circuito }} ({{ $institucion->codigo_circuito }})</td>
        </tr>
        <tr>
            <td class="label">Turno / Medio:</td>
            <td class="value">{{ $institucion->turno }} / {{ $institucion->medio }}</td>
            <td class="label">Tipo de Escuela:</td>
            <td class="value">{{ $institucion->tipo_de_escuela }}</td>
        </tr>
    </table>

    <div class="section-title">III. Ubicación Geográfica</div>
    <table class="data-table">
        <tr>
            <td class="label">Estado / Municipio:</td>
            <td class="value">{{ $institucion->estado }} / {{ $institucion->municipio }}</td>
        </tr>
        <tr>
            <td class="label">Parroquia / Comuna:</td>
            <td class="value">{{ $institucion->parroquia }} / {{ $institucion->comuna }}</td>
        </tr>
        <tr>
            <td class="label">Dirección Completa:</td>
            <td class="value">{{ $institucion->direccion }}</td>
        </tr>
    </table>

    <div class="section-title">IV. Infraestructura</div>
    <table class="data-table">
        <tr>
            <td class="label">Nro. de Aulas / Secciones:</td>
            <td class="value">{{ $institucion->numero_de_aulas }} / {{ $institucion->numero_de_secciones }}</td>
            <td class="label">Otras Áreas:</td>
            <td class="value">{{ $institucion->otras_aulas }}</td>
        </tr>
    </table>

    <div class="footer">
        Generado por SIS-GES-ESCOLAR el {{ date('d/m/Y h:i A') }} - Copia certificada del sistema.
    </div>

</body>

</html>