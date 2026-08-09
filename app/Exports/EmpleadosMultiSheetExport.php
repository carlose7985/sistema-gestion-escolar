<?php

namespace App\Exports;

use App\Models\Cargo;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EmpleadosMultiSheetExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        $cargos = Cargo::all();
        $sheets = [];

        // 1. Agregamos las pestañas por cada Cargo de la tabla cargos
        foreach ($cargos as $cargo) {
            // Pasamos "false" en el segundo parámetro (es el valor por defecto)
            $sheets[] = new EmpleadoSheet($cargo->nombre_del_cargo, false);
        }

        // 2. Agregamos la pestaña especial al final de la lista (a la derecha)
        // El nombre será "AllVigilants" y pasamos "true" para activar el filtro de Vigilantes
        $sheets[] = new EmpleadoSheet('AllVigilants', true);

        return $sheets;
    }
}
