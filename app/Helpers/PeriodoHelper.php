<?php

namespace App\Helpers;

use App\Models\PeriodoEscolar;

class PeriodoHelper
{
    /**
     * Obtiene el período escolar actual de trabajo.
     */
    public static function getActivo(): ?PeriodoEscolar
    {
        return PeriodoEscolar::where('status', 'Activo')->first();
    }

    /**
     * Obtiene el período escolar inmediatamente anterior.
     */
    public static function getInactivo(): ?PeriodoEscolar
    {
        return PeriodoEscolar::where('status', 'Inactivo')->first();
    }

    /**
     * Obtiene el ID del período activo de forma directa.
     */
    public static function getActivoId(): ?int
    {
        return self::getActivo()?->id;
    }

    /**
     * Obtiene el nombre del período activo de forma directa.
     */
    public static function getActivoNombrePeriodo(): ?string
    {
        return self::getActivo()?->nombre_periodo;
    }

    /**
     * Obtiene el status_periodo del período activo de forma directa.
     */
    public static function getActivoStatusPeriodo(): ?string
    {
        return self::getActivo()?->status_periodo;
    }

    /**
     * Obtiene el status del período activo de forma directa.
     */
    public static function getActivoStatus(): ?string
    {
        return self::getActivo()?->status;
    }

    /**
     * Obtiene el ID del período inactivo (anterior).
     */
    public static function getInactivoId(): ?int
    {
        return self::getInactivo()?->id;
    }

    /**
     * Obtiene el nombre del período inactivo de forma directa.
     */
    public static function getInactivoNombrePeriodo(): ?string
    {
        return self::getInactivo()?->nombre_periodo;
    }

    /**
     * Obtiene el status_periodo del período inactivo de forma directa.
     */
    public static function getInactivoStatusPeriodo(): ?string
    {
        return self::getInactivo()?->status_periodo;
    }

    /**
     * Obtiene el status del período inactivo de forma directa.
     */
    public static function getInactivoStatus(): ?string
    {
        return self::getInactivo()?->status;
    }

    /**
     * Obtiene los períodos históricos/finalizados.
     */
    public static function getFinalizados()
    {
        return PeriodoEscolar::where('status', 'Finalizado')->get();
    }
}
