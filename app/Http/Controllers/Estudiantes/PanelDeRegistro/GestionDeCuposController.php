<?php

namespace App\Http\Controllers\Estudiantes\PanelDeRegistro;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCuposRequest;
use App\Http\Requests\UpdateCuposRequest;
use App\Models\CupoEstudiante;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GestionDeCuposController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $periodoActivo = PeriodoHelper::getActivo();
        $periodoActualTexto = $periodoActivo->nombre_periodo;
        $periodoId = $periodoActivo->id;

        // Calcular período próximo
        $periodoProximoTexto = $this->calcularPeriodoProximo($periodoActualTexto);
        // 🔥 Obtener TODOS los grados con sus cupos disponibles (sin filtrar)
        $gradosConCupos = $this->calcularCuposDisponiblesPorGrado($periodoId);
        // Obtener grados para el select del modal
        $grados = Grado::select('id', 'nombre_del_grado', 'seccion')->get();

        $estudiantes = CupoEstudiante::with('grado') // Cargamos la relación del grado
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('Estudiantes/GestionDeCupos/Index', [
            'datos' => $estudiantes,
            'grados' => $grados, // Para el formulario
            'periodo_actual' => $periodoActualTexto,
            'periodo_proximo' => $periodoProximoTexto,
            'gradosConCupos' => $gradosConCupos,
            'periodo_id' => $periodoId,
            'status_periodo' => $periodoActivo->status_periodo,
            'filters' => ['search' => $search],
        ]);
    }   
   
    private function calcularPeriodoProximo(string $periodoActual)
    {
        // Dividir el período en año inicial y año final
        $parts = explode('-', $periodoActual);

        if (count($parts) === 2) {
            $añoInicial = (int) $parts[0];
            $añoFinal = (int) $parts[1];

            // Incrementar ambos años en 1
            $nuevoInicial = $añoInicial + 1;
            $nuevoFinal = $añoFinal + 1;

            return $nuevoInicial . '-' . $nuevoFinal;
        }
    }

    private function calcularCuposDisponiblesPorGrado(int $periodoId): array
    {
        // 1. Obtener todos los grados con su límite
        $grados = Grado::select('id', 'nombre_del_grado', 'seccion', 'limite_de_estudiantes')->get();

        // 2. Obtener estudiantes con status Pendiente en cupo_estudiantes (agrupados por grado)
        $pendientesPorGrado = DB::table('cupo_estudiantes')
            ->where('status', 'Pendiente')
            ->where('periodo_escolar', $periodoId)
            ->select('grado_id', DB::raw('COUNT(*) as total_pendientes'))
            ->groupBy('grado_id')
            ->pluck('total_pendientes', 'grado_id');

        // 3. Obtener estudiantes ACTIVOS en estudiante_periodos para el período activo
        $activosPorGrado = DB::table('estudiante_periodos')
            ->where('periodo_id', $periodoId)
            ->where('status', 'Activo')
            ->select('grado_id', DB::raw('COUNT(*) as total_activos'))
            ->groupBy('grado_id')
            ->pluck('total_activos', 'grado_id');

        // 🔥 4. Verificar si existen estudiantes Activos en el período activo
        $totalActivos = $activosPorGrado->sum();

        $aprobadosPorGrado = collect();
        $reprobadosPorGrado = collect();

        // 🔥 5. SOLO si NO hay estudiantes Activos, buscar en período anterior
        if ($totalActivos === 0) {
            // Buscar período anterior (status Inactivo o Finalizado)
            $periodoAnterior = PeriodoEscolar::whereIn('status', ['Inactivo'])
                ->orderBy('id', 'desc')
                ->first();

            if ($periodoAnterior) {
                // 5a. Obtener estudiantes APROBADOS del período anterior (excluyendo 6to grado)
                $aprobadosPorGrado = DB::table('estudiante_periodos')
                    ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
                    ->where('estudiante_periodos.periodo_id', $periodoAnterior->id)
                    ->where('estudiante_periodos.status', 'Aprobado')
                    ->where('grados.nombre_del_grado', '!=', '6to Grado')
                    ->select(
                        'estudiante_periodos.grado_id',
                        DB::raw('COUNT(*) as total_aprobados')
                    )
                    ->groupBy('estudiante_periodos.grado_id')
                    ->pluck('total_aprobados', 'grado_id');

                // 5b. Obtener estudiantes REPROBADOS del período anterior (excluyendo Inasistente)
                $reprobadosPorGrado = DB::table('estudiante_periodos')
                    ->where('estudiante_periodos.periodo_id', $periodoAnterior->id)
                    ->where('estudiante_periodos.status', 'Reprobado')
                    ->where('estudiante_periodos.apreciacion', '!=', 'Inasistente')
                    ->select('grado_id', DB::raw('COUNT(*) as total_reprobados'))
                    ->groupBy('grado_id')
                    ->pluck('total_reprobados', 'grado_id');
            }
        }

        // 6. Calcular cupos disponibles por grado
        $resultado = [];

        foreach ($grados as $grado) {
            $limite = (int) $grado->limite_de_estudiantes;

            // Sumar ocupados
            $pendientes = (int) ($pendientesPorGrado[$grado->id] ?? 0);
            $activos = (int) ($activosPorGrado[$grado->id] ?? 0);
            $aprobados = (int) ($aprobadosPorGrado[$grado->id] ?? 0);
            $reprobados = (int) ($reprobadosPorGrado[$grado->id] ?? 0);

            // 🔥 Si hay activos, NO se suman aprobados ni reprobados del período anterior
            // Si NO hay activos, se suman aprobados del grado siguiente y reprobados del grado actual
            $ocupados = $activos + $pendientes + $reprobados;

            $disponibles = max(0, $limite - $ocupados);

            $resultado[] = [
                'id' => $grado->id,
                'nombre_del_grado' => $grado->nombre_del_grado,
                'seccion' => $grado->seccion,
                'limite' => $limite,
                'ocupados' => $ocupados,
                'pendientes' => $pendientes,
                'activos' => $activos,
                'aprobados' => $aprobados,
                'reprobados' => $reprobados,
                'disponibles' => $disponibles,
                'tiene_cupo' => $disponibles > 0,
                'tiene_activos' => $activos > 0, // 🔥 Indicador de si hay activos en este grado
            ];
        }

        return $resultado;
    }

    public function store(StoreCuposRequest $request)
    {
        $validated = $request->validated();
        $validated['fecha_registro'] = now();

        CupoEstudiante::create($validated);
        return redirect()->back()->with('success', 'Datos registrados correctamente.');
    }


    public function update(UpdateCuposRequest $request, int $id)
    {
        // dd($id);
        $validated = $request->validated();

        $gestion_de_cupo = CupoEstudiante::findOrFail($id);
        $gestion_de_cupo->update($validated);

        return redirect()->back()->with('success', 'Datos actualizados correctamente.');
    }

    /**
     * Función Pivote para cambiar estatus (Sustituye a destroy o se añade como nueva)
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:Pendiente,Inscrito,Vencido'
        ]);

        $cupo = CupoEstudiante::findOrFail($id);
        $cupo->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Estatus del cupo actualizado.');
    }


}
