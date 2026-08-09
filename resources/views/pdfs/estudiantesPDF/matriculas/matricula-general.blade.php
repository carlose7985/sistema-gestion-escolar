{{-- resources/views/PDFS/estudiantesPDF/matriculas/matricula-general.blade.php --}}
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Matrícula General</title>
    <style>
        @page {
            margin: 1cm 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
        }

        .text-center {
            text-align: center;
        }

        .text-12 {
            font-size: 12pt;
        }

        .text-9 {
            font-size: 9pt;
        }

        .bold {
            font-weight: bold;
        }

        .title-box {
            margin: 10px 0;
            text-align: center;
            font-family: 'Helvetica', sans-serif;
            font-size: 12pt;
            font-weight: black;
            text-decoration: underline;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        table.data-table th {
            background-color: #1e40af;
            color: white;
            padding: 6px;
            font-size: 10pt;
            text-transform: uppercase;
        }

        table.data-table td {
            border: 1px solid #ddd;
            padding: 4px;
            font-size: 10pt;
        }

        .bg-gray {
            background-color: #f9fafb;
            font-weight: bold;
        }
    </style>
</head>

<body>

    @include('pdfs.estudiantesPDF.header')

    <div class="title-box">
        MATRÍCULA GENERAL DE ALUMNOS(AS)
    </div>

    <div class="container">
        <!-- TABLA 1: TOTAL GENERAL -->
        <table class="data-table">
            <thead>
                <tr>
                    <th colspan="3">Total General por Género</th>
                </tr>
                <tr class="bg-gray">
                    <td class="text-center">VARONES</td>
                    <td class="text-center">HEMBRAS</td>
                    <td class="text-center">TOTAL</td>
                </tr>
            </thead>
            <tbody>
                {{-- 🔥 CORREGIDO: $totalmatricula es un objeto, no un array --}}
                <tr>
                    <td class="text-center">{{ $totalmatricula->totalm ?? 0 }}</td>
                    <td class="text-center">{{ $totalmatricula->totalf ?? 0 }}</td>
                    <td class="text-center bold" style="background-color: #eff6ff;">{{ $totalmatricula->total ?? 0 }}</td>
                </tr>
            </tbody>
        </table>

        <!-- TABLA 2: TOTAL POR GRADO -->
        <table class="data-table">
            <thead>
                <tr>
                    <th colspan="4">Resumen por Grado</th>
                </tr>
                <tr class="bg-gray">
                    <td>GRADO</td>
                    <td class="text-center">VARONES</td>
                    <td class="text-center">HEMBRAS</td>
                    <td class="text-center">TOTAL</td>
                </tr>
            </thead>
            <tbody>
                @foreach ($totalporgrado as $r)
                <tr>
                    <td class="bold">{{ $r->grado }}</td>
                    <td class="text-center">{{ $r->totalm }}</td>
                    <td class="text-center">{{ $r->totalf }}</td>
                    <td class="text-center bold">{{ $r->total }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- TABLA 3: TOTAL POR SECCIÓN -->
        <table class="data-table">
            <thead>
                <tr>
                    <th colspan="4">Detalle por Grado y Sección</th>
                </tr>
                <tr class="bg-gray">
                    <td>GRADO Y SECCIÓN</td>
                    <td class="text-center">VARONES</td>
                    <td class="text-center">HEMBRAS</td>
                    <td class="text-center">TOTAL</td>
                </tr>
            </thead>
            <tbody>
                @foreach ($totalporgradoiseccion as $r)
                <tr>
                    <td>{{ $r->grado }} - Sección "{{ $r->seccion }}"</td>
                    <td class="text-center">{{ $r->totalm }}</td>
                    <td class="text-center">{{ $r->totalf }}</td>
                    <td class="text-center bold">{{ $r->total }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</body>

</html>