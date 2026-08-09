<?php

namespace App\Helpers;

use App\Models\CierreMensual;

class CierreHelper
{
    public static function tablaVacia()
    {
        return CierreMensual::count() === 0;
    }

    public static function crearPrimerMes($mes, $anio)
    {
        return CierreMensual::create([
            'mes' => $mes,
            'anio' => $anio,
            'estado' => 'Abierto',
            'fecha_cierre' => null,
        ]);
    }

    public static function mesCerrado($mes, $anio)
    {
        $cierre = CierreMensual::where('mes', $mes)->where('anio', $anio)->first();
        return $cierre && $cierre->estado === 'Cerrado';
    }

    public static function mesAbierto($mes, $anio)
    {
        $cierre = CierreMensual::where('mes', $mes)->where('anio', $anio)->first();
        return !$cierre || $cierre->estado === 'Abierto';
    }

    public static function cerrarMes($mes, $anio)
    {
        return CierreMensual::updateOrCreate(
            ['mes' => $mes, 'anio' => $anio],
            ['estado' => 'Cerrado', 'fecha_cierre' => now()]
        );
    }

    public static function abrirMes($mes, $anio)
    {
        return CierreMensual::updateOrCreate(
            ['mes' => $mes, 'anio' => $anio],
            ['estado' => 'Abierto', 'fecha_cierre' => null]
        );
    }
}
