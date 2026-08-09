<?php

namespace App\Http\Controllers\Estudiantes\EstudiantesPorGrado;

use App\Http\Controllers\Controller;
use App\Helpers\PeriodoHelper;
use App\Http\Requests\StoreResponsableRequest;
use App\Http\Requests\UpdateEstudiantesRequest;
use App\Models\Apreciacion;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\Movimiento;
use App\Models\PeriodoEscolar;
use App\Models\Responsable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstudiantesPorGradoController extends Controller
{

    public function index()
    {
        // 1. Obtener el período ACTIVO
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No existe un período escolar activo.');
        }

        $periodoId = $periodoActivo->id;

        // ============================================================
        // 2. Contar promociones pendientes (del período INACTIVO)
        // ============================================================
        $periodoInactivo = PeriodoHelper::getInactivo();
        $pendingPromotionCount = 0;

        if ($periodoInactivo) {
            $periodoInactivoId = $periodoInactivo->id;

            $pendingPromotionCount = EstudiantePeriodo::where('periodo_id', $periodoInactivoId)
                ->where(function ($query) {
                    // REGLA 1: Aprobados que NO sean de 6to Grado
                    $query->where(function ($qAprobados) {
                        $qAprobados->where('status', 'Aprobado')
                            ->whereHas('grado', function ($qGrado) {
                                $qGrado->whereNotIn('nombre_del_grado', ['6to Grado']);
                            });
                    })
                        // REGLA 2: Reprobados cuya condición NO sea "Inasistente"
                        ->orWhere(function ($qReprobados) {
                            $qReprobados->where('status', 'Reprobado')
                                ->where(function ($qCond) {
                                    $qCond->whereNull('apreciacion')
                                        ->orWhere('apreciacion', '!=', 'Inasistente');
                                });
                        });
                })
                ->count();
        }
        // ============================================================

        // 3. Obtener grados con conteos de estudiantes (del período ACTIVO)
        $grades = Grado::withCount([
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
            }
        ])
            ->having('total_students', '>', 0)
            ->orderBy('nombre_del_grado')
            ->orderBy('seccion')
            ->get();

        $apreciaciones = Apreciacion::orderBy('id', 'asc')->get();

        return Inertia::render("Estudiantes/EstudiantesPorGrado/Index", [
            'grades'                => $grades,
            'apreciaciones'         => $apreciaciones,
            'pendingPromotionCount' => $pendingPromotionCount,
            'periodo_actual'        => $periodoActivo->nombre_periodo,
        ]);
    }


    /**
     * Búsqueda global de estudiantes en el período activo
     */
    public function globalSearch(Request $request)
    {
        $query = trim($request->get('query', ''));

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // 1. Obtener ID del período activo mediante el Helper
        $periodoId = PeriodoHelper::getActivoId();

        if (!$periodoId) {
            return response()->json([]);
        }

        // 2. Realizar la consulta directa con DB::table para optimizar velocidad y evitar conflictos de modelos Eloquent
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where(function ($q) use ($query) {
                $q->where('estudiantes.name', 'LIKE', "%{$query}%")
                    ->orWhere('estudiantes.apellido', 'LIKE', "%{$query}%")
                    ->orWhere('estudiantes.cedula', 'LIKE', "%{$query}%")
                    // Permite buscar "Nombre Apellido" en un solo término
                    ->orWhere(DB::raw("CONCAT(estudiantes.name, ' ', estudiantes.apellido)"), 'LIKE', "%{$query}%");
            })
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiante_periodos.grado_id',
                'grados.nombre_del_grado',
                'grados.seccion'
            )
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id'       => $item->id,
                    'name'     => $item->name,
                    'apellido' => $item->apellido,
                    'cedula'   => $item->cedula,
                    'sexo'     => $item->sexo,
                    'grado_id' => $item->grado_id,
                    'grados'   => [
                        'nombre_del_grado' => $item->nombre_del_grado,
                        'seccion'          => $item->seccion,
                    ]
                ];
            });

        return response()->json($estudiantes);
    }


    public function show(string $gradoId, Request $request)
    {
        $search = trim($request->input('search', ''));

        // 1. Datos del grado actual
        $currentGrade = Grado::findOrFail($gradoId);

        // 2. Obtener el período activo usando el Helper
        $periodoActivo = PeriodoHelper::getActivo();
        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        // 3. Consulta base de estudiante_periodos
        $query = EstudiantePeriodo::whereIn('estudiante_periodos.status', ['Activo','Aprobado','Reprobado'])
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.grado_id', $gradoId)
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            // JOINs con responsables (padre, madre y representante)
            ->leftJoin('responsables as padre', 'estudiantes.padre_id', '=', 'padre.id')
            ->leftJoin('responsables as representante', 'estudiantes.representante_id', '=', 'representante.id')
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.documento',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                'estudiantes.padre_id',
                'estudiantes.representante_id',

                // Padre
                'padre.name_r as padre_name',
                'padre.cedula_r as padre_cedula',
                'padre.telefono_r as padre_telefono',
                'padre.documento_r as padre_documento',
                'padre.sexo_r as padre_sexo',

                // Representante
                'representante.name_r as representante_name',
                'representante.cedula_r as representante_cedula',
                'representante.telefono_r as representante_telefono',
                'representante.documento_r as representante_documento',
                'representante.sexo_r as representante_sexo',

                // Datos de la pivote
                'estudiante_periodos.status',
                'estudiante_periodos.status_escolar',
                'estudiante_periodos.apreciacion',
                DB::raw("COALESCE(estudiante_periodos.actualizado, 'No') as actualizado"),
                DB::raw("COALESCE(estudiante_periodos.contador_impresiones, 0) as contador_impresiones"),
                'estudiante_periodos.periodo_id',
                'estudiante_periodos.grado_id'
            );

        // 4. Filtro de búsqueda (incluyendo nombre completo con CONCAT)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estudiantes.name', 'like', "%{$search}%")
                    ->orWhere('estudiantes.apellido', 'like', "%{$search}%")
                    ->orWhere('estudiantes.cedula', 'like', "%{$search}%")
                    ->orWhere(DB::raw("CONCAT(estudiantes.name, ' ', estudiantes.apellido)"), 'like', "%{$search}%");
            });
        }

        // 5. Ordenamiento y paginación
        $datos = $query->orderBy('estudiantes.sexo', 'asc')
            ->orderBy('estudiantes.name', 'asc')
            ->paginate(4)
            ->withQueryString();

        // 6. Transformación del Collection para el frontend
        $datos->getCollection()->transform(function ($item) {
            $age = $item->fecha_de_nacimiento ? Carbon::parse($item->fecha_de_nacimiento)->age : null;

            return (object) [
                'id'                   => $item->id,
                'name'                 => $item->name,
                'apellido'             => $item->apellido,
                'cedula'               => $item->cedula,
                'documento'            => $item->documento,
                'sexo'                 => $item->sexo,
                'fecha_de_nacimiento'  => $item->fecha_de_nacimiento,
                'age'                  => $age,
                'padre_id'             => $item->padre_id,
                'representante_id'     => $item->representante_id,
                'padre'                => $item->padre_id ? (object) [
                    'id'          => $item->padre_id,
                    'name_r'      => $item->padre_name,
                    'cedula_r'    => $item->padre_cedula,
                    'telefono_r'  => $item->padre_telefono,
                    'documento_r' => $item->padre_documento,
                    'sexo_r'      => $item->padre_sexo,
                ] : null,
                'representante'        => $item->representante_id ? (object) [
                    'id'          => $item->representante_id,
                    'name_r'      => $item->representante_name,
                    'cedula_r'    => $item->representante_cedula,
                    'telefono_r'  => $item->representante_telefono,
                    'documento_r' => $item->representante_documento,
                    'sexo_r'      => $item->representante_sexo,
                ] : null,
                'status'               => $item->status,
                'status_escolar'       => $item->status_escolar,
                'apreciacion'          => $item->apreciacion,
                'actualizado'          => $item->actualizado,
                'contador_impresiones' => (int) $item->contador_impresiones,
                'periodo_id'           => $item->periodo_id,
            ];
        });

        // 7. Totales optimizados en una sola consulta SQL
        $totalesConsulta = EstudiantePeriodo::whereIn('estudiante_periodos.status', ['Activo', 'Aprobado', 'Reprobado'])
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.grado_id', $gradoId)
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->selectRaw("
            COUNT(*) as general,
            SUM(CASE WHEN estudiantes.sexo = 'M' THEN 1 ELSE 0 END) as masculino,
            SUM(CASE WHEN estudiantes.sexo = 'F' THEN 1 ELSE 0 END) as femenino
        ")
            ->first();

        $totals = [
            'general'   => (int) ($totalesConsulta->general ?? 0),
            'masculino' => (int) ($totalesConsulta->masculino ?? 0),
            'femenino'  => (int) ($totalesConsulta->femenino ?? 0),
        ];

        // 8. Grados y navegación entre secciones/grados
        $grades = Grado::all();
        $previousGradeId = Grado::where('id', '<', $gradoId)->orderBy('id', 'desc')->value('id');
        $nextGradeId = Grado::where('id', '>', $gradoId)->orderBy('id', 'asc')->value('id');
        $apreciaciones = Apreciacion::orderBy('id', 'asc')->get();
        $estadoInscripcion = $periodoActivo ? $periodoActivo->status_periodo : 'Cerrado';
        return Inertia::render('Estudiantes/EstudiantesPorGrado/Listado', [
            'datos'             => $datos,
            'currentGrade'      => $currentGrade,
            'periodo_escolar'   => $estadoInscripcion, // Alias para compatibilidad con la vista
            'totals'            => $totals,
            'filters'           => ['search' => $search],
            'previousGradeId'   => $previousGradeId,
            'nextGradeId'       => $nextGradeId,
            'apreciaciones'     => $apreciaciones,
            'grades'            => $grades,
            'periodo_activo'    => $periodoActivo ? $periodoActivo->nombre_periodo : null,
            'periodo_activo_id' => $periodoId,
        ]);
    }


    public function edit(string $estudianteId)
    {
        // 1. Buscar el estudiante en la tabla estudiantes
        $estudiante = Estudiante::with(['representante', 'padre'])->findOrFail($estudianteId);

        // 2. Obtener el período activo
        $periodoActivo = PeriodoEscolar::where('status', 'Activo')->first();
        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        // 3. Buscar el registro en estudiante_periodos
        $registroPeriodo = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->first();

        // 4. Combinar TODOS los datos para la vista
        $estudianteData = (object) array_merge(
            // Datos de la tabla estudiantes
            $estudiante->toArray(),
            // Datos de la tabla estudiante_periodos (si existe)
            $registroPeriodo ? [
                // Datos académicos
                'apreciacion' => $registroPeriodo->apreciacion,
                'condicion' => $registroPeriodo->condicion,
                'direccion' => $registroPeriodo->direccion,
                'status' => $registroPeriodo->status,
                'status_escolar' => $registroPeriodo->status_escolar,
                'actualizado' => $registroPeriodo->actualizado,
                'periodo_id' => $registroPeriodo->periodo_id,
                'grado_id' => $registroPeriodo->grado_id,
                'instituto_de_procedencia' => $registroPeriodo->instituto_de_procedencia,
                // Datos de salud y antropometría (están en estudiante_periodos)
                'lateralidad' => $registroPeriodo->lateralidad,
                'talla_de_camisa' => $registroPeriodo->talla_de_camisa,
                'talla_de_pantalon' => $registroPeriodo->talla_de_pantalon,
                'talla_de_zapato' => $registroPeriodo->talla_de_zapato,
                'matricula_sisge' => $registroPeriodo->matricula_sisge,
                'calificado' => $registroPeriodo->calificado,
                'fecha_registro' => $registroPeriodo->fecha_registro,
            ] : []
        );
        $apreciaciones = Apreciacion::orderBy('id', 'asc')->get();

        return Inertia::render('Estudiantes/EstudiantesPorGrado/Edit', [
            'estudiantesData' => $estudianteData,
            'currentRepresentante' => $estudiante->representante ? [
                'id' => $estudiante->representante->id,
                'name_r' => $estudiante->representante->name_r,
                'cedula_r' => $estudiante->representante->cedula_r,
            ] : null,
            'currentPadre' => $estudiante->padre ? [
                'id' => $estudiante->padre->id,
                'name_r' => $estudiante->padre->name_r,
                'cedula_r' => $estudiante->padre->cedula_r,
            ] : null,
            'apreciaciones' => $apreciaciones,
            'periodo_activo_id' => $periodoId,
        ]);
    }

    public function update(UpdateEstudiantesRequest $request, string $id)
    {
        // 1. Buscar el estudiante en la tabla estudiantes
        $estudiante = Estudiante::findOrFail($id);

        // 2. Obtener datos validados
        $validated = $request->validated();

        // 3. Obtener el período activo y el grado_id del estudiante_periodos
        $periodoActivo = PeriodoEscolar::where('status', 'Activo')->first();
        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        // 🔥 Buscar el registro en estudiante_periodos para obtener el grado_id
        $registroPeriodo = EstudiantePeriodo::where('estudiante_id', $id)
            ->where('periodo_id', $periodoId)
            ->first();

        // 🔥 El grado_id está en estudiante_periodos
        $gradoId = $registroPeriodo ? $registroPeriodo->grado_id : null;

        // 4. Actualizar tabla estudiantes (datos personales)
        $estudiante->update([
            'name' => $validated['name'],
            'apellido' => $validated['apellido'],
            'cedula' => $validated['cedula'],
            'documento' => $validated['documento'],
            'sexo' => $validated['sexo'],
            'fecha_de_nacimiento' => $validated['fecha_de_nacimiento'],
            'lugar_de_nacimiento' => $validated['lugar_de_nacimiento'] ?? null,
            'entidad_federal' => $validated['entidad_federal'] ?? null,
            'enfermedades' => $validated['enfermedades'] ?? null,
            'tratamiento_medico' => $validated['tratamiento_medico'] ?? null,
            'alergico' => $validated['alergico'] ?? null,
            'condicion_especial' => $validated['condicion_especial'] ?? null,
            'problemas_fisicos' => $validated['problemas_fisicos'] ?? null,
            'etnia' => $validated['etnia'] ?? null,
            'padre_id' => $validated['padre_id'] ?? null,
            'representante_id' => $validated['representante_id'] ?? null,
            'parentesco' => $validated['parentesco'] ?? null,
        ]);

        // 5. Actualizar tabla estudiante_periodos
        if ($periodoId && $registroPeriodo) {
            EstudiantePeriodo::where('estudiante_id', $id)
                ->where('periodo_id', $periodoId)
                ->update([
                    'direccion' => $validated['direccion'] ?? null,
                    'instituto_de_procedencia' => $validated['instituto_de_procedencia'] ?? null,
                    'apreciacion' => $validated['apreciacion'] ?? null,
                    'condicion' => $validated['condicion'] ?? null,
                    'lateralidad' => $validated['lateralidad'] ?? null,
                    'talla_de_camisa' => $validated['talla_de_camisa'] ?? null,
                    'talla_de_pantalon' => $validated['talla_de_pantalon'] ?? null,
                    'talla_de_zapato' => $validated['talla_de_zapato'] ?? null,
                    'status_escolar' => $validated['status_escolar'] ?? null,
                    'actualizado' => 'Si',
                ]);
        }

        // 🔥 Redirigir usando el grado_id obtenido de estudiante_periodos
        return redirect()->route('estudiantes.activos.listado.show', $gradoId)
            ->with('success', 'Estudiante actualizado correctamente.');
    }

    public function cambiarGrado(Request $request)
    {
        // Validar parámetros recibidos
        $validated = $request->validate([
            'student_id'   => ['required', 'exists:estudiantes,id'],
            'new_grade_id' => ['required', 'exists:grados,id'],
        ]);

        // 1. Obtener período activo mediante el Helper
        $periodoActual = PeriodoHelper::getActivo();

        if (!$periodoActual) {
            return back()->with('error', 'No hay un período escolar activo actualmente.');
        }

        // 2. Buscar datos de la inscripción actual (Grado anterior)
        $registroActual = DB::table('estudiante_periodos')
            ->where('estudiante_id', $validated['student_id'])
            ->where('periodo_id', $periodoActual->id)
            ->first();

        if (!$registroActual) {
            return back()->with('error', 'No se encontró la inscripción del estudiante en el período activo.');
        }

        $oldGradeId = $registroActual->grado_id;

        if ($oldGradeId == $validated['new_grade_id']) {
            return back()->with('error', 'El estudiante ya está inscrito en el grado seleccionado.');
        }

        // 3. Ejecutar actualización y movimiento dentro de una transacción
        DB::transaction(function () use ($validated, $periodoActual, $oldGradeId, $registroActual) {
            $now = now();

            // Actualizar tabla pivote con llave compuesta
            DB::table('estudiante_periodos')
                ->where('estudiante_id', $validated['student_id'])
                ->where('periodo_id', $periodoActual->id)
                ->where('grado_id', $oldGradeId)
                ->update([
                    'grado_id'   => $validated['new_grade_id'],
                    'status'     => 'Activo',
                    'matricula_sisge'    => 'No',
                    'status_sisge'    => 'Cambio de Grado',
                    'updated_at' => $now,
                ]);

            // Registrar movimiento solo si el proceso de inscripción está cerrado
            if ($periodoActual->status_periodo === 'Cerrado') {
                Movimiento::create([
                    'estudiante_id'      => $validated['student_id'],
                    'periodo_id'         => $periodoActual->id,
                    'tipo_de_movimiento' => 'Cambio',
                    'grado_id_past'      => $oldGradeId,
                    'grado_id_new'       => $validated['new_grade_id'],
                    'status'             => 'Cambio de Grado',
                    'matricula_sisge'    => 'No',
                    'fecha_registro'     => $now->format('Y-m-d'),
                ]);
            }
        });

        // Redireccionar a la vista de origen con mensaje
        return redirect()->route('estudiantes.activos.listado.show', $oldGradeId)
            ->with('success', 'Estudiante movido correctamente al nuevo grado.');
    }

    public function guardarResponsable(StoreResponsableRequest $request)
    {
        // dd($request->query());
        $validated = $request->validated();
        $responsable = Responsable::create($validated);

        return redirect()->back()->with([
            'success' => 'Responsable registrado exitosamente.',
            'responsable' => $responsable // Pass the newly created responsible object
        ]);
    }

    public function updateResponsable(Request $request, int $id)
    {
        // 1. Validar
        $request->validate([
            'responsable_id' => 'required|exists:responsables,id',
            'tipo' => 'required|in:representante,padre',
            'parentesco' => 'nullable|string|max:255',
        ]);

        // 2. Buscar estudiante
        $student = Estudiante::findOrFail($id);

        $columna = $request->tipo === 'padre' ? 'padre_id' : 'representante_id';
        $responsableViejoId = $student->{$columna};
        $responsableNuevoId = $request->responsable_id;

        // 3. Si no hay cambio, salir
        if ($responsableViejoId == $responsableNuevoId) {
            return redirect()->back()->with('info', 'El responsable ya está asignado.');
        }

        // 4. Actualizar el vínculo en la tabla estudiantes
        $student->{$columna} = $responsableNuevoId;
        if ($request->tipo === 'representante') {
            $student->parentesco = $request->parentesco;
        }
        $student->save();

        // 5. GESTIÓN DE ESTADOS (La lógica corregida)

        // A. ACTIVAR al responsable nuevo (Si no lo estaba)
        \App\Models\Responsable::where('id', $responsableNuevoId)
            ->update(['status_r' => 'Activo']);

        // B. REVISAR al responsable viejo para ver si debe inactivarse
        if ($responsableViejoId) {
            // ¿Tiene algún hijo que esté actualmente "Activo" en el historial?
            $tieneRepresentadosActivos = Estudiante::where(function ($q) use ($responsableViejoId) {
                $q->where('representante_id', $responsableViejoId)
                    ->orWhere('padre_id', $responsableViejoId);
            })
                ->whereHas('estudiantePeriodos', function ($q) {
                    // Filtramos por el estatus del motor que definimos antes
                    $q->where('status', 'Activo');
                })
                ->exists(); // exists() es más rápido que count()

            // Si NO tiene ningún hijo activo (están Aprobados, Retirados o no tienen inscripción)
            if (!$tieneRepresentadosActivos) {
                \App\Models\Responsable::where('id', $responsableViejoId)
                    ->update(['status_r' => 'Inactivo']);
            }
        }

        $mensaje = $request->tipo === 'padre' ? 'Padre/Madre actualizado.' : 'Representante actualizado.';
        return redirect()->back()->with('success', $mensaje);
    }

    //usado para retirar estudiantes
    public function destroy(Request $request, int $id)
    {
        // 1. Validar parámetros recibidos
        $validated = $request->validate([
            'status_escolar' => 'required|string|max:255',
        ]);

        // 2. Obtener períodos
        $periodoActivo = PeriodoHelper::getActivo();
        $periodoInactivo = PeriodoHelper::getInactivo();

        if (!$periodoActivo) {
            return back()->with('error', 'No hay un período activo actualmente.');
        }

        $estudiante = Estudiante::findOrFail($id);

        // 🔥 OBTENER LA INSCRIPCIÓN ACTIVA UNA SOLA VEZ AL PRINCIPIO
        $inscripcionActiva = DB::table('estudiante_periodos')
            ->where('estudiante_id', $estudiante->id)
            ->where('periodo_id', $periodoActivo->id)
            ->first();

        // ============================================================
        // CASO 1: PERÍODO ACTIVO ESTÁ CERRADO
        // Retiro normal en el período activo
        // ============================================================
        if ($periodoActivo->status_periodo === 'Cerrado') {

            if (!$inscripcionActiva) {
                return back()->with('error', 'No se encontró inscripción activa del estudiante.');
            }

            $gradoIdOriginal = $inscripcionActiva->grado_id;

            DB::transaction(function () use ($estudiante, $periodoActivo, $gradoIdOriginal, $validated) {
                $now = now();

                DB::table('estudiante_periodos')
                    ->where('estudiante_id', $estudiante->id)
                    ->where('periodo_id', $periodoActivo->id)
                    ->where('grado_id', $gradoIdOriginal)
                    ->update([
                        'status'          => 'Retirado',
                        'status_escolar'  => $validated['status_escolar'],
                        'matricula_sisge' => 'No',
                        'status_sisge'    => 'Retirado',
                        'fecha_registro'  => $now->format('Y-m-d'),
                        'updated_at'      => $now,
                    ]);

                Movimiento::create([
                    'estudiante_id'      => $estudiante->id,
                    'periodo_id'         => $periodoActivo->id,
                    'tipo_de_movimiento' => 'Egreso',
                    'grado_id_past'      => $gradoIdOriginal,
                    'grado_id_new'       => $gradoIdOriginal,
                    'status'             => 'Retirado',
                    'matricula_sisge'    => 'No',
                    'fecha_registro'     => $now->format('Y-m-d'),
                ]);

                $this->inactivarResponsablesSiNoTienenHijosActivos($estudiante, $periodoActivo->id);
            });

            $estudianteData = [
                'id'              => $estudiante->id,
                'name'            => $estudiante->name,
                'apellido'        => $estudiante->apellido,
                'cedula'          => $estudiante->cedula,
                'periodo_id'      => $periodoActivo->id,
                'periodo_escolar' => $periodoActivo->nombre_periodo,
                'grado_id'        => $gradoIdOriginal,
                'status_escolar'  => $validated['status_escolar'],
            ];

            return redirect()->route('estudiantes.activos.listado.show', $gradoIdOriginal)
                ->with('success', 'Estudiante retirado correctamente.')
                ->with('estudiante_retirado', $estudianteData);
        }

        // ============================================================
        // CASO 2: PERÍODO ACTIVO ESTÁ ABIERTO
        // Buscar en período INACTIVO (Aprobado/Reprobado)
        // ============================================================
        if ($periodoActivo->status_periodo === 'Abierto') {

            if (!$periodoInactivo) {
                return back()->with('error', 'No hay un período inactivo para procesar el retiro.');
            }

            // Buscar en período inactivo
            $inscripcionInactiva = DB::table('estudiante_periodos')
                ->where('estudiante_id', $estudiante->id)
                ->where('periodo_id', $periodoInactivo->id)
                ->first();

            if (!$inscripcionInactiva) {
                return back()->with('error', 'No se encontró inscripción del estudiante en el período inactivo.');
            }

            // Verificar que esté Aprobado o Reprobado
            if (!in_array($inscripcionInactiva->status, ['Aprobado', 'Reprobado'])) {
                return back()->with('error', 'El estudiante no está calificado (Aprobado/Reprobado) para ser retirado.');
            }

            // Validar contador de impresiones
            $contadorImpresiones = (int) $inscripcionInactiva->contador_impresiones;

            if ($contadorImpresiones === 0) {
                $tipo = $inscripcionInactiva->status === 'Aprobado' ? 'aprobados' : 'reprobados';
                $mensaje = $inscripcionInactiva->status === 'Aprobado'
                    ? 'Debe generar la constancia de Aprobado antes de retirar al estudiante.'
                    : 'Debe generar la constancia de Reprobado antes de retirar al estudiante.';

                // 🔥 GRADO DEL PERÍODO ACTIVO (para volver después de imprimir)
                $gradoActivoId = $inscripcionActiva ? $inscripcionActiva->grado_id : null;

                return redirect()->route('estudiantes.activos.' . $tipo . '.index', [
                    'search' => $estudiante->cedula,
                    'desde_activo' => true,
                    'grado_retorno' => $gradoActivoId,
                ])
                    ->with([
                        'error' => $mensaje,
                        'estudiante_pendiente' => [
                            'id'            => $estudiante->id,
                            'name'          => $estudiante->name,
                            'apellido'      => $estudiante->apellido,
                            'cedula'        => $estudiante->cedula,
                            'grado_activo'  => $gradoActivoId,
                            'status'        => $inscripcionInactiva->status,
                        ],
                    ]);
            }

            // Contador >= 1 → Proceder con retiro
            $gradoInactivoId = $inscripcionInactiva->grado_id;

            // 🔥 GRADO DEL PERÍODO ACTIVO PARA REDIRIGIR
            $gradoActivoId = $inscripcionActiva ? $inscripcionActiva->grado_id : null;

            DB::transaction(function () use ($estudiante, $periodoActivo, $periodoInactivo, $gradoInactivoId, $validated) {
                $now = now();

                // A. ACTUALIZAR EN PERÍODO INACTIVO (Aprobado/Reprobado → Retirado)
                DB::table('estudiante_periodos')
                    ->where('estudiante_id', $estudiante->id)
                    ->where('periodo_id', $periodoInactivo->id)
                    ->where('grado_id', $gradoInactivoId)
                    ->update([
                        'status'          => 'Retirado',
                        'status_escolar'  => $validated['status_escolar'],
                        'matricula_sisge' => 'No',
                        'status_sisge'    => 'Retirado',
                        'fecha_registro'  => $now->format('Y-m-d'),
                        'updated_at'      => $now,
                    ]);

                // B. ELIMINAR REGISTRO EN PERÍODO ACTIVO (si existe)
                DB::table('estudiante_periodos')
                    ->where('estudiante_id', $estudiante->id)
                    ->where('periodo_id', $periodoActivo->id)
                    ->delete();

                // C. REGISTRAR MOVIMIENTO EN PERÍODO INACTIVO
                Movimiento::create([
                    'estudiante_id'      => $estudiante->id,
                    'periodo_id'         => $periodoInactivo->id,
                    'tipo_de_movimiento' => 'Egreso',
                    'grado_id_past'      => $gradoInactivoId,
                    'grado_id_new'       => $gradoInactivoId,
                    'status'             => 'Retirado',
                    'matricula_sisge'    => 'No',
                    'fecha_registro'     => $now->format('Y-m-d'),
                ]);

                // D. Inactivar responsables
                $this->inactivarResponsablesSiNoTienenHijosActivos($estudiante, $periodoInactivo->id);
            });

            $estudianteData = [
                'id'              => $estudiante->id,
                'name'            => $estudiante->name,
                'apellido'        => $estudiante->apellido,
                'cedula'          => $estudiante->cedula,
                'periodo_id'      => $periodoInactivo->id,
                'periodo_escolar' => $periodoInactivo->nombre_periodo,
                'grado_id'        => $gradoInactivoId,
                'status_escolar'  => $validated['status_escolar'],
            ];

            // 🔥 REDIRIGIR AL GRADO DEL PERÍODO ACTIVO
            return redirect()->route('estudiantes.activos.listado.show', $gradoActivoId)
                ->with('success', 'Estudiante retirado correctamente.')
                ->with('estudiante_retirado', $estudianteData);
        }

        return back()->with('error', 'Estado del período no válido.');
    }

    /**
     * Inactivar responsables si no tienen hijos activos
     */
    private function inactivarResponsablesSiNoTienenHijosActivos($estudiante, $periodoId)
    {
        $responsablesIds = array_filter(array_unique([
            $estudiante->representante_id,
            $estudiante->padre_id,
        ]));

        foreach ($responsablesIds as $respId) {
            $tieneHijosActivos = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.status', 'Activo')
                ->where(function ($q) use ($respId) {
                    $q->where('estudiantes.representante_id', $respId)
                        ->orWhere('estudiantes.padre_id', $respId);
                })
                ->exists();

            if (!$tieneHijosActivos) {
                Responsable::where('id', $respId)->update(['status_r' => 'Inactivo']);
            }
        }
    }

    public function graduate(Request $request)
    {
        // 1. Validar datos del formulario
        $validated = $request->validate([
            'student_id'       => 'required|exists:estudiantes,id',
            'current_grade_id' => 'required|exists:grados,id',
            'apreciacion'       => 'required|string',
        ]);

        // 2. Obtener período activo utilizando el Helper
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()
                ->with('error', 'No hay un período activo actualmente..');
        }

        // 3. Validar estado del proceso de inscripción
        if ($periodoActivo->proceso_de_inscripcion === 'Abierto') {
            return redirect()->back()
                ->with('error', 'No se puede graduar estudiantes mientras el proceso de inscripción está ABIERTO.');
        }

        // 4. Validar la apreciación enviada
        $apreciacionEnviada = $validated['apreciacion'];
        if (in_array($apreciacionEnviada, ['S-D', '', null], true)) {
            return redirect()->back()
                ->with('error', 'La apreciación seleccionada no es válida para graduar.');
        }

        // 5. Buscar el estudiante y su registro en el período activo
        $estudiante = Estudiante::findOrFail($validated['student_id']);

        $registro = EstudiantePeriodo::where('estudiante_id', $estudiante->id)
            ->where('periodo_id', $periodoActivo->id)
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'No se encontró registro del estudiante en el período actual.');
        }

        // 6. Validar que el estudiante pertenezca a 6to Grado
        $gradoActual = Grado::find($registro->grado_id);
        if (!$gradoActual || !str_contains(mb_strtolower($gradoActual->nombre_del_grado), '6to')) {
            return redirect()->back()->with('error', 'Solo se pueden graduar estudiantes de 6to Grado.');
        }

        // 7. Validar estado previo
        if ($registro->status_escolar === 'Graduado') {
            return redirect()->back()->with('error', 'Este estudiante ya está graduado.');
        }

        // 8. Procesar la graduación dentro de una transacción atómica
        DB::transaction(function () use ($estudiante, $periodoActivo, $registro, $validated) {
            $now = now();

            // A. Actualizar clave primaria compuesta mediante DB::table
            DB::table('estudiante_periodos')
                ->where('estudiante_id', $estudiante->id)
                ->where('periodo_id', $periodoActivo->id)
                ->where('grado_id', $registro->grado_id)
                ->update([
                    'status'         => 'Graduado',
                    'status_escolar' => 'Graduado',
                    'apreciacion'    => $validated['apreciacion'],
                    'actualizado'    => 'Si',
                    'matricula_sisge'    => 'No',
                    'status_sisge' => 'Graduado',
                    'updated_at'     => $now,
                ]);

            // B. Registrar movimiento histórico
            Movimiento::create([
                'estudiante_id'      => $estudiante->id,
                'periodo_id'         => $periodoActivo->id,
                'tipo_de_movimiento' => 'Egreso',
                'grado_id_past'      => $registro->grado_id,
                'grado_id_new'       => $registro->grado_id,
                'status'             => 'Egresado',
                'matricula_sisge'    => 'No',
                'fecha_registro'     => $now->format('Y-m-d'),
            ]);

            // C. Evaluar e inactivar responsables si no poseen más representados activos
            $responsablesIds = array_filter(array_unique([
                $estudiante->representante_id,
                $estudiante->padre_id,

            ]));

            foreach ($responsablesIds as $respId) {
                $tieneHijosActivos = DB::table('estudiante_periodos')
                    ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                    ->where('estudiante_periodos.periodo_id', $periodoActivo->id)
                    ->where('estudiante_periodos.status', 'Activo')
                    ->where('estudiante_periodos.status_escolar', '!=', 'Graduado')
                    ->where(function ($q) use ($respId) {
                        $q->where('estudiantes.representante_id', $respId)
                            ->orWhere('estudiantes.padre_id', $respId);
                    })
                    ->exists();

                if (!$tieneHijosActivos) {
                    Responsable::where('id', $respId)->update(['status_r' => 'Inactivo']);
                }
            }
        });

        return redirect()->route('estudiantes.activos.listado.show', $validated['current_grade_id'])
            ->with('success', 'Estudiante graduado exitosamente.');
    }

    public function buscarResponsable(Request $request)
    {

        $cedula = $request->input('cedula');
        $trimmedCedula = trim($cedula);

        $responsable = Responsable::where('cedula_r', $trimmedCedula)->first();

        return response()->json(['responsable' => $responsable]);
    }


    public function asignacionMasivaDeGrados(Request $request)
    {
        try {
            DB::transaction(function () {
                // 1. Obtener período ACTIVO e INACTIVO
                $periodoActivo = PeriodoHelper::getActivo();
                $periodoInactivo = PeriodoHelper::getInactivo();

                if (!$periodoActivo) {
                    throw new \Exception('No hay un período escolar activo actualmente.');
                }

                if (!$periodoInactivo) {
                    throw new \Exception('No hay un período escolar inactivo (anterior) para procesar.');
                }

                $periodoActivoId = $periodoActivo->id;
                $periodoInactivoId = $periodoInactivo->id;

                // 2. Obtener estudiantes del período INACTIVO con status Aprobado o Reprobado
                $registrosPendientes = EstudiantePeriodo::with('grado')
                    ->where('periodo_id', $periodoInactivoId)
                    ->whereIn('status', ['Aprobado', 'Reprobado'])
                    //->whereNotIn('status_escolar', ['Grado Asignado', 'Graduado', 'Proceso Administrativo'])
                    ->get();

                if ($registrosPendientes->isEmpty()) {
                    throw new \Exception("No hay estudiantes pendientes en el período {$periodoInactivo->nombre_periodo} para procesar.");
                }

                // Mapeo de progresión
                $gradeProgression = [
                    '1er Grado' => '2do Grado',
                    '2do Grado' => '3er Grado',
                    '3er Grado' => '4to Grado',
                    '4to Grado' => '5to Grado',
                    '5to Grado' => '6to Grado',
                ];

                // Precargar todos los grados
                $todosLosGrados = Grado::all()->groupBy('nombre_del_grado');

                // Arrays para capturar llaves compuestas para batch updates
                $llavesGraduados = [];
                $llavesAprobadosProcesados = [];
                $nuevasInscripciones = [];
                $reprobadosPorGrado = [];

                // Precargar inscripciones existentes en el nuevo periodo (para evitar duplicados)
                $existentesNuevoPeriodo = EstudiantePeriodo::where('periodo_id', $periodoActivoId)
                    ->pluck('estudiante_id')
                    ->flip()
                    ->toArray();

                $fechaHoy = now()->format('Y-m-d');
                $now = now();

                foreach ($registrosPendientes as $registro) {
                    $llaveCompuesta = [
                        'estudiante_id' => $registro->estudiante_id,
                        'periodo_id'    => $registro->periodo_id,
                        'grado_id'      => $registro->grado_id,
                    ];

                    $gradoActual = $registro->grado;
                    if (!$gradoActual) continue;

                    $nombreGradoActual = $gradoActual->nombre_del_grado;
                    $seccionActual = $gradoActual->seccion;
                    $esSexto = str_contains(mb_strtolower($nombreGradoActual), '6to');

                    // CASO 1: Sexto Grado Aprobado -> Graduado (no pasa al nuevo período)
                    if ($esSexto && $registro->status === 'Aprobado') {
                        $llavesGraduados[] = $llaveCompuesta;
                        continue;
                    }

                    // CASO 2: REPROBADOS (se quedan en el mismo grado en el nuevo período)
                    if ($registro->status === 'Reprobado') {
                        $reprobadosPorGrado[$nombreGradoActual][] = $registro;
                        continue;
                    }

                    // CASO 3: APROBADOS (1ro a 5to) -> Pasan al grado siguiente
                    if (!isset($gradeProgression[$nombreGradoActual])) continue;

                    $nombreGradoSiguiente = $gradeProgression[$nombreGradoActual];
                    $seccionesSiguientes = $todosLosGrados->get($nombreGradoSiguiente);
                    $gradoSiguiente = $seccionesSiguientes ? $seccionesSiguientes->where('seccion', $seccionActual)->first() : null;

                    if (!$gradoSiguiente) {
                        throw new \Exception("Error: La sección '{$seccionActual}' no existe en '{$nombreGradoSiguiente}'.");
                    }

                    // Marcar como procesado en el período inactivo
                    $llavesAprobadosProcesados[] = $llaveCompuesta;

                    // Crear nuevo registro en el período activo (solo si no existe)
                    if (!isset($existentesNuevoPeriodo[$registro->estudiante_id])) {
                        $nuevasInscripciones[] = $this->prepararEstructuraInscripcion(
                            $registro,
                            $periodoActivoId,
                            $gradoSiguiente->id,
                            'Regular',
                            $fechaHoy,
                            $now
                        );
                        $existentesNuevoPeriodo[$registro->estudiante_id] = true;
                    }
                }

                // --- BATCH UPDATES EN EL PERÍODO INACTIVO ---
                foreach ($llavesGraduados as $llave) {
                    DB::table('estudiante_periodos')
                        ->where('estudiante_id', $llave['estudiante_id'])
                        ->where('periodo_id', $llave['periodo_id'])
                        ->where('grado_id', $llave['grado_id'])
                        ->update([
                            'status_escolar' => 'Graduado',
                            'status' => 'Graduado',
                            'updated_at' => $now,
                        ]);
                }

                foreach ($llavesAprobadosProcesados as $llave) {
                    DB::table('estudiante_periodos')
                        ->where('estudiante_id', $llave['estudiante_id'])
                        ->where('periodo_id', $llave['periodo_id'])
                        ->where('grado_id', $llave['grado_id'])
                        ->update([
                            'status_escolar' => 'Grado Asignado',
                            'updated_at' => $now,
                        ]);
                }

                // 3. REDISTRIBUCIÓN EQUITATIVA DE REPROBADOS (en el período ACTIVO)
                $llavesReprobadosProcesados = [];

                foreach ($reprobadosPorGrado as $nombreGrado => $listaReprobados) {
                    $secciones = $todosLosGrados->get($nombreGrado);
                    if (!$secciones || $secciones->isEmpty()) continue;

                    $seccionesIds = $secciones->pluck('id')->toArray();

                    // Contar estudiantes en cada sección del período ACTIVO
                    $conteoSecciones = EstudiantePeriodo::where('periodo_id', $periodoActivoId)
                        ->whereIn('grado_id', $seccionesIds)
                        ->select('grado_id', DB::raw('count(*) as total'))
                        ->groupBy('grado_id')
                        ->pluck('total', 'grado_id')
                        ->toArray();

                    foreach ($seccionesIds as $sId) {
                        if (!isset($conteoSecciones[$sId])) {
                            $conteoSecciones[$sId] = 0;
                        }
                    }

                    foreach ($listaReprobados as $registroReprobado) {
                        asort($conteoSecciones);
                        $gradoIdMasVacio = key($conteoSecciones);

                        // Marcar como procesado en el período inactivo
                        $llavesReprobadosProcesados[] = [
                            'estudiante_id' => $registroReprobado->estudiante_id,
                            'periodo_id'    => $registroReprobado->periodo_id,
                            'grado_id'      => $registroReprobado->grado_id,
                        ];

                        // Crear nuevo registro en el período activo (mismo grado, sección menos poblada)
                        if (!isset($existentesNuevoPeriodo[$registroReprobado->estudiante_id])) {
                            $nuevasInscripciones[] = $this->prepararEstructuraInscripcion(
                                $registroReprobado,
                                $periodoActivoId,
                                $gradoIdMasVacio,
                                'Repitiente',
                                $fechaHoy,
                                $now
                            );
                            $existentesNuevoPeriodo[$registroReprobado->estudiante_id] = true;
                        }

                        $conteoSecciones[$gradoIdMasVacio]++;
                    }
                }

                // Actualizar reprobados en el período inactivo
                foreach ($llavesReprobadosProcesados as $llave) {
                    DB::table('estudiante_periodos')
                        ->where('estudiante_id', $llave['estudiante_id'])
                        ->where('periodo_id', $llave['periodo_id'])
                        ->where('grado_id', $llave['grado_id'])
                        ->update([
                            'status_escolar' => 'Grado Asignado',
                            'updated_at' => $now,
                        ]);
                }

                // Inserción masiva de los nuevos registros en el período ACTIVO
                if (!empty($nuevasInscripciones)) {
                    foreach (array_chunk($nuevasInscripciones, 500) as $chunk) {
                        DB::table('estudiante_periodos')->insert($chunk);
                    }
                }
            });

            $this->gestionarEstadosResponsablesPorPeriodoActivo();

            return redirect()->route('estudiantes.registro.selecciona.grado')
                ->with('success', 'Carga de estudiantes completada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Prepara el arreglo para inserción usando DB::table
     */
    private function prepararEstructuraInscripcion($reg, $periodoId, $gradoId, $condicion, $fecha, $now)
    {
        return [
            'estudiante_id'           => $reg->estudiante_id,
            'periodo_id'              => $periodoId,
            'grado_id'                => $gradoId,
            'status'                  => 'Activo',
            'status_escolar'          => 'Escolarizado',
            'condicion'               => $condicion,
            'apreciacion'             => $reg->apreciacion ?? 'Pendiente',
            'fecha_registro'          => $fecha,
            'actualizado'             => 'No',
            'matricula_sisge'         => 'Si',
            'calificado'              => 'No',
            'direccion'               => $reg->direccion,
            'instituto_de_procedencia' => 'Escuela Carlos Rafael Contreras',
            'contador_impresiones' => 0,
            'lateralidad'             => $reg->lateralidad,
            'talla_de_camisa'         => $reg->talla_de_camisa,
            'talla_de_pantalon'       => $reg->talla_de_pantalon,
            'talla_de_zapato'         => $reg->talla_de_zapato,
            'created_at'              => $now,
            'updated_at'              => $now,
        ];
    }
    /**
     * Gestiona el estado de los responsables basándose en el período activo usando PeriodoHelper
     */
    private function gestionarEstadosResponsablesPorPeriodoActivo()
    {
        $periodoActivoId = PeriodoHelper::getActivoId();

        if (!$periodoActivoId) {
            return;
        }

        // Obtener los IDs únicos de responsables con estudiantes activos en el período actual
        $idsActivos = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoActivoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->where('estudiante_periodos.status_escolar', '!=', 'Graduado')
            ->select('estudiantes.padre_id',  'estudiantes.representante_id')
            ->get()
            ->flatMap(function ($item) {
                return [$item->padre_id,  $item->representante_id];
            })
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        if (!empty($idsActivos)) {
            // Activar los correspondientes
            Responsable::whereIn('id', $idsActivos)
                ->where('status_r', 'Inactivo')
                ->update(['status_r' => 'Activo']);

            // Desactivar en lote los que ya no tengan representados activos
            Responsable::where('status_r', 'Activo')
                ->whereNotIn('id', $idsActivos)
                ->update(['status_r' => 'Inactivo']);
        } else {
            Responsable::where('status_r', 'Activo')
                ->update(['status_r' => 'Inactivo']);
        }
    }
}
