<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Helpers\CierreHelper;

class CerrarMes extends Command
{
    protected $signature = 'cierre:mes {mes} {anio}';
    protected $description = 'Cerrar un mes específico';

    public function handle()
    {
        $mes = $this->argument('mes');
        $anio = $this->argument('anio');

        if (CierreHelper::mesCerrado($mes, $anio)) {
            $this->error("El mes {$mes}/{$anio} ya está cerrado.");
            return 1;
        }

        CierreHelper::cerrarMes($mes, $anio);
        $this->info("✅ Mes {$mes}/{$anio} cerrado correctamente.");
        return 0;
    }
}
