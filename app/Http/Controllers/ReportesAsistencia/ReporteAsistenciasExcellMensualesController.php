<?php

namespace App\Http\Controllers\ReportesAsistencia;

use App\Exports\ReporteAsistenciaExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReporteAsistenciasExcellMensualesController extends Controller
{
    public function index()
    {
        return Inertia::render('Reportes/ReporteMensualExcell/Index');
    }

    public function generarExcel(Request $request)
    {
        $request->validate([
            'mes' => 'required|integer|between:1,12',
            'anio' => 'required|integer|min:2020',
        ]);

        try {
            return Excel::download(
                new ReporteAsistenciaExport($request->mes, $request->anio),
                "reporte-asistencia-{$request->mes}-{$request->anio}.xlsx"
            );
        } catch (\Exception $e) {
            Log::error('Error al generar Excel: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'message' => 'Error al generar el reporte: ' . $e->getMessage()
            ], 500);
        }
    }

}
