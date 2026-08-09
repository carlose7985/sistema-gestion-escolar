<?php

namespace App\Http\Controllers\Empleados\DocentesGuardias;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\GuardiaFormacion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GuardiasDocenteController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $docentes = EmpleadoActivo::select('id', 'nombres', 'apellidos')
            ->get();

        $asignaciones = GuardiaFormacion::where('mes', $month)
            ->where('anio', $year)
            ->get();

        // Inicializamos la matriz siempre como arrays vacíos
        $matriz = [];
        foreach ($asignaciones as $guardia) {
            $matriz[$guardia->item][$guardia->dia_semana][] = $guardia->empleado_id;
        }

        return Inertia::render('Empleados/DocentesGuardias/Index', [
            'docentes' => $docentes,
            'matrizAsignaciones' => $matriz,
            'filters' => ['month' => (int)$month, 'year' => (int)$year],
            'items' => ['Oración', 'Himno', 'Efemérides', 'Formación', 'Pasillo'],
            'dias' => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        ]);
    }
  
    public function store(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'dia_semana' => 'required|string',
            'item' => 'required|string',
            'empleado_ids' => 'present|array',
        ]);

        $ids = $request->empleado_ids;

        // Verificar si es modo "todos" (contiene null)
        $isAllMode = in_array(null, $ids) && $request->item === 'Formación';

        // --- VALIDACIÓN DE CONFLICTOS (solo si no es modo todos) ---
        if (!$isAllMode && $request->item !== 'Pasillo') {
            foreach ($ids as $id) {
                // Buscamos si el docente ya tiene OTRA guardia que NO sea Pasillo
                $conflicto = GuardiaFormacion::where('mes', $request->month)
                    ->where('anio', $request->year)
                    ->where('empleado_id', $id)
                    ->where('item', '!=', 'Pasillo') // Ignoramos Pasillo porque es libre
                    ->first();

                if ($conflicto) {
                    // Solo disparamos el error si el conflicto es en un ITEM diferente o un DÍA diferente
                    if ($conflicto->item !== $request->item || $conflicto->dia_semana !== $request->dia_semana) {
                        $docente = EmpleadoActivo::find($id);
                        return back()->with('conflicto', "El docente {$docente->nombres} ya está asignado a '{$conflicto->item}' el día {$conflicto->dia_semana}. Solo puede repetir guardias en el sector Pasillo.");
                    }
                }
            }
        }
       
        // --- GUARDADO ---
        DB::transaction(function () use ($request, $ids, $isAllMode) {
            // 1. Borrar asignaciones actuales
            GuardiaFormacion::where('mes', $request->month)
                ->where('anio', $request->year)
                ->where('dia_semana', $request->dia_semana)
                ->where('item', $request->item)
                ->delete();

            // 2. Insertar nuevos registros
            if ($isAllMode) {
                // Modo "todos": crear un solo registro con empleado_id = null
                GuardiaFormacion::create([
                    'mes' => $request->month,
                    'anio' => $request->year,
                    'dia_semana' => $request->dia_semana,
                    'item' => $request->item,
                    'empleado_id' => null
                ]);
            } else {
                // Modo normal: insertar cada docente individual
                foreach ($ids as $id) {
                    if ($id !== null) { // Evitar insertar nulls en modo normal
                        GuardiaFormacion::create([
                            'mes' => $request->month,
                            'anio' => $request->year,
                            'dia_semana' => $request->dia_semana,
                            'item' => $request->item,
                            'empleado_id' => $id
                        ]);
                    }
                }
            }
        });

        return back()->with('success', 'Guardias actualizadas correctamente.');
    }
}
