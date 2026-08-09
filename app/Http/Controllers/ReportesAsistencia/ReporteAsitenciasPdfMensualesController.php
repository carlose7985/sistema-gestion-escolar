<?php

namespace App\Http\Controllers\ReportesAsistencia;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReporteAsitenciasPdfMensualesController extends Controller
{
    public function index(Request $request)
    {
        // Obtener todos los cargos activos
        $cargos = Cargo::orderBy('id')
            ->get(['id', 'nombre_del_cargo']);

        // Meses en español
        $meses = [
            ['val' => '01', 'label' => 'Enero'],
            ['val' => '02', 'label' => 'Febrero'],
            ['val' => '03', 'label' => 'Marzo'],
            ['val' => '04', 'label' => 'Abril'],
            ['val' => '05', 'label' => 'Mayo'],
            ['val' => '06', 'label' => 'Junio'],
            ['val' => '07', 'label' => 'Julio'],
            ['val' => '08', 'label' => 'Agosto'],
            ['val' => '09', 'label' => 'Septiembre'],
            ['val' => '10', 'label' => 'Octubre'],
            ['val' => '11', 'label' => 'Noviembre'],
            ['val' => '12', 'label' => 'Diciembre'],
        ];

        // Años disponibles (desde 2024 hasta el actual)
        $anios = range(2024, now()->year);

        return Inertia::render('Reportes/ReporteMensualPdf/Index', [
            'cargos' => $cargos,
            'meses' => $meses,
            'anios' => $anios,
            'filters' => [
                'cargoId' => $request->input('cargoId', ''),
                'month' => $request->input('month', now()->format('m')),
                'year' => $request->input('year', now()->year),
            ]
        ]);
    }
}
