<?php

namespace App\Http\Controllers\Empleados\EmpleadosRetirados;

use App\Http\Controllers\Controller;
use App\Models\DiaFestivo;
use App\Models\EmpleadoRetirado; // Asegúrate de tener este modelo creado
use App\Models\HistorialAsistencia; // Ajusta al nombre real de tu modelo de marcas
use App\Services\ReportService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EmpleadosRetiradosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $retirados = EmpleadoRetirado::query()
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc') // Los últimos en salir primero
            ->paginate(4)
            ->withQueryString();

        return Inertia::render('Empleados/EmpleadosRetirados/Index', [
            'retirados' => $retirados,
            'filters' => $request->only(['search'])
        ]);
    }
    public function HistorialAsistenciaRetirado(Request $request,int  $id)
    {
        $empleado = EmpleadoRetirado::findOrFail($id);
        $year = $request->year;
        $mesesIds = array_map('intval', explode(',', $request->months));

        // 1. Obtener registros y festivos
        $registrosDB = HistorialAsistencia::where('cedula', $empleado->cedula)
            ->whereYear('fecha_de_asistencia', $year)
            ->whereIn(DB::raw('MONTH(fecha_de_asistencia)'), $mesesIds)
            ->get()
            ->groupBy(fn($d) => Carbon::parse($d->fecha_de_asistencia)->format('m'));

        $festivosArray = DiaFestivo::whereYear('fecha', $year)
            ->whereIn(DB::raw('MONTH(fecha)'), $mesesIds)
            ->pluck('fecha')->map(fn($f) => $f->format('Y-m-d'))->toArray();

        // 2. Construir matriz de datos
        $reporteData = [];
        foreach ($mesesIds as $mes) {
            $fechaInicio = Carbon::createFromDate($year, $mes, 1);
            $periodo = CarbonPeriod::create($fechaInicio->copy()->startOfMonth(), $fechaInicio->copy()->endOfMonth());

            $diasDelMes = [];
            $totales = ['A' => 0, 'F' => 0, 'P' => 0, 'DF' => 0];

            foreach ($periodo as $date) {
                if ($date->isWeekend()) continue; // Saltamos fines de semana

                $fechaStr = $date->format('Y-m-d');
                $mesKey = str_pad($mes, 2, '0', STR_PAD_LEFT);
                $registroDia = isset($registrosDB[$mesKey]) ? $registrosDB[$mesKey]->firstWhere('fecha_de_asistencia', $fechaStr) : null;

                $letra = '-';
                $color = 'text-slate-300';

                if ($registroDia) {
                    $status = trim(strtolower($registroDia->status_de_asistencia));
                    if ($status == 'asistio') {
                        $letra = 'A';
                        $color = 'text-emerald-600 bg-emerald-50';
                        $totales['A']++;
                    } elseif ($status == 'falto') {
                        $letra = 'F';
                        $color = 'text-rose-600 bg-rose-50';
                        $totales['F']++;
                    } elseif ($status == 'permiso') {
                        $letra = 'P';
                        $color = 'text-amber-600 bg-amber-50';
                        $totales['P']++;
                    }
                } else {
                    if (in_array($fechaStr, $festivosArray)) {
                        $letra = 'DF';
                        $color = 'text-purple-600 bg-purple-50 font-black';
                        $totales['DF']++;
                    }
                }

                $diasDelMes[] = [
                    'dia' => $date->format('d'),
                    'letra' => $letra,
                    'clase' => $color
                ];
            }

            $reporteData[] = [
                'nombre_mes' => ucfirst($fechaInicio->locale('es')->monthName),
                'dias' => $diasDelMes,
                'totales' => $totales
            ];
        }

        return Inertia::render('Empleados/EmpleadosRetirados/HistorialDeAsistenciasPdf', [
            'empleado' => $empleado,
            'reporteData' => $reporteData,
            'meta' => ReportService::getMetadata(), // Datos del director y logos
            'year' => $year
        ]);
    }
}
