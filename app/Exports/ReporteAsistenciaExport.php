<?php

namespace App\Exports;

use App\Models\Asistenciaempleado;
use App\Models\Asistenciaestudiante;
use Maatwebsite\Excel\Concerns\Exportable;
use App\Exports\Sheets\AsistenciaDocentesSheet;
use App\Exports\Sheets\AsistenciaPersonalSheet;
use App\Exports\Sheets\AsistenciaEstudiantesSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ReporteAsistenciaExport implements WithMultipleSheets
{
    use Exportable;

    protected $mes;
    protected $anio;

    public function __construct($mes, $anio)
    {
        $this->mes = $mes;
        $this->anio = $anio;
    }

    public function sheets(): array
    {
        $sheets = [];

        $sheets[] = new AsistenciaEstudiantesSheet($this->mes, $this->anio);
        $sheets[] = new AsistenciaDocentesSheet($this->mes, $this->anio);
        $sheets[] = new AsistenciaPersonalSheet($this->mes, $this->anio);

        return $sheets;
    }
}
