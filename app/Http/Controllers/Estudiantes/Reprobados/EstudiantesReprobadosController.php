<?php

namespace App\Http\Controllers\Estudiantes\Reprobados;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Apreciacion;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EstudiantesReprobadosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $periodo_id = $request->periodo_id;
        $grade = $request->input('grade');
        // Obtener el período actual Activo mediante el Helper
        $periodoActual = PeriodoHelper::getActivo();
        $apreciacionesReprobadas = Apreciacion::reprobados()->get();
        $apreciacionesAprobadas = Apreciacion::aprobados()->get();

        // 1. Obtener los periodos donde existen alumnos con status 'Reprobado'
        $periodosDisponibles = PeriodoEscolar::whereHas('estudiantePeriodos', function ($q) {
            $q->where('status', 'Reprobado');
        })->get(['id', 'nombre_periodo']);

        // 2. Consulta principal uniendo las tablas
        $query = EstudiantePeriodo::query()
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            // FILTRO MOTOR: Solo los que tengan status 'Reprobado'
            ->where('estudiante_periodos.status', 'Reprobado')
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
                'periodo_escolars.nombre_periodo',
                DB::raw("CONCAT(estudiante_periodos.estudiante_id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as periodo_estudiante_id")
            );
        if ($grade) {
            $query->where('grado_id', $grade);
        }
        // 3. Aplicar Búsqueda por Nombre, Apellido o Cédula
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estudiantes.name', 'like', "%{$search}%")
                    ->orWhere('estudiantes.apellido', 'like', "%{$search}%")
                    ->orWhere('estudiantes.cedula', 'like', "%{$search}%");
            });
        }

        // 4. Filtro por Periodo específico
        if ($periodo_id) {
            $query->where('estudiante_periodos.periodo_id', $periodo_id);
        }

        // 5. Totales
        $totalestudiantes = [
            'general'   => (clone $query)->count(),
            'masculino' => (clone $query)->where('estudiantes.sexo', 'M')->count(),
            'femenino'  => (clone $query)->where('estudiantes.sexo', 'F')->count(),
        ];

        // Ordenar por el nombre del periodo más reciente primero
        $estudiantes = $query->orderBy('periodo_escolars.nombre_periodo', 'desc')
            ->paginate(10)
            ->withQueryString();

        // 6. Matrícula de reprobados
        $todosEstudiantesReprobados = Grado::whereHas('estudiantePeriodos', function ($q) {
            $q->where('status', 'Reprobado');
        })
            ->withCount([
                'estudiantePeriodos as masculino' => function ($q) {
                    $q->where('status', 'Reprobado')
                        ->whereHas('estudiante', function ($sub) {
                            $sub->where('sexo', 'M');
                        });
                },
                'estudiantePeriodos as femenino' => function ($q) {
                    $q->where('status', 'Reprobado')
                        ->whereHas('estudiante', function ($sub) {
                            $sub->where('sexo', 'F');
                        });
                }
            ])
            ->get()
            ->map(function ($grado) {
                return [
                    'nombre_del_grado' => $grado->nombre_del_grado,
                    'seccion'          => $grado->seccion,
                    'm'                => $grado->masculino,
                    'f'                => $grado->femenino,
                    'total'            => $grado->masculino + $grado->femenino
                ];
            });

        return Inertia::render('Estudiantes/EstudiantesReprobados/Index', [
            'datos'                     => $estudiantes,
            'totalestudiantes'          => $totalestudiantes,
            'periodosDisponibles'       => $periodosDisponibles,
            'apreciacionesReprobadas'   => $apreciacionesReprobadas,
            'apreciacionesAprobadas'    => $apreciacionesAprobadas,
            'filters'                   => $request->all(['search', 'periodo_id']),
            'gradosDisponibles'         => Grado::all(['id', 'nombre_del_grado', 'seccion']),
            'proceso_de_inscripcion'    => $periodoActual ? $periodoActual->status_periodo : 'Abierto',
            'periodo_escolar'           => $periodoActual ? $periodoActual->status_periodo : 'Abierto',
            'todosEstudiantesReprobados' => $todosEstudiantesReprobados,
            'desde_activo' => $request->boolean('desde_activo'),
            'grado_retorno' => $request->input('grado_retorno'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $periodoEstudianteId)
    {
        try {
            // Parsear la clave compuesta
            $ids = explode('-', $periodoEstudianteId);

            if (count($ids) !== 3) {
                return redirect()->back()->with('error', 'ID de estudiante período inválido.');
            }

            $estudianteId = (int)$ids[0];
            $periodoId = (int)$ids[1];
            $gradoId = (int)$ids[2];

            // Buscar el registro usando where directo (NO usar findOrFail)
            $registroReprobado = EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->first();

            if (!$registroReprobado) {
                return redirect()->back()->with('error', 'Registro no encontrado.');
            }

            // Obtener el estudiante asociado
            $estudiante = Estudiante::findOrFail($registroReprobado->estudiante_id);

            // Validación de datos
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'apellido' => ['required', 'string', 'max:255'],
                'fecha_de_nacimiento' => ['required', 'date'],
                'sexo' => ['required', 'string', 'in:M,F'],
                'cedula' => [
                    'required',
                    'min:8',
                    'max:11',
                    Rule::unique('estudiantes', 'cedula')->ignore($estudiante->id),
                ],
                'apreciacion' => ['nullable', 'string'],
            ]);

            // Actualizar SOLO la tabla estudiantes (datos personales)
            $estudiante->update([
                'name' => $validatedData['name'],
                'apellido' => $validatedData['apellido'],
                'fecha_de_nacimiento' => $validatedData['fecha_de_nacimiento'],
                'sexo' => $validatedData['sexo'],
                'cedula' => $validatedData['cedula'],
            ]);

            // También actualizar la apreciación si viene en el request
            if ($request->has('apreciacion') && $request->apreciacion) {
                // Actualizar usando where directo para evitar problemas con 'id'
                EstudiantePeriodo::where('estudiante_id', $estudianteId)
                    ->where('periodo_id', $periodoId)
                    ->where('grado_id', $gradoId)
                    ->update([
                        'apreciacion' => $request->apreciacion
                    ]);
            }

            return redirect()->back()->with('success', 'Datos actualizados correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar: ' . $e->getMessage());
        }
    }

    /**
     * Promover estudiante (Reprobado → Aprobado)
     */
    public function promover(Request $request, string $periodoEstudianteId)
    {
        try {
            // Parsear la clave compuesta
            $ids = explode('-', $periodoEstudianteId);

            if (count($ids) !== 3) {
                return redirect()->back()->with('error', 'ID de estudiante período inválido.');
            }

            $estudianteId = (int)$ids[0];
            $periodoId    = (int)$ids[1];
            $gradoId      = (int)$ids[2];

            // 1. Buscar el registro reprobado usando donde directo
            $registroReprobado = EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->first();

            if (!$registroReprobado) {
                return redirect()->back()->with('error', 'Registro no encontrado.');
            }

            // 2. Validar que el período esté ABIERTO mediante el PeriodoHelper
            $periodoEscolarActual = PeriodoHelper::getActivo();

            // 5. Validar la nueva apreciación
            $validatedData = $request->validate([
                'apreciacion' => ['required', 'string', 'in:A,B,C,D'],
            ]);

            // 6. ACTUALIZAR usando donde directo
            EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->update([
                    'status'         => 'Aprobado',
                    'status_escolar' => 'Aprobado',
                    'apreciacion'    => $validatedData['apreciacion'],
                ]);

            return redirect()->route('estudiantes.activos.reprobados.index')
                ->with('success', 'Estudiante promovido a Aprobado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al promover: ' . $e->getMessage());
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

            $estudianteId = (int)$ids[0];
            $periodoId    = (int)$ids[1];
            $gradoId      = (int)$ids[2];

            // 1. Validar motivo del retiro
            $request->validate([
                'status_escolar' => 'required|string|max:255',
            ]);

            // 2. Buscar el registro reprobado usando el helper del Modelo
            $registroReprobado = EstudiantePeriodo::findByCompositeKey($estudianteId, $periodoId, $gradoId);

            if (!$registroReprobado) {
                return redirect()->back()->with('error', 'Registro no encontrado.');
            }

            // 5. INICIAR TRANSACCIÓN ATÓMICA
            DB::transaction(function () use ($registroReprobado, $request, $estudianteId, $periodoId, $gradoId, $periodoEstudianteId) {

                // 5.1 ACTUALIZACIÓN SEGURA: Consulta explícita por la clave compuesta
                EstudiantePeriodo::where('estudiante_id', $estudianteId)
                    ->where('periodo_id', $periodoId)
                    ->where('grado_id', $gradoId)
                    ->update([
                        'status'          => 'Retirado',
                        'status_escolar'  => $request->status_escolar,
                        'matricula_sisge' => 'No',
                    ]);

                // 5.2 Obtener modelos relacionados para el payload del modal
                $estudiante = Estudiante::find($estudianteId);
                $periodo    = PeriodoEscolar::find($periodoId);

                // 5.3 Preparar información del estudiante retirado para la sesión
                $estudianteData = [
                    'id'                    => $registroReprobado->id ?? null,
                    'estudiante_id'         => $estudianteId,
                    'periodo_id'            => $periodoId,
                    'grado_id'              => $gradoId,
                    'name'                  => $estudiante?->name,
                    'apellido'              => $estudiante?->apellido,
                    'cedula'                => $estudiante?->cedula,
                    'sexo'                  => $estudiante?->sexo,
                    'fecha_de_nacimiento'   => $estudiante?->fecha_de_nacimiento,
                    'age'                   => $estudiante?->fecha_de_nacimiento ? Carbon::parse($estudiante->fecha_de_nacimiento)->age : null,
                    'actualizado'           => $registroReprobado->actualizado ?? 'No',
                    'status_escolar'        => $request->status_escolar,
                    'periodo_estudiante_id' => $periodoEstudianteId,
                    'periodo_escolar'       => $periodo?->nombre_periodo ?? '', // 🔥 Actualizado a nombre_periodo
                ];

                // Flash en sesión para disparar el modal en la vista
                session()->flash('estudiante_retirado', $estudianteData);
            });

            return redirect()->back()->with('success', 'Estudiante retirado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al retirar: ' . $e->getMessage());
        }
    }
    
    /**
     * Obtener datos del estudiante para edición
     */
    public function getStudentData(string $periodoEstudianteId)
    {
        try {
            $ids = explode('-', $periodoEstudianteId);

            if (count($ids) !== 3) {
                return response()->json(['error' => 'ID inválido'], 400);
            }

            $estudianteId = (int)$ids[0];
            $periodoId = (int)$ids[1];
            $gradoId = (int)$ids[2];

            $registro = EstudiantePeriodo::with('estudiante')
                ->where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $gradoId)
                ->firstOrFail();

            return response()->json([
                'periodo_estudiante_id' => $periodoEstudianteId,
                'estudiante_id' => $registro->estudiante_id,
                'name' => $registro->estudiante->name,
                'apellido' => $registro->estudiante->apellido,
                'cedula' => $registro->estudiante->cedula,
                'sexo' => $registro->estudiante->sexo,
                'fecha_de_nacimiento' => $registro->estudiante->fecha_de_nacimiento,
                'apreciacion' => $registro->apreciacion,
                'grado_id' => $registro->grado_id,
                'status' => $registro->status,
                'status_escolar' => $registro->status_escolar,
                'condicion' => $registro->condicion,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
