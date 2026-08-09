<?php

namespace App\Exports;

use App\Models\Grado;
use App\Models\Institucion;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EstudiantesMultiSheetExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        $sheets = [];
        $grados = Grado::orderBy('id', 'asc')->get();
        // Buscamos el nombre de la institución (tomamos el primero de la tabla)
        $inst = Institucion::first();
        $nombreInst = $inst ? $inst->nombre_de_la_institucion : 'INSTITUCIÓN EDUCATIVA';

        foreach ($grados as $grado) {
            $sheets[] = new EstudiantesPerGradeSheet($grado, $nombreInst);
        }

        return $sheets;
    }
}