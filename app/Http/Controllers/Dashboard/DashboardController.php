<?php

namespace App\Http\Controllers\Dashboard;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Matriculainicial;
use App\Models\Movimiento;
use App\Models\TotalEmpleado;
use App\Models\TotalEstudiante;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
   
    public function index()
    {
        Carbon::setLocale("es");
        $hoy = Carbon::today()->toDateString();

        $periodoActivo = PeriodoHelper::getActivo();

        $periodoActual = $periodoActivo->nombre_periodo;
        $periodoStatus = $periodoActivo->status_periodo;

        // $activeStudentsCount = EstudianteActivo::count();
        $activeStudentsCount = $periodoActivo
            ? DB::table('estudiante_periodos')
            ->where('periodo_id', $periodoActivo->id)
            ->whereIn('status', ['Activo','Aprobado','Reprobado'])
            ->count()
            : 0;


        $matriculaInicial = Matriculainicial::where('periodo_escolar', $periodoActual)->sum('total_general');

        $retiredStudentsCount = Movimiento::where('status', 'Retirado')
            ->where('periodo_id', $periodoActivo->id)
            ->count();

        $newStudentsCount = Movimiento::where('status', 'Nuevo Ingreso')
            ->where('periodo_id', $periodoActivo->id)
            ->count();

        // 1. Estudiantes: Suma total por sexo de hoy
        $resumenEstudiantes = TotalEstudiante::whereDate('fecha_registro', $hoy)
            ->selectRaw('SUM(varones_asistentes) as varones, SUM(hembras_asistentes) as hembras, SUM(total_asistentes) as total')
            ->first();

        // 2. Empleados: Desglose por Cargo (tipo_de_personal) de hoy
        $asistenciaCargos = TotalEmpleado::whereDate('fecha_registro', $hoy)
            ->select('tipo_de_personal')
            ->selectRaw('SUM(varones_asistentes) as varones, SUM(hembras_asistentes) as hembras, SUM(total_asistentes) as total')
            ->groupBy('tipo_de_personal')
            ->get();

        // 3. Totales Globales de Empleados
        $empleadosGlobal = [
            'varones' => $asistenciaCargos->sum('varones'),
            'hembras' => $asistenciaCargos->sum('hembras'),
            'total'   => $asistenciaCargos->sum('total'),
        ];

        $hayReporte = ($resumenEstudiantes->total > 0 || $empleadosGlobal['total'] > 0);

        return Inertia::render('Dashboard/Index', [
            'periodoEscolar'      => $periodoActual,
            'activeStudentsCount' => $activeStudentsCount,
            'retiredStudentsCount' => $retiredStudentsCount,
            'periodoStatus'       => $periodoStatus,
            'newStudentsCount'    => $newStudentsCount,
            'matriculaInicial'    => (int)$matriculaInicial,
            'reporteGlobal' => [
                'hayReporte'  => $hayReporte,
                'estudiantes' => [
                    'total'   => (int)$resumenEstudiantes->total,
                    'varones' => (int)$resumenEstudiantes->varones,
                    'hembras' => (int)$resumenEstudiantes->hembras,
                ],
                'personal' => [
                    'total'   => (int)$empleadosGlobal['total'],
                    'varones' => (int)$empleadosGlobal['varones'],
                    'hembras' => (int)$empleadosGlobal['hembras'],
                    'desglose' => $asistenciaCargos // Aquí van Docentes, Obreros, etc.
                ],
                'fecha' => Carbon::today()->translatedFormat('d \d\e F')
            ]
        ]);
    }
}
