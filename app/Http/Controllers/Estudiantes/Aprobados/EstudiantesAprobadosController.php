<?php

namespace App\Http\Controllers\Estudiantes\Aprobados;

use App\Http\Controllers\Controller;
use App\Helpers\PeriodoHelper;
use App\Models\Apreciacion;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\FechaEntregaDocumento;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstudiantesAprobadosController extends Controller
{


    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $grade  = $request->get('grade', '');
        $periodoSeleccionado = $request->get('periodo_id');

        // ============================================================
        // DETERMINAR PERÍODO A MOSTRAR
        // ============================================================
        if ($periodoSeleccionado) {
            // Si hay un período seleccionado, usarlo
            $periodo = PeriodoEscolar::find($periodoSeleccionado);
            if (!$periodo) {
                return redirect()->back()->with('error', 'Período no encontrado.');
            }
            $periodo_id = $periodo->id;
            $periodoActivo = PeriodoHelper::getActivo();
        } else {
            // Si NO hay selección, buscar el período adecuado
            $periodoActivo = PeriodoHelper::getActivo();

            if ($periodoActivo) {
                // Verificar si el período activo tiene aprobados/graduados
                $tieneAprobados = EstudiantePeriodo::where('periodo_id', $periodoActivo->id)
                    ->whereIn('status', ['Aprobado', 'Graduado'])
                    ->exists();

                if ($tieneAprobados) {
                    // Si el activo tiene aprobados, usarlo
                    $periodo_id = $periodoActivo->id;
                    $periodo = $periodoActivo;
                } else {
                    // Si el activo NO tiene aprobados, buscar el último período que sí tenga
                    $ultimoConAprobados = EstudiantePeriodo::whereIn('status', ['Aprobado', 'Graduado'])
                        ->select('periodo_id')
                        ->groupBy('periodo_id')
                        ->orderBy('periodo_id', 'desc')
                        ->first();

                    if ($ultimoConAprobados) {
                        $periodo = PeriodoEscolar::find($ultimoConAprobados->periodo_id);
                        $periodo_id = $periodo->id;
                    } else {
                        // Si no hay ningún período con aprobados, usar el activo (vacío)
                        $periodo_id = $periodoActivo->id;
                        $periodo = $periodoActivo;
                    }
                }
            } else {
                // Si no hay activo, buscar el último período con aprobados
                $ultimoConAprobados = EstudiantePeriodo::whereIn('status', ['Aprobado', 'Graduado'])
                    ->select('periodo_id')
                    ->groupBy('periodo_id')
                    ->orderBy('periodo_id', 'desc')
                    ->first();

                if ($ultimoConAprobados) {
                    $periodo = PeriodoEscolar::find($ultimoConAprobados->periodo_id);
                    $periodo_id = $periodo->id;
                } else {
                    return redirect()->back()->with('error', 'No hay períodos con estudiantes aprobados.');
                }
            }
        }
        // ============================================================

        $apreciacionesAprobadas  = Apreciacion::aprobados()->get();
        $apreciacionesReprobadas = Apreciacion::reprobados()->get();

        // 1. Obtener TODOS los períodos disponibles para el selector
        $periodosDisponibles = PeriodoEscolar::orderBy('id', 'desc')
            ->get(['id', 'nombre_periodo']);

        // 2. Consulta principal - del período seleccionado
        $query = EstudiantePeriodo::query()
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Graduado'])
            ->where('estudiante_periodos.periodo_id', $periodo_id)
            ->select(
                'estudiantes.id as estudiante_id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                'estudiante_periodos.estudiante_id',
                'estudiante_periodos.periodo_id',
                'estudiante_periodos.grado_id',
                'estudiante_periodos.status',
                'estudiante_periodos.status_escolar',
                'estudiante_periodos.condicion',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.fecha_registro',
                'estudiante_periodos.contador_impresiones as actualizado',
                'grados.nombre_del_grado',
                'grados.seccion',
                'periodo_escolars.nombre_periodo as nombre_periodo',
                DB::raw("CONCAT(estudiante_periodos.estudiante_id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as periodo_estudiante_id")
            );

        // Filtro por grado
        if ($grade && $grade !== 'global') {
            $query->where('estudiante_periodos.grado_id', $grade);
        }

        // Filtro de búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estudiantes.name', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.apellido', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.cedula', 'LIKE', "%{$search}%");
            });
        }

        // 3. Totales
        $totalQuery = clone $query;
        $totales = [
            'general'   => (clone $totalQuery)->count(),
            'masculino' => (clone $totalQuery)->where('estudiantes.sexo', 'M')->count(),
            'femenino'  => (clone $totalQuery)->where('estudiantes.sexo', 'F')->count(),
        ];

        // 4. Paginación
        $estudiantes = $query->orderBy('grados.nombre_del_grado', 'asc')
            ->orderBy('estudiantes.name', 'asc')
            ->paginate(50)
            ->withQueryString();

        // 5. Grados disponibles con conteos - del período seleccionado
        $grados = Grado::withCount(['estudiantePeriodos' => function ($q) use ($periodo_id) {
            $q->whereIn('status', ['Aprobado', 'Graduado']);
            $q->where('periodo_id', $periodo_id);
        }])->get()->map(function ($grado) {
            return [
                'id'               => $grado->id,
                'nombre_del_grado' => $grado->nombre_del_grado,
                'seccion'          => $grado->seccion,
                'student_count'    => $grado->estudiante_periodos_count,
            ];
        });

        // 6. Fecha de entrega de documentos
        $fecha_entrega = FechaEntregaDocumento::first();
        $fechaFormateada = $fecha_entrega ? Carbon::parse($fecha_entrega->fecha)->format('d-m-Y') : 'No configurada';

        // 7. Conteo de pendientes para promoción masiva - del período seleccionado
        $pendingPromotionCount = EstudiantePeriodo::whereIn('status', ['Aprobado', 'Graduado'])
            ->where('periodo_id', $periodo_id)
            ->count();

        // 8. Datos agregados para la tabla de matrícula
        $aggregatedAprobadosData = $this->getAggregatedAprobadosData($periodo_id);

        // 9. Verificar estudiantes activos en el período activo (para el botón de inscripción)
        $periodoActivo = PeriodoHelper::getActivo();
        $tieneEstudiantesActivos = false;
        if ($periodoActivo) {
            $tieneEstudiantesActivos = EstudiantePeriodo::where('periodo_id', $periodoActivo->id)
                ->where('status', 'Activo')
                ->exists();
        }

        // Estado del proceso de inscripción
        $estadoInscripcion = $periodoActivo ? $periodoActivo->status_periodo : 'Cerrado';

        return Inertia::render('Estudiantes/EstudiantesAprobados/Index', [
            'datos'                   => $estudiantes,
            'grades'                  => $grados,
            'totals'                  => $totales,
            'pendingPromotionCount'   => $pendingPromotionCount,
            'fechaFormateada'         => $fechaFormateada,
            'periodosDisponibles'     => $periodosDisponibles,
            'apreciacionesAprobadas'  => $apreciacionesAprobadas,
            'apreciacionesReprobadas' => $apreciacionesReprobadas,
            'aggregatedAprobadosData' => $aggregatedAprobadosData,
            'tieneEstudiantesActivos' => $tieneEstudiantesActivos,
            'proceso_de_inscripcion'  => $estadoInscripcion,
            'periodo_escolar'         => $estadoInscripcion,
            'periodo_seleccionado'    => $periodo,
            'desde_activo' => $request->boolean('desde_activo'),
            'grado_retorno' => $request->input('grado_retorno'),
            'periodo_actual_id'       => $periodoActivo ? $periodoActivo->id : null,
            'filters' => [
                'search'     => $search,
                'grade'      => $grade,
                'periodo_id' => $periodo_id,
            ],
        ]);
    }



    private function getAggregatedAprobadosData($periodo_id = null)
    {
        // Si no se especifica un período, obtener el activo por defecto
        if (!$periodo_id) {
            $periodoActivo = PeriodoHelper::getActivo();
            $periodo_id    = $periodoActivo ? $periodoActivo->id : null;
        }

        $query = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Graduado']);
        // ->where('estudiante_periodos.status_escolar', '!=', 'Graduado'); // 🔥 CORREGIDO

        if ($periodo_id) {
            $query->where('estudiante_periodos.periodo_id', $periodo_id);
        }

        return $query->select(
            'grados.nombre_del_grado as grado',
            'grados.seccion',
            DB::raw("SUM(CASE WHEN estudiantes.sexo = 'M' THEN 1 ELSE 0 END) as hombresAprobados"),
            DB::raw("SUM(CASE WHEN estudiantes.sexo = 'F' THEN 1 ELSE 0 END) as mujeresAprobadas"),
            DB::raw("COUNT(*) as totalAprobados")
        )
            ->groupBy('grados.id', 'grados.nombre_del_grado', 'grados.seccion')
            ->orderBy('grados.nombre_del_grado')
            ->orderBy('grados.seccion')
            ->get()
            ->map(function ($item) {
                return [
                    'grado'            => $item->grado,
                    'seccion'          => $item->seccion,
                    'hombresAprobados' => (int) $item->hombresAprobados,
                    'mujeresAprobadas' => (int) $item->mujeresAprobadas,
                    'totalAprobados'   => (int) $item->totalAprobados,
                ];
            })
            ->toArray();
    }

    public function update(Request $request, string $periodoEstudianteId)
    {
        try {
            // Parsear la clave compuesta
            $ids = explode('-', $periodoEstudianteId);
            $estudianteId = (int)$ids[0];
            $periodoId = (int)$ids[1];
            $gradoId = (int)$ids[2];

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'cedula' => 'required|string|max:11',
                'apreciacion' => 'required|string|max:255',
            ]);

            // Actualizar estudiante en tabla estudiantes
            $estudiante = Estudiante::findOrFail($estudianteId);
            $estudiante->update([
                'name' => $validated['name'],
                'apellido' => $validated['apellido'],
                'cedula' => $validated['cedula'],
            ]);

            // Actualizar apreciación en estudiante_periodos
            EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->update([
                    'apreciacion' => $validated['apreciacion'],
                ]);

            return redirect()->back()->with('success', 'Estudiante actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar: ' . $e->getMessage());
        }
    }

    public function reprobar(Request $request, string $periodoEstudianteId)
    {
        try {
            $ids = explode('-', $periodoEstudianteId);

            if (count($ids) !== 3) {
                return redirect()->back()->with('error', 'El formato del identificador es inválido.');
            }

            $estudianteId = (int) $ids[0];
            $periodoId    = (int) $ids[1];
            $gradoId      = (int) $ids[2];

            $validatedData = $request->validate([
                'apreciacion' => ['required', 'string'],
            ]);

            // Validación del Período Activo y su Estado
            $periodoEscolarActual = PeriodoHelper::getActivo();

            if (!$periodoEscolarActual || $periodoEscolarActual->status_periodo !== 'Abierto') {
                return redirect()->back()
                    ->with('error', 'Proceso de inscripción Cerrado. No se pueden realizar movimientos.');
            }

            $registroAprobado = EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->where('status', 'Aprobado')
                ->first();

            if (!$registroAprobado) {
                return redirect()->back()->with('error', 'Registro no encontrado.');
            }

            DB::transaction(function () use ($estudianteId, $periodoId, $gradoId, $validatedData) {
                EstudiantePeriodo::where('estudiante_id', $estudianteId)
                    ->where('periodo_id', $periodoId)
                    ->where('grado_id', $gradoId)
                    ->update([
                        'status'      => 'Reprobado',
                        'apreciacion' => $validatedData['apreciacion'],
                    ]);
            });

            return redirect()->back()->with('success', 'Estudiante movido a Reprobados correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al reprobar: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request, string $periodoEstudianteId)
    {
        try {
            // Parsear la clave compuesta
            $ids = explode('-', $periodoEstudianteId);

            if (count($ids) !== 3) {
                return redirect()->back()->with('error', 'ID de estudiante período inválido.');
            }

            $estudianteId = (int) $ids[0];
            $periodoId    = (int) $ids[1];
            $gradoId      = (int) $ids[2];

            // 1. Validar el estado del proceso de inscripción en el período activo
            $periodoEscolarActual = PeriodoHelper::getActivo();

            if (!$periodoEscolarActual || $periodoEscolarActual->status_periodo !== 'Abierto') {
                return redirect()->back()
                    ->with('error', 'Proceso de inscripción Cerrado. No se pueden realizar movimientos.');
            }

            // 2. Validar motivo del retiro
            $request->validate([
                'status_escolar' => 'required|string|max:255',
            ]);

            // 3. Buscar el registro usando el helper del Modelo
            $registroAprobado = EstudiantePeriodo::findByCompositeKey($estudianteId, $periodoId, $gradoId);

            if (!$registroAprobado) {
                return redirect()->back()->with('error', 'Registro no encontrado.');
            }

            // 4. Verificar que el registro esté en estado Aprobado
            if ($registroAprobado->status !== 'Aprobado') {
                return redirect()->back()->with('error', 'Este estudiante no está en estado Aprobado.');
            }

            // 5. Verificar que no tenga grado asignado
            if ($registroAprobado->status_escolar === 'Grado Asignado') {
                return redirect()->back()->with('error', 'Este estudiante ya tiene un grado asignado. No se puede retirar.');
            }

            // 6. INICIAR TRANSACCIÓN ATÓMICA
            DB::transaction(function () use ($registroAprobado, $request, $estudianteId, $periodoId, $gradoId, $periodoEstudianteId) {
                // 6.1 ACTUALIZACIÓN SEGURA: Usar Query Builder filtrando explícitamente los 3 IDs
                EstudiantePeriodo::where('estudiante_id', $estudianteId)
                    ->where('periodo_id', $periodoId)
                    ->where('grado_id', $gradoId)
                    ->update([
                        'status'          => 'Retirado',
                        'status_escolar'  => $request->status_escolar,
                        'matricula_sisge' => 'No',
                    ]);

                // 6.2 Obtener los modelos relacionados para el payload
                $estudiante = Estudiante::find($estudianteId);
                $periodo    = PeriodoEscolar::find($periodoId);

                // 6.3 Preparar la información del estudiante retirado para la sesión
                $estudianteData = [
                    'id'                    => $registroAprobado->id ?? null,
                    'estudiante_id'         => $estudianteId,
                    'periodo_id'            => $periodoId,
                    'grado_id'              => $gradoId,
                    'name'                  => $estudiante?->name,
                    'apellido'              => $estudiante?->apellido,
                    'cedula'                => $estudiante?->cedula,
                    'sexo'                  => $estudiante?->sexo,
                    'fecha_de_nacimiento'   => $estudiante?->fecha_de_nacimiento,
                    'age'                   => $estudiante?->fecha_de_nacimiento ? Carbon::parse($estudiante->fecha_de_nacimiento)->age : null,
                    'actualizado'           => $registroAprobado->actualizado ?? 'No',
                    'status_escolar'        => $request->status_escolar,
                    'periodo_estudiante_id' => $periodoEstudianteId,
                    'periodo_escolar'       => $periodo?->nombre_periodo ?? '', // 🔥 Actualizado a nombre_periodo
                ];

                // Guardar en sesión flash para que React levante la constancia
                session()->flash('estudiante_retirado', $estudianteData);
            });

            return redirect()->back()->with('success', 'Estudiante retirado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al retirar: ' . $e->getMessage());
        }
    }
}
