<?php

namespace App\Http\Controllers\GlobalesSearchAndQuist;

use App\Http\Controllers\Controller;
use App\Helpers\PeriodoHelper;
use App\Models\EmpleadoActivo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class QuickStatsController extends Controller
{
    public function index()
    {
        // 1. OBTENER PERÍODO ACTIVO
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return response()->json([
                'grados' => [],
                'empleados' => [],
                'representantes' => ['total' => 0, 'm' => 0, 'f' => 0],
                'especiales' => []
            ]);
        }

        $periodoId = $periodoActivo->id;

        // ============================================================
        // 1. MATRÍCULA ESTUDIANTES (usando estudiante_periodos)
        // ============================================================
        $studentsRaw = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select(
                'grados.nombre_del_grado as grade',
                'grados.seccion as section',
                'estudiantes.sexo',
                DB::raw('count(*) as total')
            )
            ->groupBy('grados.nombre_del_grado', 'grados.seccion', 'estudiantes.sexo')
            ->get();

        $gradosFormatted = $studentsRaw->groupBy('grade')->map(function ($gradeRows, $gradeName) {
            $secciones = $gradeRows->groupBy('section')->map(function ($secRows, $secName) {
                $m = $secRows->filter(fn($r) => in_array($r->sexo, ['M', 'Masculino']))->sum('total');
                $f = $secRows->filter(fn($r) => in_array($r->sexo, ['F', 'Femenino']))->sum('total');
                return ['seccion' => $secName, 'm' => $m, 'f' => $f, 'total' => $m + $f];
            })->sortBy('seccion')->values();

            return [
                'nombre' => $gradeName,
                'secciones' => $secciones,
                'resumen_grado' => [
                    'm' => $secciones->sum('m'),
                    'f' => $secciones->sum('f'),
                    'total' => $secciones->sum('total')
                ]
            ];
        })->sortBy('nombre', SORT_NATURAL)->values();

        // ============================================================
        // 2. EMPLEADOS (sin cambios, tabla empleado_activos)
        // ============================================================
        $employeesRaw = DB::table('empleado_activos')
            ->select('tipo_de_personal', 'sexo', 'status_del_cargo', DB::raw('count(*) as total'))
            ->groupBy('tipo_de_personal', 'sexo', 'status_del_cargo')
            ->get();

        $empleadosFormatted = $employeesRaw->groupBy('tipo_de_personal')->map(function ($group, $type) {
            $calc = function ($sexos) use ($group) {
                $rows = $group->filter(fn($r) => in_array($r->sexo, $sexos));
                $nacional = $rows->filter(fn($r) => stripos($r->status_del_cargo, 'N') === 0 || stripos($r->status_del_cargo, 'nac') !== false)->sum('total');
                $estadal = $rows->filter(fn($r) => stripos($r->status_del_cargo, 'E') === 0 || stripos($r->status_del_cargo, 'est') !== false)->sum('total');
                return ['total' => $rows->sum('total'), 'n' => $nacional, 'e' => $estadal];
            };
            $m = $calc(['M', 'Masculino']);
            $f = $calc(['F', 'Femenino']);
            return ['cargo' => $type, 'm' => $m, 'f' => $f, 'total' => $m['total'] + $f['total']];
        })->values();

        // ============================================================
        // 3. REPRESENTANTES (usando estudiantes + responsable)
        // ============================================================
        $uniqueReps = DB::table('responsables as r')
            ->whereExists(function ($q) use ($periodoId) {
                $q->select(DB::raw(1))
                    ->from('estudiante_periodos as ep')
                    ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
                    ->where('ep.periodo_id', $periodoId)
                    ->where('ep.status', 'Activo')
                    ->where(function ($sub) use ($q) {
                        $sub->whereColumn('e.representante_id', 'r.id')
                            ->orWhereColumn('e.padre_id', 'r.id');
                    });
            })
            ->select('sexo_r', DB::raw('count(*) as total'))
            ->groupBy('sexo_r')
            ->get();

        $mRep = $uniqueReps->where('sexo_r', 'M')->first()->total ?? 0;
        $fRep = $uniqueReps->where('sexo_r', 'F')->first()->total ?? 0;
        $totalRep = $mRep + $fRep;

        // ============================================================
        // 4. ESPECIALES DISCRIMINADOS (usando estudiante_periodos + estudiantes)
        // ============================================================
        $stats = DB::table('estudiante_periodos as ep')
            ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
            ->where('ep.periodo_id', $periodoId)
            ->where('ep.status', 'Activo')
            ->select(DB::raw("
            SUM(CASE WHEN (e.etnia != 'Ninguna' AND e.etnia IS NOT NULL) AND e.sexo IN ('M','Masculino') THEN 1 ELSE 0 END) as etnia_m,
            SUM(CASE WHEN (e.etnia != 'Ninguna' AND e.etnia IS NOT NULL) AND e.sexo IN ('F','Femenino') THEN 1 ELSE 0 END) as etnia_f,
            
            SUM(CASE WHEN ep.condicion = 'Repitiente' AND e.sexo IN ('M','Masculino') THEN 1 ELSE 0 END) as rep_m,
            SUM(CASE WHEN ep.condicion = 'Repitiente' AND e.sexo IN ('F','Femenino') THEN 1 ELSE 0 END) as rep_f,
            
            SUM(CASE WHEN (e.condicion_especial != 'Ninguna' AND e.condicion_especial IS NOT NULL) AND e.sexo IN ('M','Masculino') THEN 1 ELSE 0 END) as ce_m,
            SUM(CASE WHEN (e.condicion_especial != 'Ninguna' AND e.condicion_especial IS NOT NULL) AND e.sexo IN ('F','Femenino') THEN 1 ELSE 0 END) as ce_f,
            
            SUM(CASE WHEN ep.status_escolar = 'No escolarizado' AND e.sexo IN ('M','Masculino') THEN 1 ELSE 0 END) as no_m,
            SUM(CASE WHEN ep.status_escolar = 'No escolarizado' AND e.sexo IN ('F','Femenino') THEN 1 ELSE 0 END) as no_f,

            SUM(CASE WHEN ep.status_escolar = 'Otros' AND e.sexo IN ('M','Masculino') THEN 1 ELSE 0 END) as otros_m,
            SUM(CASE WHEN ep.status_escolar = 'Otros' AND e.sexo IN ('F','Femenino') THEN 1 ELSE 0 END) as otros_f
        "))
            ->first();

        $especialesFormatted = [
            ['categoria' => 'ETNIA', 'm' => $stats->etnia_m ?? 0, 'f' => $stats->etnia_f ?? 0, 'total' => ($stats->etnia_m ?? 0) + ($stats->etnia_f ?? 0)],
            ['categoria' => 'REPITIENTES', 'm' => $stats->rep_m ?? 0, 'f' => $stats->rep_f ?? 0, 'total' => ($stats->rep_m ?? 0) + ($stats->rep_f ?? 0)],
            ['categoria' => 'COND. ESPECIAL', 'm' => $stats->ce_m ?? 0, 'f' => $stats->ce_f ?? 0, 'total' => ($stats->ce_m ?? 0) + ($stats->ce_f ?? 0)],
            ['categoria' => 'NO ESCOLARIZADO', 'm' => $stats->no_m ?? 0, 'f' => $stats->no_f ?? 0, 'total' => ($stats->no_m ?? 0) + ($stats->no_f ?? 0)],
            ['categoria' => 'VUELTA A LA PATRIA', 'm' => $stats->otros_m ?? 0, 'f' => $stats->otros_f ?? 0, 'total' => ($stats->otros_m ?? 0) + ($stats->otros_f ?? 0)],
        ];

        return response()->json([
            'grados' => $gradosFormatted ?? [],
            'empleados' => $empleadosFormatted ?? [],
            'representantes' => [
                'total' => $totalRep,
                'm' => $mRep,
                'f' => $fRep
            ],
            'especiales' => $especialesFormatted
        ]);
    }

    public function birthdays()
    {
        $today = now();
        return response()->json(
            EmpleadoActivo::whereMonth('fecha_de_nacimiento', $today->month)
                ->whereDay('fecha_de_nacimiento', $today->day)
                ->get()
                ->map(fn($e) => [
                    'name' => "{$e->nombres} {$e->apellidos}",
                    'cargo' => $e->tipo_de_personal ?? 'Personal',
                    'initials' => strtoupper(substr($e->nombres, 0, 1) . substr($e->apellidos, 0, 1)),
                    'age' => Carbon::parse($e->fecha_de_nacimiento)->age,
                ])
        );
    }
}
