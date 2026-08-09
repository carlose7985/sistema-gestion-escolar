<?php

namespace App\Http\Controllers\Empleados\Evaluaciones;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\EvaluacionEmpleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluacionesEmpleadosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $mesActual = now()->month;
        $anioActual = $request->anio ?? now()->year;

        $opciones = [1 => '1ER PERIODO', 2 => '2DO PERIODO', 3 => '3ER PERIODO', 4 => '4TO PERIODO'];
        $indiceSugerido = (int) ceil($mesActual / 3);
        $periodoSugerido = $opciones[$indiceSugerido] ?? '1ER PERIODO';
        $periodoActivo = $request->periodo_actual ?? $periodoSugerido;

        // 1. Base de empleados (Filtro base que usas siempre)
        $queryBase = EmpleadoActivo::query()
            ->where('tipo_de_personal', '!=', 'Docente')
            ->where('status_del_cargo', 'Nacional');

        // 2. Conteo Total de Personal
        $totalGeneral = (clone $queryBase)->count();

        // 3. Conteo de Evaluados en este periodo/año específico
        // Buscamos cuántas evaluaciones existen para este periodo y año
        $totalEvaluados = EvaluacionEmpleado::where('periodo_actual', $periodoActivo)
            ->whereYear('fecha_evaluacion', $anioActual)
            ->count();

        // 4. Obtener los datos paginados para la tabla
        $datos = $queryBase
            ->with(['evaluaciones' => function ($query) use ($periodoActivo, $anioActual) {
                $query->where('periodo_actual', $periodoActivo)
                    ->whereYear('fecha_evaluacion', $anioActual);
            }])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombres', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("FIELD(funcion_en_el_plantel, 'Secretaria(0)','Aseador(a)','Vigilante','Cocinera(o)') ASC")
            ->orderBy('id', 'ASC')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Empleados/Evaluaciones/Index', [
            'datos' => $datos,
            'stats' => [
                'total' => $totalGeneral,
                'evaluados' => $totalEvaluados,
                'restantes' => max(0, $totalGeneral - $totalEvaluados),
            ],
            'filters' => [
                'search' => $search,
                'periodo_actual' => $periodoActivo,
                'anio' => $anioActual
            ],
            'periodoSugerido' => $periodoActivo
        ]);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'evaluaciones' => 'required|array|min:1',
            'evaluaciones.*.empleado_id' => 'required|exists:empleado_activos,id',
            'evaluaciones.*.puntuacion' => 'required|numeric|min:0|max:500',
            'evaluaciones.*.periodo_actual' => 'required|string',
            'evaluaciones.*.periodo_evaluacion' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->evaluaciones as $data) {
                EvaluacionEmpleado::create([
                    'empleado_id' => $data['empleado_id'],
                    'puntuacion' => $data['puntuacion'],
                    'periodo_actual' => $data['periodo_actual'],
                    'periodo_evaluacion' => $data['periodo_evaluacion'],
                    'fecha_evaluacion' => now(), // o la fecha que prefieras
                ]);
            }

            DB::commit();
            return back()->with('success', 'Evaluaciones cargadas exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al procesar la carga masiva']);
        }
    }
    public function store(Request $request)
    {
        $request->validate([
            'empleado_id'        => 'required|exists:empleado_activos,id',
            'puntuacion'         => 'required|numeric|min:0|max:500',
            'periodo_actual'     => 'required|string',
            'periodo_evaluacion' => 'required|string',
            'fecha_evaluacion'   => 'required|date',
        ]);

        // Usamos updateOrCreate para que si ya existe el registro del mismo periodo, se actualice la nota
        \App\Models\EvaluacionEmpleado::updateOrCreate(
            [
                'empleado_id'    => $request->empleado_id,
                'periodo_actual' => $request->periodo_actual, // Ejem: "1er Periodo"
            ],
            [
                'puntuacion'         => $request->puntuacion,
                'periodo_evaluacion' => $request->periodo_evaluacion, // Ejem: "Enero-Febrero 2026"
                'fecha_evaluacion'   => $request->fecha_evaluacion,
            ]
        );

        return redirect()->back()->with('success', 'Evaluación procesada con éxito');
    }

    public function gestion(Request $request)
    {
        $periodo = $request->periodo_evaluacion;
        $anio = $request->anio ?? date('Y');
        $search = $request->search; // Para el buscador

        $periodosExistentes = EvaluacionEmpleado::select('periodo_evaluacion')
            ->distinct()
            ->orderBy('periodo_evaluacion', 'asc')
            ->pluck('periodo_evaluacion');

        $evaluaciones = EvaluacionEmpleado::with(['empleado'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('empleado', function ($sq) use ($search) {
                    $sq->where('nombres', 'like', "%$search%")
                        ->orWhere('apellidos', 'like', "%$search%")
                        ->orWhere('cedula', 'like', "%$search%");
                });
            })
            ->when($periodo, fn($q) => $q->where('periodo_evaluacion', $periodo))
            ->when($anio, fn($q) => $q->whereYear('fecha_evaluacion', $anio))
            ->orderBy('fecha_evaluacion', 'desc')
            ->paginate(4)
            ->withQueryString();

        return Inertia::render('Empleados/Evaluaciones/Gestion', [
            'evaluaciones' => $evaluaciones,
            'periodosExistentes' => $periodosExistentes,
            // Pasamos los filtros para que el buscador y el periodo no se borren al recargar
            'filters' => $request->all(['periodo_evaluacion', 'anio', 'search'])
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'puntuacion' => 'required|numeric|min:0|max:500',
            'periodo_actual' => 'required|string',
            'periodo_evaluacion' => 'required|string',
        ]);

        $evaluacion = EvaluacionEmpleado::findOrFail($id);
        $evaluacion->update([
            'puntuacion' => $request->puntuacion,
            'periodo_actual' => $request->periodo_actual,
            'periodo_evaluacion' => $request->periodo_evaluacion,
        ]);

        return redirect()->back()->with('success', 'Evaluación actualizada');
    }


    public function reporteGeneral(Request $request)
    {
        $periodoSeleccionado = $request->query('periodo'); // "ENERO - MARZO 2026"
        $cargoSeleccionado = $request->query('cargo_tipo'); // "Administrativo"
        $anio = $request->query('anio');

        // 1. Obtener Logo
        $logo = \App\Models\Logo::first();

        // 2. Consulta corregida a la columna periodo_evaluacion
        $query = \App\Models\EvaluacionEmpleado::with('empleado')
            ->where('periodo_evaluacion', trim($periodoSeleccionado));

        if ($cargoSeleccionado === 'Administrativo') {
            $query->whereHas('empleado', fn($q) => $q->where('tipo_de_personal', 'Administrativo'));
            $titulo = 'ADMINISTRATIVOS';
        } else {
            $query->whereHas('empleado', fn($q) => $q->whereIn('tipo_de_personal', ['Obrero', 'Cenae', 'Vigilante', 'Aseador(a)', 'Aseador']));
            $titulo = 'OBREROS';
        }

        return Inertia::render('Empleados/Evaluaciones/ReportePdf', [
            'evaluaciones' => $query->get(),
            'institucion'  => \App\Models\Institucion::first(),
            'director'     => \App\Models\EmpleadoActivo::where('funcion_en_el_plantel', 'Director')->first(),
            'titulo_cargo' => $titulo,
            'meta' => [
                'periodo' => '1ER PERIODO', // O el ordinal que corresponda
                'meses' => $periodoSeleccionado,
                'anio' => $anio
            ],
            // Pasamos la URL del logo que definiste en el modelo
            'logoUrl' => $logo ? $logo->logo_documentos_url : asset('img/noImg.png')
        ]);
    }
}
