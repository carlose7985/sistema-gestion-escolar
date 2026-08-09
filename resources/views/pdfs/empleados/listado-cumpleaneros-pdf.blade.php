<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cumpleañeros por mes</title>

    <style>
        @page {
            margin: 1.0cm 1.5cm 1.0cm 1.5cm;
        }

        .text-11 {
            font-size: 11pt !important;
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
            line-height: 0.7cm;

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
            margin-top: 5px;
        }

        .uppercase {
            text-transform: uppercase;
            margin-left: 1rem;
        }

        .page-break-before {
            page-break-before: always;
        }
    </style>
</head>

<body>
    <div id="header">

       
            <table class="table-header" border="0">
                <tr>
                    <td width="100%"><img src="{{ $logoDocumento }}" alt="imagen" width="100%" height="50px"
                            title=""></td>
                </tr>
            </table>
       


        <table class="table-header-a" border="0">
            <tr>
                <td class="text-center text-11" width="100%"><b>CUMPLEAÑEROS POR MES</b></td>
            </tr>
        </table>


    </div>

    <div class="container">
        <table style="width: 100%;border-collapse: collapse;border:none; line-height: 0.6cm;margin-left: 0.1cm;"
            border="1">

            @foreach ($groupedEmployees as $monthNumber => $employees)
                <tr style="background-color: rgb(114, 114, 107); color: white"
                    class="@if (!$loop->first) page-break-before @endif">
                    <th class="text-11 uppercase" colspan="2">{{ $mess[$monthNumber] ?? 'Mes Desconocido' }}</th>
                </tr>

                    {{-- <tr style="background-color: rgb(114, 114, 107); color: white">
                        <th class="text-11 uppercase" colspan="2">{{ $months[$monthNumber] ?? 'Mes Desconocido' }}</th>
                    </tr> --}}

                <tr style="background-color: blue; color: white;">
                    <th class="text-11 text-center uppercase">Empleados</th>
                    <th class="text-11 text-center uppercase">Día de cumpleaños</th>
                </tr>

                @foreach ($employees as $employee)
                    <tr>
                        <th class="text-10 text-left uppercase">&nbsp;{{ $employee->nombres }}</th>
                        <th class="text-10 text-center uppercase">
                            {{ \Carbon\Carbon::parse($employee->fecha_de_nacimiento)->format('d') }}</th>
                    </tr>
                @endforeach
            @endforeach
            @if ($groupedEmployees->isEmpty())
                <p>No hay empleados para mostrar.</p>
            @endif


        </table>
    </div>
</body>

</html>
