<?php

namespace App\Http\Controllers\Estudiantes\AprobarReprobar;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Apreciacion;
use App\Models\FechaEntregaDocumento;
use App\Models\Grado;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AprobarReprobarEstudiantesController extends Controller
{
    public function index()
    {
        // ============================================================
        // VALIDACIÓN: Solo permitir en junio a partir del día 10
        // ============================================================
        $fechaActual = now();
        $mes = (int) $fechaActual->month;
        $dia = (int) $fechaActual->day;

        if ($mes !== 6 || $dia < 10) {
            return redirect()->back()
                ->with('error', '⚠️ El módulo de calificaciones solo está disponible a partir del 10 de junio.');
        }
        // ============================================================
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No existe un período escolar activo.');
        }

        $periodoId = $periodoActivo->id;
        // ============================================================
        // VALIDACIÓN: Verificar el campo 'inscribe' en el período activo
        // ============================================================
        if (isset($periodoActivo->inscribe) && $periodoActivo->inscribe !== 'No') {
            $periodoActivo->update([
                'inscribe' => 'No'
            ]);
            // Recargar el período para obtener el valor actualizado
            $periodoActivo = PeriodoHelper::getActivo();
        }
        // ============================================================
        // 3. Obtener grados con conteos usando estudiante_periodos (solo período activo)
        $grades = Grado::withCount([
            // Contar TODOS los estudiantes del período activo (Activo + Aprobado + Reprobado)
            'estudiantePeriodos as total_students' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado']);
            },
            'estudiantePeriodos as male_students' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado'])
                    ->whereHas('estudiante', function ($sub) {
                        $sub->where('sexo', 'M');
                    });
            },
            'estudiantePeriodos as female_students' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado'])
                    ->whereHas('estudiante', function ($sub) {
                        $sub->where('sexo', 'F');
                    });
            },
            'estudiantePeriodos as aprobados_count' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->where('status', 'Aprobado');
            },
            'estudiantePeriodos as reprobados_count' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->where('status', 'Reprobado');
            },
        ])->get()->map(function ($grado) {
            $totalStudents = (int) $grado->total_students;
            $aprobados = (int) $grado->aprobados_count;
            $reprobados = (int) $grado->reprobados_count;
            $calificadosCount = $aprobados + $reprobados;

            // Un grado está calificado si:
            // 1. TIENE estudiantes totales en el período (total > 0)
            // 2. Y TODOS los estudiantes tienen status Aprobado o Reprobado
            $isCalificado = ($totalStudents > 0 && $totalStudents === $calificadosCount);

            return [
                'id' => $grado->id,
                'nombre_del_grado' => $grado->nombre_del_grado,
                'seccion' => $grado->seccion,
                'total_students' => $totalStudents,
                'male_students' => (int) $grado->male_students,
                'female_students' => (int) $grado->female_students,
                'aprobados' => $aprobados,
                'reprobados' => $reprobados,
                'calificados' => $calificadosCount,
                'is_calificado' => $isCalificado,
            ];
        });

        return Inertia::render('Estudiantes/AprobarReprobar/Index', [
            'grades' => $grades,
            'periodo_escolar' => $periodoActivo->nombre_periodo,
            'periodo_id' => $periodoId,
            'status_periodo' => $periodoActivo->status_periodo,
        ]);
    }

    public function show(Request $request, int $grado_id)
    {
        // 1. Buscar el grado
        $grado = Grado::findOrFail($grado_id);

        // 🔥 Obtener SOLO apreciaciones APROBADAS para el selector
        $apreciacionesAprobadas = Apreciacion::where('status', 'Aprobado')
            ->orderBy('literal')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'literal' => $item->literal,
                    'numeral' => $item->numeral,
                    'nombre_completo' => $item->numeral ? $item->literal . '-' . $item->numeral : $item->literal,
                    'status' => $item->status,
                ];
            });

        // 🔥 Obtener SOLO apreciaciones REPROBADAS para el selector
        $apreciacionesReprobadas = Apreciacion::where('status', 'Reprobado')
            ->orderBy('literal')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'literal' => $item->literal,
                    'numeral' => $item->numeral,
                    'nombre_completo' => $item->numeral ? $item->literal . '-' . $item->numeral : $item->literal,
                    'status' => $item->status,
                ];
            });

        // 🔥 Combinar ambas listas (Aprobados primero, luego Reprobados)
        $apreciaciones = $apreciacionesAprobadas->concat($apreciacionesReprobadas);

        // 2. Obtener períodos
        $periodoActivo = PeriodoHelper::getActivo();
        $periodoPasado = PeriodoHelper::getInactivo();


        $periodoPasadoId = $periodoActivo->id;

        // 3. Verificar fecha de entrega
        $fechaEntregaDocumentos = FechaEntregaDocumento::where('periodo_escolar', $periodoActivo->nombre_periodo)->first();

        $viewPath = 'Estudiantes/AprobarReprobar/Show';

        if (!$fechaEntregaDocumentos) {
            return Inertia::render($viewPath, [
                'grado' => $grado,
                'estudiantes' => [],
                'apreciaciones' => $apreciaciones,
                'showFechaModal' => true,
                'periodoEscolarActual' => $periodoActivo->nombre_periodo,
                'previousGradeId' => null,
                'nextGradeId' => null,
            ]);
        }

        // 4. Contar estudiantes ACTIVOS en el período PASADO
        $totalEstudiantes = DB::table('estudiante_periodos')
            ->where('periodo_id', $periodoPasadoId)
            ->where('grado_id', $grado->id)
            ->where('status', 'Activo')
            ->count();

        // 5. Contar estudiantes ya CALIFICADOS
        $calificadosCount = DB::table('estudiante_periodos')
            ->where('periodo_id', $periodoPasadoId)
            ->where('grado_id', $grado->id)
            ->whereIn('status', ['Aprobado', 'Reprobado'])
            ->count();

        // 6. Verificar si ya están todos calificados
        if ($totalEstudiantes > 0 && $totalEstudiantes === $calificadosCount) {
            return redirect()->route('aprobar-reprobar-estudiantes.index')
                ->with('error', "La sección {$grado->nombre_del_grado} - {$grado->seccion} ya fue evaluada.");
        }

        // 7. Cargar estudiantes ACTIVOS
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoPasadoId)
            ->where('estudiante_periodos.grado_id', $grado->id)
            ->where('estudiante_periodos.status', 'Activo')
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.documento',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                DB::raw("CONCAT(estudiante_periodos.estudiante_id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as periodo_estudiante_id"),
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.contador_impresiones',
                'estudiante_periodos.actualizado'
            )
            ->orderBy('estudiantes.sexo', 'asc')
            ->orderBy('estudiantes.name', 'asc')
            ->get();

        // 8. Navegación
        $previousGradeId = Grado::where('id', '<', $grado->id)->orderBy('id', 'desc')->value('id');
        $nextGradeId = Grado::where('id', '>', $grado->id)->orderBy('id', 'asc')->value('id');

        return Inertia::render($viewPath, [
            'grado' => $grado,
            'estudiantes' => $estudiantes,
            'apreciaciones' => $apreciaciones,
            'previousGradeId' => $previousGradeId,
            'nextGradeId' => $nextGradeId,
            'showFechaModal' => false,
            'periodoEscolarActual' => $periodoPasado->nombre_periodo,
            'periodo_pasado_id' => $periodoPasadoId,
        ]);
    }

    public function store(Request $request)
    {
        $fechaActual = Carbon::now()->format('Y-m-d');

        // ============================================================
        // CAMBIO: Usar período ACTIVO en lugar de INACTIVO
        // ============================================================
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No se ha definido un período activo.');
        }

        $periodoActivoId = $periodoActivo->id;
        $gradoId = $request->input('grado_id');

        foreach ($request->input('resultados') as $data) {
            $estudianteId = $data['estudiante_id'];
            $estado = $data['estado'];
            $apreciacion = $data['apreciacion'];

            // ============================================================
            // DETERMINAR STATUS Y CONDICIÓN SEGÚN APRECIACION
            // ============================================================
            if ($apreciacion === 'Inasistente') {
                // Si es Inasistente → Retirado / Proceso Administrativo
                $status = 'Retirado';
                $statusEscolar = 'Proceso Administrativo';
                $condicion = 'Repitiente';
                $calificado = 'Si';
            } else {
                // Si es Aprobado o Reprobado normal
                $status = $estado; // 'Aprobado' o 'Reprobado'
                $statusEscolar = $estado;
                $condicion = $estado === 'Aprobado' ? 'Regular' : 'Repitiente';
                $calificado = 'Si';
            }
            // ============================================================

            // ============================================================
            // ACTUALIZAR CON CLAVE COMPUESTA EN PERÍODO ACTIVO
            // ============================================================
            $actualizado = DB::table('estudiante_periodos')
                ->where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoActivoId)
                ->where('grado_id', $gradoId)
                ->update([
                    'status' => $status,
                    'status_escolar' => $statusEscolar,
                    'condicion' => $condicion,
                    'apreciacion' => $apreciacion,
                    'calificado' => $calificado,
                    'actualizado' => 'No',
                    'contador_impresiones' => 0,
                    'fecha_registro' => $fechaActual,
                    'updated_at' => now(),
                ]);
            // ============================================================

            // Si no se actualizó, significa que el registro no existe
            if ($actualizado === 0) {
                Log::warning("No se encontró registro para estudiante {$estudianteId} en período {$periodoActivoId} y grado {$gradoId}");
            }
        }

        return redirect()->route('estudiantes.activos.aprobar.reprobar.index')
            ->with('success', 'Resultados registrados correctamente.');
    }
}
