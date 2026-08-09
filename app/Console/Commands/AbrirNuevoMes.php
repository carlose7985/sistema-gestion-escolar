<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Helpers\CierreHelper;
use Carbon\Carbon;

class AbrirNuevoMes extends Command
{
    protected $signature = 'mes:abrir {mes?} {anio?}';
    protected $description = 'Abrir un nuevo mes para operaciones';

    public function handle()
    {
        $mes = $this->argument('mes') ?? now()->month;
        $anio = $this->argument('anio') ?? now()->year;

        // Si el mes ya está cerrado, lo abrimos
        if (CierreHelper::mesCerrado($mes, $anio)) {
            CierreHelper::abrirMes($mes, $anio);
            $this->info("🔓 Mes {$mes}/{$anio} abierto correctamente.");
        } else {
            $this->info("ℹ️ El mes {$mes}/{$anio} ya está abierto.");
        }

        // Cerrar automáticamente el mes anterior
        $mesAnterior = Carbon::createFromDate($anio, $mes, 1)->subMonth();
        if (CierreHelper::mesAbierto($mesAnterior->month, $mesAnterior->year)) {
            CierreHelper::cerrarMes($mesAnterior->month, $mesAnterior->year);
            $this->info("🔒 Mes anterior {$mesAnterior->month}/{$mesAnterior->year} cerrado automáticamente.");
        }

        return 0;
    }
}
