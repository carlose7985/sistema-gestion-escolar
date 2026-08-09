<?php

namespace App\Services;

use App\Models\Estadistica;
use App\Models\AsistenciaEstudiante;
use Carbon\Carbon;

class AsistenciaService
{
    public static function verificarCierreMesAnterior($fechaSeleccionada)
    {
        $fechaOperacion = Carbon::parse($fechaSeleccionada);

        // 1. Identificamos el mes anterior cronológico
        $mesAnterior = $fechaOperacion->copy()->subMonth();

        // 2. BUSQUEDA DE ACTIVIDAD: ¿Hubo alguna asistencia el mes pasado?
        // Revisamos ambas tablas
        $hayAsistenciaEst = AsistenciaEstudiante::whereMonth('fecha', $mesAnterior->month)
            ->whereYear('fecha', $mesAnterior->year)->exists();

        $huboActividadElMesPasado = $hayAsistenciaEst ;

        // 3. BUSQUEDA DE CIERRE: ¿Ya se registró la estadística de ese mes?
        $existeCierre = Estadistica::whereMonth('fecha', $mesAnterior->month)
            ->whereYear('fecha', $mesAnterior->year)
            ->exists();

        // 4. LÓGICA DE BLOQUEO INTELIGENTE:
        // Bloqueamos SOLO si hubo asistencia Y no hay un registro de estadística.
        $bloqueado = false;
        if ($huboActividadElMesPasado && !$existeCierre) {
            $bloqueado = true;
        }

        return [
            'bloqueado' => $bloqueado,
            'mes_nombre' => $mesAnterior->translatedFormat('F'),
            'mes_numero' => $mesAnterior->format('m'),
            'anio' => $mesAnterior->year,
            'fecha_actual_vista' => $fechaOperacion->translatedFormat('F Y'),
            'hubo_actividad' => $huboActividadElMesPasado
        ];
    }
}
