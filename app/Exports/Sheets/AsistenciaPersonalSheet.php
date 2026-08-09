<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AsistenciaPersonalSheet implements FromArray, WithTitle, WithStyles
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
        $data[] = ['RELACIÓN DE ESTADÍSTICA MENSUAL'];
        $data[] = [''];
        $data[] = [''];

        // Primera fila de encabezados principales (combinadas)
        $headerPrincipal = [
            'FECHA',        // Ocupará A4:A6
            'DÍA',          // Ocupará B4:B6
            // Administrativos (9 columnas - 3 grupos de 3)
            'ADMINISTRATIVOS',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            // Obreros (9 columnas - 3 grupos de 3)
            'OBREROS',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            // Cenae (9 columnas - 3 grupos de 3)
            'CENAE',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            // Vigilantes (9 columnas - 3 grupos de 3)
            'VIGILANTES',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        ];
        $data[] = $headerPrincipal;

        // Segunda fila de encabezados detallados
        $headerDetallado = [
            '', // FECHA (combinada)
            '', // DÍA (combinada)
            // Administrativos (9 columnas)
            'RAC',
            '',
            '',
            'ASISTENTE',
            '',
            '',
            'PROMEDIO',
            '',
            '',
            // Obreros (9 columnas)
            'RAC',
            '',
            '',
            'ASISTENTE',
            '',
            '',
            'PROMEDIO',
            '',
            '',
            // Cenae (9 columnas)
            'RAC',
            '',
            '',
            'ASISTENTE',
            '',
            '',
            'PROMEDIO',
            '',
            '',
            // Vigilantes (9 columnas)
            'RAC',
            '',
            '',
            'ASISTENTE',
            '',
            '',
            'PROMEDIO',
            '',
            ''
        ];
        $data[] = $headerDetallado;

        // Tercera fila de encabezados (V, H, T para cada grupo)
        $headerGenero = [
            '', // FECHA
            '', // DÍA
            // Administrativos
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            // Obreros
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            // Cenae
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            // Vigilantes
            'V',
            'H',
            'T',
            'V',
            'H',
            'T',
            'V',
            'H',
            'T'
        ];
        $data[] = $headerGenero;

        // Obtener datos reales de la base de datos - AGRUPADOS POR FECHA Y TIPO
        $dias = $this->obtenerDatosDelMes();

        foreach ($dias as $dia) {
            $fila = [
                $dia['fecha_formateada'],
                $dia['nombre_dia'],
            ];

            // Agregar datos para cada tipo de personal (9 columnas por tipo)
            foreach (['Administrativo', 'Obrero', 'Cenae', 'Vigilante'] as $tipo) {
                $datosTipo = $dia['tipos_personal'][$tipo] ?? $this->datosVacios();

                $fila = array_merge($fila, [
                    // RAC (3 columnas)
                    $datosTipo['varones_existentes'] ?? 0,
                    $datosTipo['hembras_existentes'] ?? 0,
                    $datosTipo['total_existentes'] ?? 0,
                    // ASISTENTE (3 columnas)
                    $datosTipo['varones_asistentes'] ?? 0,
                    $datosTipo['hembras_asistentes'] ?? 0,
                    $datosTipo['total_asistentes'] ?? 0,
                    // PROMEDIO (3 columnas - vacío como solicitado)
                    '',
                    '',
                    ''
                ]);
            }

            $data[] = $fila;
        }

        return $data;
    }

    public function title(): string
    {
        return 'PERSONAL';
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
            // Fila 4: Encabezados principales (FECHA, DÍA, ADMINISTRATIVOS, etc.)
            4 => [
                'font' => [
                    'bold' => true
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                ]
            ],
            // Fila 5: Encabezados de grupos (RAC, ASISTENTE, PROMEDIO)
            5 => [
                'font' => [
                    'bold' => true
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ]
            ],
            // Fila 6: Encabezados de género (V, H, T)
            6 => [
                'font' => [
                    'bold' => true
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ]
            ],
        ];

        // Combinar celdas para el título
        $sheet->mergeCells('A1:AL1');

        // Combinar celdas para FECHA (A4:A6) y DÍA (B4:B6)
        $sheet->mergeCells('A4:A6');
        $sheet->mergeCells('B4:B6');

        // Combinar celdas para los encabezados principales de cada tipo de personal (9 columnas cada uno)
        $sheet->mergeCells('C4:K4');   // ADMINISTRATIVOS (9 celdas: C-K)
        $sheet->mergeCells('L4:T4');   // OBREROS (9 celdas: L-T)
        $sheet->mergeCells('U4:AC4');  // CENAE (9 celdas: U-AC)
        $sheet->mergeCells('AD4:AL4'); // VIGILANTES (9 celdas: AD-AL)

        // Combinar celdas para los grupos dentro de cada tipo de personal (3 columnas cada grupo)
        // Administrativos
        $sheet->mergeCells('C5:E5'); // RAC
        $sheet->mergeCells('F5:H5'); // ASISTENTE
        $sheet->mergeCells('I5:K5'); // PROMEDIO

        // Obreros
        $sheet->mergeCells('L5:N5'); // RAC
        $sheet->mergeCells('O5:Q5'); // ASISTENTE
        $sheet->mergeCells('R5:T5'); // PROMEDIO

        // Cenae
        $sheet->mergeCells('U5:W5'); // RAC
        $sheet->mergeCells('X5:Z5'); // ASISTENTE
        $sheet->mergeCells('AA5:AC5'); // PROMEDIO

        // Vigilantes
        $sheet->mergeCells('AD5:AF5'); // RAC
        $sheet->mergeCells('AG5:AI5'); // ASISTENTE
        $sheet->mergeCells('AJ5:AL5'); // PROMEDIO

        // Centrar todos los encabezados y datos
        $ultimaFila = $sheet->getHighestRow();
        $sheet->getStyle('A4:AL' . $ultimaFila)->getAlignment()->setHorizontal('center');

        // Centrado vertical para las celdas combinadas de FECHA y DÍA
        $sheet->getStyle('A4:B6')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

        // Ajustar el ancho de las columnas para mejor visualización
        $sheet->getColumnDimension('A')->setWidth(12); // FECHA
        $sheet->getColumnDimension('B')->setWidth(12); // DÍA

        // Configurar el mismo ancho para todas las columnas de datos
        for ($col = 'C'; $col <= 'AL'; $col++) {
            $sheet->getColumnDimension($col)->setWidth(8);
        }

        // Aplicar bordes a los encabezados para mejor visualización
        $headerStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ];

        $sheet->getStyle('A4:AL' . $ultimaFila)->applyFromArray($headerStyle);

        return $styles;
    }

    private function obtenerDatosDelMes()
    {
        $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

        // Obtener todos los registros del mes para los tipos de personal específicos
        $registros = DB::table('total_empleados')
            ->whereYear('fecha_registro', $this->anio)
            ->whereMonth('fecha_registro', $this->mes)
            ->whereIn('tipo_de_personal', ['Administrativo', 'Obrero', 'Cenae', 'Vigilante'])
            ->whereRaw('DAYOFWEEK(fecha_registro) NOT IN (1,7)') // Excluir domingo(1) y sábado(7)
            ->orderBy('fecha_registro', 'asc')
            ->get();

        // Organizar datos por fecha y tipo de personal - AGRUPANDO REGISTROS DUPLICADOS
        $datosPorFecha = [];

        foreach ($registros as $registro) {
            $fecha = $registro->fecha_registro;
            $timestamp = strtotime($fecha);
            $numeroDiaSemana = date('w', $timestamp);

            // Solo incluir días de lunes a viernes
            if ($numeroDiaSemana >= 1 && $numeroDiaSemana <= 5) {
                $fechaFormateada = date('d/m/Y', $timestamp);
                $tipoPersonal = $registro->tipo_de_personal;

                if (!isset($datosPorFecha[$fechaFormateada])) {
                    $datosPorFecha[$fechaFormateada] = [
                        'fecha_formateada' => $fechaFormateada,
                        'nombre_dia' => $diasSemana[$numeroDiaSemana],
                        'tipos_personal' => []
                    ];
                }

                // Si ya existe un registro para este tipo de personal en esta fecha, SUMAR los asistentes
                if (isset($datosPorFecha[$fechaFormateada]['tipos_personal'][$tipoPersonal])) {
                    $datosExistentes = $datosPorFecha[$fechaFormateada]['tipos_personal'][$tipoPersonal];

                    // Mantener los valores existentes (RAC) del primer registro
                    // Sumar solo los asistentes
                    $datosPorFecha[$fechaFormateada]['tipos_personal'][$tipoPersonal] = [
                        'varones_existentes' => $datosExistentes['varones_existentes'], // Mantener del primer registro
                        'hembras_existentes' => $datosExistentes['hembras_existentes'], // Mantener del primer registro
                        'total_existentes' => $datosExistentes['total_existentes'], // Mantener del primer registro
                        'varones_asistentes' => $datosExistentes['varones_asistentes'] + $registro->varones_asistentes,
                        'hembras_asistentes' => $datosExistentes['hembras_asistentes'] + $registro->hembras_asistentes,
                        'total_asistentes' => $datosExistentes['total_asistentes'] + $registro->total_asistentes,
                    ];
                } else {
                    // Primer registro para este tipo de personal en esta fecha
                    $datosPorFecha[$fechaFormateada]['tipos_personal'][$tipoPersonal] = [
                        'varones_existentes' => $registro->varones_existentes,
                        'hembras_existentes' => $registro->hembras_existentes,
                        'total_existentes' => $registro->total_existentes,
                        'varones_asistentes' => $registro->varones_asistentes,
                        'hembras_asistentes' => $registro->hembras_asistentes,
                        'total_asistentes' => $registro->total_asistentes,
                    ];
                }
            }
        }

        // Convertir el array asociativo a array indexado
        return array_values($datosPorFecha);
    }

    // Versión alternativa usando consulta SQL agrupada (MÁS EFICIENTE)
    private function obtenerDatosDelMesAgrupado()
    {
        $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

        // Consulta agrupada por fecha y tipo de personal
        $registros = DB::table('total_empleados')
            ->select(
                'fecha_registro',
                'tipo_de_personal',
                DB::raw('MAX(varones_existentes) as varones_existentes'),
                DB::raw('MAX(hembras_existentes) as hembras_existentes'),
                DB::raw('MAX(total_existentes) as total_existentes'),
                DB::raw('SUM(COALESCE(varones_asistentes, 0)) as varones_asistentes'),
                DB::raw('SUM(COALESCE(hembras_asistentes, 0)) as hembras_asistentes'),
                DB::raw('SUM(COALESCE(total_asistentes, 0)) as total_asistentes')
            )
            ->whereYear('fecha_registro', $this->anio)
            ->whereMonth('fecha_registro', $this->mes)
            ->whereIn('tipo_de_personal', ['Administrativo', 'Obrero', 'Cenae', 'Vigilante'])
            ->whereRaw('DAYOFWEEK(fecha_registro) NOT IN (1,7)')
            ->groupBy('fecha_registro', 'tipo_de_personal')
            ->orderBy('fecha_registro', 'asc')
            ->get();

        $datosPorFecha = [];

        foreach ($registros as $registro) {
            $fecha = $registro->fecha_registro;
            $timestamp = strtotime($fecha);
            $numeroDiaSemana = date('w', $timestamp);

            if ($numeroDiaSemana >= 1 && $numeroDiaSemana <= 5) {
                $fechaFormateada = date('d/m/Y', $timestamp);
                $tipoPersonal = $registro->tipo_de_personal;

                if (!isset($datosPorFecha[$fechaFormateada])) {
                    $datosPorFecha[$fechaFormateada] = [
                        'fecha_formateada' => $fechaFormateada,
                        'nombre_dia' => $diasSemana[$numeroDiaSemana],
                        'tipos_personal' => []
                    ];
                }

                // Almacenar datos ya agrupados
                $datosPorFecha[$fechaFormateada]['tipos_personal'][$tipoPersonal] = [
                    'varones_existentes' => (int)($registro->varones_existentes ?? 0),
                    'hembras_existentes' => (int)($registro->hembras_existentes ?? 0),
                    'total_existentes' => (int)($registro->total_existentes ?? 0),
                    'varones_asistentes' => (int)($registro->varones_asistentes ?? 0),
                    'hembras_asistentes' => (int)($registro->hembras_asistentes ?? 0),
                    'total_asistentes' => (int)($registro->total_asistentes ?? 0),
                ];
            }
        }

        return array_values($datosPorFecha);
    }

    private function datosVacios()
    {
        return [
            'varones_existentes' => 0,
            'hembras_existentes' => 0,
            'total_existentes' => 0,
            'varones_asistentes' => 0,
            'hembras_asistentes' => 0,
            'total_asistentes' => 0,
        ];
    }
}
