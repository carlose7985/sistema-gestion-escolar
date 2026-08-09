<?php

namespace App\Http\Controllers\Estudiantes\PeriodoEscolar;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\FechaEntregaDocumento;
use App\Models\MatriculaFinal;
use App\Models\MatriculaInicial;
use App\Models\PeriodoEscolar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PeriodoEscolarController extends Controller
{
    public function index(Request $request)
    {
        // Cambiamos get() por paginate()
        $datos = PeriodoEscolar::orderBy('id', 'desc')->paginate(5);

        return inertia('Estudiantes/PeriodoEscolar/Index', [
            'datos' => $datos,
            'configurado' => PeriodoEscolar::exists(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'periodo_actual' => ['required'],
            'periodo_pasado' => ['required'],
            'proceso_de_inscripcion' => ['required'],
        ]);

        PeriodoEscolar::create($validated);
        return to_route('periodo-escolar.index')->with('success', 'Datos registrados correctamente.');
    }

    public function edit(PeriodoEscolar $periodoescolar)
    {
        return Inertia::render('Estudiantes/PeriodoEscolar/Edit', [
            'periodoescolarData' => $periodoescolar,
        ]);
    }

    public function update(Request $request, int $id)
    {
       
        $periodo = PeriodoEscolar::findOrFail($id);

        $validated = $request->validate([
            'nombre_periodo' => 'required',
            'status_periodo' => 'required',
        ]);

        $periodo->update($validated);

        return to_route('estudiantes.acciones.periodo.escolar.index')->with('success', 'Datos actualizados correctamente.');
    }

    public function toggleInscripcion(Request $request, PeriodoEscolar $periodo_escolar)
    {
        $currentStatus = $periodo_escolar->status_periodo;
     
        $newStatus = ($currentStatus === 'Abierto') ? 'Cerrado' : 'Abierto';

        if ($newStatus === 'Cerrado') {

            return $this->cerrarProceso($request, $periodo_escolar, $newStatus);

        } elseif ($newStatus === 'Abierto') {
            // Llama a openProceso
            $request = new Request(); // Objeto Request vacío
            return $this->abrirProceso($request, $periodo_escolar, $newStatus);
        }

        return redirect()->back()->with('success', 'El proceso de inscripción ha sido ' . $newStatus . ' correctamente.');
    }

    public function cerrarProceso(Request $request, PeriodoEscolar $periodo_escolar, string $newStatus)
    {
        DB::beginTransaction();
        try {
            // ============================================================
            // 1. MATRÍCULA FINAL (Período PASADO - INACTIVO)
            //    Toma solo status Aprobado y Reprobado
            //    SOLO guarda: total_varones, total_hembras, total_general
            // ============================================================
            $periodoPasado = PeriodoHelper::getInactivo();

            if ($periodoPasado) {
                $totalesFinal = DB::table('estudiante_periodos')
                    ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                    ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
                    ->where('estudiante_periodos.periodo_id', $periodoPasado->id)
                    ->whereIn('estudiante_periodos.status', ['Aprobado', 'Reprobado','Graduado'])
                    ->select(
                        'estudiante_periodos.grado_id',
                        'grados.nombre_del_grado',
                        'grados.seccion',
                        DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'M' THEN 1 END) as varones"),
                        DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'F' THEN 1 END) as hembras"),
                        DB::raw("COUNT(*) as total")
                    )
                    ->groupBy('estudiante_periodos.grado_id', 'grados.nombre_del_grado', 'grados.seccion')
                    ->get();

                // Guardar Matrícula Final (SOLO campos que existen en la tabla)
                MatriculaFinal::where('periodo_escolar', $periodoPasado->nombre_periodo)->delete();

                foreach ($totalesFinal as $est) {
                    MatriculaFinal::create([
                        'periodo_escolar'       => $periodoPasado->nombre_periodo,
                        'grado_id'              => $est->grado_id,
                        'nombre_grado_snapshot' => $est->nombre_del_grado . ' ' . ($est->seccion ?: 'U'),
                        'total_varones'         => $est->varones,
                        'total_hembras'         => $est->hembras,
                        'total_general'         => $est->total,
                    ]);
                }
            }

            // ============================================================
            // 2. MATRÍCULA INICIAL (Período ACTIVO)
            //    Toma todos los estudiantes ACTIVOS del nuevo período
            //    Guarda TODOS los campos incluyendo edades
            // ============================================================
            $periodoActivo = PeriodoHelper::getActivo();

            if ($periodoActivo) {
                $queryEdadesInicial = "";
                for ($i = 4; $i <= 16; $i++) {
                    $queryEdadesInicial .= "COUNT(CASE WHEN estudiantes.sexo = 'M' AND TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) = $i THEN 1 END) as v_$i, ";
                    $queryEdadesInicial .= "COUNT(CASE WHEN estudiantes.sexo = 'F' AND TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) = $i THEN 1 END) as h_$i, ";
                }

                $totalesIniciales = DB::table('estudiante_periodos')
                    ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                    ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
                    ->where('estudiante_periodos.periodo_id', $periodoActivo->id)
                    ->where('estudiante_periodos.status', 'Activo')
                    ->select(
                        'estudiante_periodos.grado_id',
                        'grados.nombre_del_grado',
                        'grados.seccion',
                        DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'M' THEN 1 END) as varones"),
                        DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'F' THEN 1 END) as hembras"),
                        DB::raw("COUNT(*) as total"),
                        DB::raw(trim($queryEdadesInicial, ', '))
                    )
                    ->groupBy('estudiante_periodos.grado_id', 'grados.nombre_del_grado', 'grados.seccion')
                    ->get();

                // Guardar Matrícula Inicial (TODOS los campos)
                MatriculaInicial::where('periodo_escolar', $periodoActivo->nombre_periodo)->delete();

                foreach ($totalesIniciales as $est) {
                    $data = [
                        'periodo_escolar'       => $periodoActivo->nombre_periodo,
                        'grado_id'              => $est->grado_id,
                        'nombre_grado_snapshot' => $est->nombre_del_grado . ' ' . ($est->seccion ?: 'U'),
                        'total_varones'         => $est->varones,
                        'total_hembras'         => $est->hembras,
                        'total_general'         => $est->total,
                    ];

                    for ($i = 4; $i <= 16; $i++) {
                        $data["v_$i"] = $est->{"v_$i"} ?? 0;
                        $data["h_$i"] = $est->{"h_$i"} ?? 0;
                    }

                    MatriculaInicial::create($data);
                }
            }

            // ============================================================
            // 3. ACTUALIZAR ESTATUS DEL PERÍODO
            // ============================================================
            $periodo_escolar->update([
                'status_periodo' => $newStatus
            ]);

            // ============================================================
            // 4. ASEGURAR QUE TODOS LOS ESTUDIANTES DE ESTE PERÍODO ESTÉN ACTIVOS
            // ============================================================
            DB::table('estudiante_periodos')
                ->where('periodo_id', $periodo_escolar->id)
                ->where('status', '!=', 'Activo')
                ->update(['status' => 'Activo']);

            FechaEntregaDocumento::query()->delete();

            DB::commit();

            return redirect()->route('recursos.asistencia.estudiantes.index')->with('success', 'Matrícula Final e Inicial consolidadas y proceso actualizado a ' . $newStatus);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al cerrar proceso: ' . $e->getMessage());
        }
    }

    public function abrirProceso(Request $request, PeriodoEscolar $periodo_escolar)
    {
        $current_periodo_actual = $periodo_escolar->nombre_periodo; // Ej: "2025-2026"
        $periodoActivoId = $periodo_escolar->id;

        // Calcular nuevo período
        list($startYear, $endYear) = explode('-', $current_periodo_actual);
        $new_periodo_actual = ((int)$startYear + 1) . '-' . ((int)$endYear + 1); // Ej: "2026-2027"

        DB::beginTransaction();

        try {
            // 🔥 1. CREAR NUEVO PERÍODO ESCOLAR
            $nuevoPeriodo = PeriodoEscolar::create([
                'nombre_periodo' => $new_periodo_actual,
                'status_periodo' => 'Abierto',
                'status' => 'Activo',
                'inscribe' => 'Si',
            ]);

            // 🔥 2. CORREGIDO: Marcar TODOS los períodos Inactivo como Finalizado
            PeriodoEscolar::where('status', 'Inactivo')->update([
                'status' => 'Finalizado',
            ]);

            // 🔥 3. ACTUALIZAR EL PERÍODO ACTUAL A CULMINADO/INACTIVO
            $periodo_escolar->update([
                'status_periodo' => 'Culminado',
                'status' => 'Inactivo',
            ]);

            DB::commit();
           

            return redirect()->back()->with(
                'success',
                'Ciclo escolar cerrado. Nuevo período ' . $new_periodo_actual . ' creado con éxito.'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error crítico: ' . $e->getMessage());
        }
    }
}
