<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AsistenciaDocentesSheet implements FromArray, WithTitle, WithStyles
{
    protected $mes;
    protected $anio;

    public function __construct($mes, $anio)
    {
        $this->mes = $mes;
        $this->anio = $anio;
    }

    public function array(): array
    {
        $data = [];

        // Título
        $data[] = ['RELACIÓN DE ASISTENCIA MENSUAL DOCENTES'];
        $data[] = [''];
        $data[] = [''];

        // Primera fila de encabezados principales (combinadas)
        $headerPrincipal = [
            'FECHA',        // Ocupará A4:A5
            'DÍA',          // Ocupará B4:B5
            'TOTAL RAC',
            '',
            '',
            'MATRÍCULA ASISTENTE',
            '',
            '',
            'PROMEDIO',
            '',
            ''
        ];
        $data[] = $headerPrincipal;

        // Segunda fila de encabezados detallados
        $headerDetallado = [
            '', // FECHA (ya está en la fila anterior, combinada)
            '', // DÍA (ya está en la fila anterior, combinada)
            'V', // Bajo MATRÍCULA INSCRITA
            'H', // Bajo MATRÍCULA INSCRITA
            'T', // Bajo MATRÍCULA INSCRITA
            'V', // Bajo MATRÍCULA ASISTENTE
            'H', // Bajo MATRÍCULA ASISTENTE
            'T', // Bajo MATRÍCULA ASISTENTE
            'V', // Bajo PROMEDIO
            'H', // Bajo PROMEDIO
            'T'  // Bajo PROMEDIO
        ];
        $data[] = $headerDetallado;

        try {
            // Obtener días laborables (lunes a viernes) que tienen registros en la base de datos
            $diasConRegistros = $this->obtenerDiasConRegistros();

            foreach ($diasConRegistros as $dia) {
                $fila = [
                    $dia['fecha_formateada'],
                    $dia['nombre_dia'],
                    // MATRÍCULA INSCRITA
                    $dia['varones_existentes'] ?? 0,
                    $dia['hembras_existentes'] ?? 0,
                    $dia['total_existentes'] ?? 0,
                    // MATRÍCULA ASISTENTE
                    $dia['varones_asistentes'] ?? 0,
                    $dia['hembras_asistentes'] ?? 0,
                    $dia['total_asistentes'] ?? 0,
                    // PROMEDIO (vacío)
                    '',
                    '',
                    '',
                ];
                $data[] = $fila;
            }
        } catch (\Exception $e) {
            // Datos de ejemplo para debugging
            $diasEjemplo = $this->obtenerDiasConRegistrosEjemplo();
            foreach ($diasEjemplo as $dia) {
                $data[] = [
                    $dia['fecha_formateada'],
                    $dia['nombre_dia'],
                    // MATRÍCULA INSCRITA
                    $dia['varones_existentes'] ?? 0,
                    $dia['hembras_existentes'] ?? 0,
                    $dia['total_existentes'] ?? 0,
                    // MATRÍCULA ASISTENTE  
                    $dia['varones_asistentes'] ?? 0,
                    $dia['hembras_asistentes'] ?? 0,
                    $dia['total_asistentes'] ?? 0,
                    // PROMEDIO
                    '',
                    '',
                    ''
                ];
            }
        }

        return $data;
    }

    public function title(): string
    {
        return 'DOCENTES';
    }

    public function styles(Worksheet $sheet)
    {
        // Aplicar estilos
        $styles = [
            // Fila 1: Título principal
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 16
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ]
            ],
            // Fila 4: Encabezados principales (FECHA, DÍA, MATRÍCULA INSCRITA, etc.)
            4 => [
                'font' => [
                    'bold' => true
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                ]
            ],
            // Fila 5: Encabezados detallados (V, H, T)
            5 => [
                'font' => [
                    'bold' => true
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ]
            ],
        ];

        // Combinar celdas para el título
        $sheet->mergeCells('A1:K1');

        // Combinar celdas para FECHA (A4:A5) y DÍA (B4:B5)
        $sheet->mergeCells('A4:A5'); // FECHA ocupa A4 y A5 (verticalmente)
        $sheet->mergeCells('B4:B5'); // DÍA ocupa B4 y B5 (verticalmente)

        // Combinar celdas para los encabezados principales en la fila 4
        $sheet->mergeCells('C4:E4'); // MATRÍCULA INSCRITA (3 celdas)
        $sheet->mergeCells('F4:H4'); // MATRÍCULA ASISTENTE (3 celdas)
        $sheet->mergeCells('I4:K4'); // PROMEDIO (3 celdas)

        // Centrar todos los encabezados y datos
        $ultimaFila = $sheet->getHighestRow();
        $sheet->getStyle('A4:K' . $ultimaFila)->getAlignment()->setHorizontal('center');

        // Centrado vertical para las celdas combinadas de FECHA y DÍA
        $sheet->getStyle('A4:B5')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        // Ajustar el ancho de las columnas para mejor visualización
        $sheet->getColumnDimension('A')->setWidth(12); // FECHA
        $sheet->getColumnDimension('B')->setWidth(12); // DÍA
        $sheet->getColumnDimension('C')->setWidth(8);  // V (Inscrita)
        $sheet->getColumnDimension('D')->setWidth(8);  // H (Inscrita)
        $sheet->getColumnDimension('E')->setWidth(8);  // T (Inscrita)
        $sheet->getColumnDimension('F')->setWidth(8);  // V (Asistente)
        $sheet->getColumnDimension('G')->setWidth(8);  // H (Asistente)
        $sheet->getColumnDimension('H')->setWidth(8);  // T (Asistente)
        $sheet->getColumnDimension('I')->setWidth(8);  // V (Promedio)
        $sheet->getColumnDimension('J')->setWidth(8);  // H (Promedio)
        $sheet->getColumnDimension('K')->setWidth(8);  // T (Promedio)

        // Aplicar bordes a los encabezados para mejor visualización
        $headerStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ];

        $sheet->getStyle('A4:K' . $ultimaFila)->applyFromArray($headerStyle);

        return $styles;
    }

    // private function obtenerDiasConRegistros()
    // {
    //     $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

    //     // Obtener todos los registros del mes específico para DOCENTES, excluyendo sábados y domingos
    //     $registros = DB::table('totalempleados')
    //         ->whereYear('fecha_registro', $this->anio)
    //         ->whereMonth('fecha_registro', $this->mes)
    //         ->where('tipo_de_personal', 'Docente') // Filtrar solo por Docentes
    //         ->whereRaw('DAYOFWEEK(fecha_registro) NOT IN (1,7)') // Excluir domingo(1) y sábado(7)
    //         ->orderBy('fecha_registro', 'asc')
    //         ->get();

    //     $dias = [];

    //     foreach ($registros as $registro) {
    //         $fecha = $registro->fecha_registro;
    //         $timestamp = strtotime($fecha);
    //         $numeroDiaSemana = date('w', $timestamp); // 0=domingo, 1=lunes, ..., 6=sábado

    //         // Solo incluir días de lunes a viernes (por si acaso el filtro SQL no funcionó)
    //         if ($numeroDiaSemana >= 1 && $numeroDiaSemana <= 5) {
    //             $dias[] = [
    //                 'fecha_formateada' => date('d/m/Y', $timestamp),
    //                 'nombre_dia' => $diasSemana[$numeroDiaSemana],
    //                 'varones_existentes' => $registro->varones_existentes,
    //                 'hembras_existentes' => $registro->hembras_existentes,
    //                 'total_existentes' => $registro->total_existentes,
    //                 'varones_asistentes' => $registro->varones_asistentes,
    //                 'hembras_asistentes' => $registro->hembras_asistentes,
    //                 'total_asistentes' => $registro->total_asistentes,
    //             ];
    //         }
    //     }

    //     return $dias;
    // }

    private function obtenerDiasConRegistros()
    {
        $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

        // Obtener todos los registros del mes específico para DOCENTES, excluyendo sábados y domingos
        $registros = DB::table('total_empleados')
            ->whereYear('fecha_registro', $this->anio)
            ->whereMonth('fecha_registro', $this->mes)
            ->where('tipo_de_personal', 'Docente') // Filtrar solo por Docentes
            ->whereRaw('DAYOFWEEK(fecha_registro) NOT IN (1,7)') // Excluir domingo(1) y sábado(7)
            ->orderBy('fecha_registro', 'asc')
            ->get();

        // Agrupar registros por fecha
        $registrosAgrupados = [];
        foreach ($registros as $registro) {
            $fecha = $registro->fecha_registro;
            $fechaKey = date('Y-m-d', strtotime($fecha));

            if (!isset($registrosAgrupados[$fechaKey])) {
                // Primer registro para esta fecha - mantener todos los valores existentes
                $registrosAgrupados[$fechaKey] = [
                    'fecha' => $fecha,
                    'varones_existentes' => $registro->varones_existentes,
                    'hembras_existentes' => $registro->hembras_existentes,
                    'total_existentes' => $registro->total_existentes,
                    'varones_asistentes' => $registro->varones_asistentes,
                    'hembras_asistentes' => $registro->hembras_asistentes,
                    'total_asistentes' => $registro->total_asistentes,
                ];
            } else {
                // Registros adicionales para la misma fecha - sumar solo los asistentes
                $registrosAgrupados[$fechaKey]['varones_asistentes'] += $registro->varones_asistentes;
                $registrosAgrupados[$fechaKey]['hembras_asistentes'] += $registro->hembras_asistentes;
                $registrosAgrupados[$fechaKey]['total_asistentes'] += $registro->total_asistentes;

                // Los valores existentes se mantienen del primer registro
                // (asumiendo que los valores existentes son los mismos para todos los registros del mismo día)
            }
        }

        $dias = [];

        foreach ($registrosAgrupados as $registro) {
            $fecha = $registro['fecha'];
            $timestamp = strtotime($fecha);
            $numeroDiaSemana = date('w', $timestamp); // 0=domingo, 1=lunes, ..., 6=sábado

            // Solo incluir días de lunes a viernes (por si acaso el filtro SQL no funcionó)
            if ($numeroDiaSemana >= 1 && $numeroDiaSemana <= 5) {
                $dias[] = [
                    'fecha_formateada' => date('d/m/Y', $timestamp),
                    'nombre_dia' => $diasSemana[$numeroDiaSemana],
                    'varones_existentes' => $registro['varones_existentes'],
                    'hembras_existentes' => $registro['hembras_existentes'],
                    'total_existentes' => $registro['total_existentes'],
                    'varones_asistentes' => $registro['varones_asistentes'],
                    'hembras_asistentes' => $registro['hembras_asistentes'],
                    'total_asistentes' => $registro['total_asistentes'],
                ];
            }
        }

        return $dias;
    }

    private function obtenerDiasConRegistrosEjemplo()
    {
        $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        $dias = [];

        // Generar algunos días de ejemplo para debugging
        for ($i = 1; $i <= 5; $i++) {
            $fecha = $this->anio . '-' . str_pad($this->mes, 2, '0', STR_PAD_LEFT) . '-' . str_pad($i * 2, 2, '0', STR_PAD_LEFT);
            $timestamp = strtotime($fecha);
            $numeroDiaSemana = date('w', $timestamp);

            if ($numeroDiaSemana >= 1 && $numeroDiaSemana <= 5) {
                $dias[] = [
                    'fecha_formateada' => date('d/m/Y', $timestamp),
                    'nombre_dia' => $diasSemana[$numeroDiaSemana],
                    'varones_existentes' => rand(10, 20),
                    'hembras_existentes' => rand(15, 25),
                    'total_existentes' => rand(25, 45),
                    'varones_asistentes' => rand(8, 18),
                    'hembras_asistentes' => rand(12, 22),
                    'total_asistentes' => rand(20, 40),
                ];
            }
        }

        return $dias;
    }
}
