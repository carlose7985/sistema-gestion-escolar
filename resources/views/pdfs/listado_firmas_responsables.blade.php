<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Listado para Firmas por Grado</title>
    <style>
        @page {
            margin: 1.5cm;
        }

        /* Márgenes de la hoja limpios */
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
        }

        h2 {
            text-align: center;
            margin-bottom: 15px;
            font-size: 14px;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }

        /* Control de altura pegadito pero cómodo para firmar */
        .fila-datos {
            height: 28px;
        }

        .text-center {
            text-align: center;
        }
    </style>
</head>

<body>

    <h2>Listado de Representantes</h2>

    <table>
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">N°</th>
                <!-- <th style="width: 15%; text-align: center;">Grado / Sec</th> -->
                <th style="width: 45%;">Representante</th>
                <th style="width: 15%;">Cédula</th>
                <th style="width: 20%;">Firma</th>
            </tr>
        </thead>
        <tbody>
            @foreach($coleccion as $index => $item)
            <tr class="fila-datos">
                <td class="text-center">{{ $index + 1 }}</td>
                <!-- <td class="text-center"><strong>{{ $item->grado_seccion }}</strong></td> -->
                <td>{{ $item->nombre }}</td>
                <td>{{ $item->cedula }}</td>
                <td></td> <!-- Espacio en blanco integrado en la fila para firmar -->
            </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>