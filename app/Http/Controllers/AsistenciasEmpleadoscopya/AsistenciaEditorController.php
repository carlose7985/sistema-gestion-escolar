<?php

namespace App\Http\Controllers\Empleados\AsistenciasEmpleados;

use App\Http\Controllers\Controller;
use App\Models\AsistenciaEmpleado;
use App\Models\EmpleadoActivo;
use App\Models\Totalempleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class AsistenciaEditorController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('m'));
        $year = $request->input('year', now()->format('Y'));
        $day = $request->input('day'); // Puede ser null
        $search = $request->input('search');

        $query = EmpleadoActivo::query()
            ->orderByRaw($this->getOrdenJerarquicoSql());

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ["%{$search}%"]);
            })->with(['asistencias' => function ($q) use ($month, $year, $day) {
                $q->whereYear('fecha', $year)
                    ->whereMonth('fecha', $month)
                    ->when($day, function ($query) use ($day) {
                        return $query->whereDay('fecha', $day);
                    })
                    ->orderBy('fecha', 'asc');
            }]);

            $empleados = $query->paginate(50)->withQueryString();
        } else {
            $query->withCount(['asistencias' => function ($q) use ($month, $year, $day) {
                $q->whereYear('fecha', $year)
                    ->whereMonth('fecha', $month)
                    ->when($day, function ($query) use ($day) {
                        return $query->whereDay('fecha', $day);
                    })
                    ->whereRaw('DAYOFWEEK(fecha) NOT IN (1, 7)');
            }]);

            $empleados = $query->paginate(5)->withQueryString();
        }

        return Inertia::render('Empleados/Asistencias/ActualizarAsistencias', [
            'empleados' => $empleados,
            'filters' => [
                'search' => $search,
                'month' => $month,
                'year' => $year,
                'day' => $day ?? ""
            ]
        ]);
    }
    /**
     * Vista para actualizar asistencias (corrección manual)
     */
    public function actualizar(Request $request)
    {
        $fecha = $request->input('fecha', now()->toDateString());
        $search = $request->input('search', '');

        $query = EmpleadoActivo::query()
            ->with(['asistencias' => function ($q) use ($fecha) {
                $q->where('fecha', $fecha);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'LIKE', "%{$search}%")
                    ->orWhere('apellidos', 'LIKE', "%{$search}%")
                    ->orWhere('cedula', 'LIKE', "%{$search}%");
            });
        }

        $empleados = $query->orderBy('tipo_de_personal')
            ->orderBy('nombres')
            ->paginate(15);

        return Inertia::render('Empleados/Asistencias/ActualizarAsistencias', [
            'empleados' => $empleados,
            'fechaSeleccionada' => $fecha,
            'filters' => ['search' => $search],
        ]);
    }

    public function update(Request $request)
    {
       
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id',
            'fecha' => 'required|date',
            'status' => 'required|in:Asistio,Falto,Permiso',
        ]);

        $empleadoId = $request->input('empleado_id');
        $fecha = $request->input('fecha');
        $nuevoStatus = $request->input('status');

        DB::transaction(function () use ($empleadoId, $fecha, $nuevoStatus) {

            // 1. Buscamos al empleado para saber a qué categoría (tipo_de_personal) pertenece
            $empleado = EmpleadoActivo::findOrFail($empleadoId);
            $tipoPersonal = $empleado->tipo_de_personal;

            // 2. Actualizar o Crear la asistencia (YA NO enviamos tipo_de_cargo)
            AsistenciaEmpleado::updateOrCreate(
                [
                    'empleado_id' => $empleadoId,
                    'fecha'       => $fecha
                ],
                [
                    'status' => $nuevoStatus
                ]
            );

            // 3. RECALCULAR TOTALES PARA ESA CATEGORÍA Y FECHA

            // A. Totales Existentes (Censo real de empleados activos en esa categoría)
            $existentes = EmpleadoActivo::where('tipo_de_personal', $tipoPersonal)
                ->selectRaw('COUNT(*) as total, 
                SUM(CASE WHEN sexo LIKE "M%" THEN 1 ELSE 0 END) as varones,
                SUM(CASE WHEN sexo LIKE "F%" THEN 1 ELSE 0 END) as hembras')
                ->first();

            // B. Totales Asistentes (Relacionando Asistencia con Empleados para filtrar por categoría)
            $asistentes = DB::table('asistencia_empleados')
                ->join('empleado_activos', 'asistencia_empleados.empleado_id', '=', 'empleado_activos.id')
                ->where('asistencia_empleados.fecha', $fecha)
                ->where('asistencia_empleados.status', 'Asistio')
                ->where('empleado_activos.tipo_de_personal', $tipoPersonal) // Filtro por la categoría del empleado
                ->selectRaw('COUNT(*) as total, 
                SUM(CASE WHEN empleado_activos.sexo LIKE "M%" THEN 1 ELSE 0 END) as varones,
                SUM(CASE WHEN empleado_activos.sexo LIKE "F%" THEN 1 ELSE 0 END) as hembras')
                ->first();

            // 4. Actualizar la tabla de resumen (Totalempleado)
            Totalempleado::updateOrCreate(
                [
                    'fecha_registro'   => $fecha,
                    'tipo_de_personal' => $tipoPersonal
                ],
                [
                    'varones_existentes' => $existentes->varones ?? 0,
                    'hembras_existentes' => $existentes->hembras ?? 0,
                    'total_existentes'   => $existentes->total ?? 0,
                    'varones_asistentes' => $asistentes->varones ?? 0,
                    'hembras_asistentes' => $asistentes->hembras ?? 0,
                    'total_asistentes'   => $asistentes->total ?? 0,
                ]
            );
        });

        return back()->with('success', 'Asistencia y totales globales actualizados.');
    }
    private function getOrdenJerarquicoSql()
    {
        return "FIELD(funcion_en_el_plantel, 
        'Director', 
        'Subdirector', 
        'Coordinador', 
        'Docente Especialista', 
        'Docente de aula', 
        'Secretaria(o)', 
        'Aseador(a)', 
        'Cocinera(o)',
        'Vigilante',
        'Sin Asignacion'
    )";
    }
}
