<?php

namespace App\Exports;

use App\Helpers\PeriodoHelper;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class EstudiantesPerGradeSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithColumnWidths, WithEvents
{
    private $grado;
    private $nombreInst;
    private $rowNumber = 0;
    private $periodoId;

    public function __construct($grado, $nombreInst)
    {
        $this->grado = $grado;
        $this->nombreInst = $nombreInst;

        // Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();
        $this->periodoId = $periodoActivo ? $periodoActivo->id : null;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet->getDelegate()->mergeCells('A1:S1');
                $event->sheet->getDelegate()->mergeCells('A2:S2');
                $event->sheet->getDelegate()->mergeCells('A3:S3');
                $event->sheet->getDelegate()->getStyle('A1:A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            },
        ];
    }

    public function collection()
    {
        if (!$this->periodoId) {
            return collect([]);
        }

        // Usar DB query para obtener estudiantes del período activo
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->leftJoin('responsables as representante', 'estudiantes.representante_id', '=', 'representante.id')
            ->leftJoin('responsables as padre', 'estudiantes.padre_id', '=', 'padre.id')
            ->where('estudiante_periodos.periodo_id', $this->periodoId)
            ->where('estudiante_periodos.grado_id', $this->grado->id)
            ->where('estudiante_periodos.status', 'Activo')
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                'estudiantes.lugar_de_nacimiento',
                'estudiantes.condicion_especial',
                'estudiante_periodos.direccion',
                'estudiante_periodos.talla_de_camisa',
                'estudiante_periodos.talla_de_pantalon',
                'estudiante_periodos.talla_de_zapato',
                'estudiante_periodos.condicion',
                'representante.name_r as representante_name',
                'representante.cedula_r as representante_cedula',
                'representante.telefono_r as representante_telefono',
                'padre.name_r as padre_name',
                'padre.cedula_r as padre_cedula',
                'padre.telefono_r as padre_telefono'
            )
            ->orderBy('estudiantes.sexo', 'asc')
            ->orderBy('estudiantes.apellido', 'asc')
            ->get();

        return $estudiantes;
    }

    public function title(): string
    {
        return $this->grado->nombre_del_grado . ' ' . $this->grado->seccion;
    }

    public function headings(): array
    {
        return [
            [mb_strtoupper($this->nombreInst)],
            ['GRADO: ' . $this->grado->nombre_del_grado . ' - SECCIÓN: ' . $this->grado->seccion],
            ['DOCENTE: ' . mb_strtoupper($this->grado->docente)],
            [''],
            [
                'Nro',
                'Apellidos',
                'Nombres',
                'Cédula',
                'Sexo',
                'Fecha Nac.',
                'Lugar Nac.',
                'Dirección',
                'Camisa',
                'Pant.',
                'Zapato',
                'Condición',
                'C. Especial',
                'Representante',
                'C.I. Rep.',
                'Teléfono Rep.',
                'Padre/Madre',
                'C.I. P/M',
                'Teléfono P/M'
            ]
        ];
    }

    public function map($estudiante): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            mb_strtoupper($estudiante->apellido),
            mb_strtoupper($estudiante->name),
            $estudiante->cedula,
            $estudiante->sexo,
            $estudiante->fecha_de_nacimiento,
            $estudiante->lugar_de_nacimiento,
            mb_strtoupper($estudiante->direccion ?? ''),
            $estudiante->talla_de_camisa ?? '',
            $estudiante->talla_de_pantalon ?? '',
            $estudiante->talla_de_zapato ?? '',
            mb_strtoupper($estudiante->condicion ?? ''),
            mb_strtoupper($estudiante->condicion_especial ?? ''),
            mb_strtoupper($estudiante->representante_name ?? ''),
            $estudiante->representante_cedula ?? '',
            $estudiante->representante_telefono ?? '',
            mb_strtoupper($estudiante->padre_name ?? ''),
            $estudiante->padre_cedula ?? '',
            $estudiante->padre_telefono ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();

        return [
            5 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5']
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            1 => ['font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '1E293B']]],
            2 => ['font' => ['bold' => true, 'size' => 12]],
            3 => ['font' => ['bold' => true, 'size' => 12]],
            "A5:S{$lastRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ],
            'A' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'D' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'E' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'I:K' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
        ];
    }
}
