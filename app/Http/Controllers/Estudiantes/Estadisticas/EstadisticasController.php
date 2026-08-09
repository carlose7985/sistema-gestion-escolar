<?php

namespace App\Http\Controllers\Estudiantes\Estadisticas;

use App\Helpers\CierreHelper;
use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\AsistenciaEstudiante;
use App\Models\CierreMensual;
use App\Models\Estadistica;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\HistorialEstadistica;
use App\Models\MatriculaEstadistica;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class EstadisticasController extends Controller
{


    public function index(Request $request)
    {
        $monthYearInput = $request->input('month_year');

        // Lógica para estadística
        $estadistica = null;
        if ($monthYearInput) {
            $date = Carbon::parse($monthYearInput);
            $estadistica = Estadistica::whereYear('fecha', $date->year)
                ->whereMonth('fecha', $date->month)
                ->first();
        }

        // OBTENER GRADOS ACTUALIZADO - usando estudiante_periodos
        $grades = $this->getGradesWithStatus($monthYearInput);

        // Alertas (sin cambios)
        Carbon::setLocale('es');
        $currentDate = Carbon::now();
        $estadisticaForCurrentMonth = Estadistica::whereYear('fecha', $currentDate->year)
            ->whereMonth('fecha', $currentDate->month)
            ->first();

        $esMesEspecialActual = in_array($currentDate->month, [7, 12]);
        $mostrarAlertaMesEspecial = $esMesEspecialActual && !$estadisticaForCurrentMonth;

        $mesAnterior = $currentDate->copy()->subMonth();
        $hayAsistenciasMesAnterior = AsistenciaEstudiante::whereYear('fecha', $mesAnterior->year)
            ->whereMonth('fecha', $mesAnterior->month)
            ->exists();
        $hayEstadisticasMesAnterior = Estadistica::whereYear('fecha', $mesAnterior->year)
            ->whereMonth('fecha', $mesAnterior->month)
            ->exists();
        $mostrarAlertaMesAnterior = $hayAsistenciasMesAnterior && !$hayEstadisticasMesAnterior;

        // Meses disponibles (sin cambios)
        $availableMonths = Estadistica::select(DB::raw('DISTINCT YEAR(fecha) as year, MONTH(fecha) as month'))
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($date) {
                return [
                    'value' => Carbon::createFromDate($date->year, $date->month, 1)->format('Y-m'),
                    'label' => Carbon::createFromDate($date->year, $date->month, 1)->isoFormat('MMMM YYYY'),
                ];
            });

        return Inertia::render("Estudiantes/Estadisticas/Index", [
            'selectedMonthInitial' => $monthYearInput,
            'grades' => $grades,
            'estadistica' => $estadistica,
            'availableMonths' => $availableMonths,
            'mostrarAlertaMesAnterior' => $mostrarAlertaMesAnterior,
            'mostrarAlertaMesEspecial' => $mostrarAlertaMesEspecial,
            'mesAnteriorNombre' => $mesAnterior->translatedFormat('F'),
            'anioAnterior' => $mesAnterior->year,
            'mesActualNombre' => $currentDate->translatedFormat('F'),
            'anioActual' => $currentDate->year,
            'esMesEspecialActual' => $esMesEspecialActual,
            'puederRealizarCorteEspecial' => !$estadisticaForCurrentMonth,
            'fechaHoy' => $currentDate->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $inputDate = Carbon::parse($request->fecha);
        $year = $inputDate->year;
        $month = $inputDate->month;

        // 1. Verificar duplicado
        $existingEstadistica = Estadistica::whereYear('fecha', $year)
            ->whereMonth('fecha', $month)
            ->count();
        if ($existingEstadistica >= 1) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Ya existe una estadística para el mes y año seleccionados.');
        }

        // 2. Verificar secuencia
        $ultimaEstadistica = Estadistica::latest('fecha')->first();
        if ($ultimaEstadistica) {
            $fechaUltimaEstadistica = Carbon::parse($ultimaEstadistica->fecha);
            $mesSiguienteEsperado = $fechaUltimaEstadistica->copy()->addMonth()->startOfMonth();
            if (!$inputDate->isSameMonth($mesSiguienteEsperado) || !$inputDate->isSameYear($mesSiguienteEsperado)) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Solo se pueden registrar estadísticas para el mes siguiente al último registrado.');
            }
        }

        DB::transaction(function () use ($request) {
            // 1. Crear estadística principal
            $nuevaEstadistica = Estadistica::create([
                'fecha' => $request->fecha,
                'dias_habiles' => $request->dias_habiles,
                'dias_laborados' => $request->dias_laborados,
                'status' => 'Activo',
            ]);

            // 2. Obtener período activo usando el Helper
            $periodoActivoId = PeriodoHelper::getActivoId();
            if (!$periodoActivoId) {
                throw new \Exception('No hay un período escolar activo configurado.');
            }

            // 3. CONSULTA ACTUALIZADA: Estudiantes del período activo
            $totales = DB::table('estudiante_periodos as ep')
                ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
                ->where('ep.periodo_id', $periodoActivoId)
                ->where('ep.status', 'Activo')
                ->select(
                    'ep.grado_id',
                    'e.sexo',
                    DB::raw("TIMESTAMPDIFF(YEAR, e.fecha_de_nacimiento, '{$request->fecha}') as edad"),
                    DB::raw('count(*) as cantidad')
                )
                ->groupBy('ep.grado_id', 'e.sexo', 'edad')
                ->get();

            // 4. Guardar resúmenes en matricula_estadisticas
            foreach ($totales as $fila) {
                MatriculaEstadistica::create([
                    'estadistica_id' => $nuevaEstadistica->id,
                    'grado_id' => $fila->grado_id,
                    'sexo' => $fila->sexo,
                    'edad' => $fila->edad,
                    'cantidad' => $fila->cantidad,
                    'fecha_registro' => $request->fecha,
                    'periodo_escolar' => PeriodoHelper::getActivoNombrePeriodo(),
                ]);
            }

            // ============================================================
            // 5. CERRAR MES ACTUAL Y ABRIR NUEVO MES
            // ============================================================
            $mesActual = $request->mes_actual ?? now()->month;
            $anioActual = $request->anio_actual ?? now()->year;

            $nuevoMes = $request->mes_nuevo ?? now()->addMonth()->month;
            $nuevoAnio = $request->anio_nuevo ?? now()->addMonth()->year;

            // Cerrar el mes que está Abierto
            $mesAbierto = CierreMensual::where('estado', 'Abierto')->first();
            if ($mesAbierto) {
                $mesAbierto->update([
                    'estado' => 'Cerrado',
                    'fecha_cierre' => now(),
                ]);
            }

            // Crear o abrir el nuevo mes
            $existeNuevoMes = CierreMensual::where('mes', $nuevoMes)
                ->where('anio', $nuevoAnio)
                ->first();

            if (!$existeNuevoMes) {
                CierreMensual::create([
                    'mes' => $nuevoMes,
                    'anio' => $nuevoAnio,
                    'estado' => 'Abierto',
                    'fecha_cierre' => null,
                ]);
            } else {
                $existeNuevoMes->update([
                    'estado' => 'Abierto',
                    'fecha_cierre' => null,
                ]);
            }
            // ============================================================
        });

        return redirect()->back()->with('success', 'Estadística consolidada exitosamente y nuevo mes abierto.');
    }

    public function show(Request $request)
    {

        $query = Estadistica::orderBy('id', 'desc')->latest();

        if ($request->has('search') && $request->search != null) {
            $query->whereAny(['fecha'], 'like', '%' . $request->search . '%');
        }
        $datos = $query->paginate(6)->toArray();
        return Inertia::render('Estudiantes/Estadisticas/Show', [
            'datos' => $datos,
        ]);
    }

    public function update(Request $request, Estadistica $estadistica_estudiante)
    {
        dd($estadistica_estudiante);
        $request->validate([
            'fecha' => 'required|date',
            'dias_habiles' => 'required|integer|min:1',
            // Validación: laborados no pueden ser mayores a los hábiles
            'dias_laborados' => 'required|integer|min:0',
        ]);

        try {
            // Usamos una transacción para asegurar que ambas tablas se actualicen o ninguna
            DB::beginTransaction();

            // 1. Actualizar la estadística principal
            $estadistica_estudiante->update($request->all());

            // 2. Sincronizar la fecha en MatriculaEstadistica
            // Buscamos todos los registros que pertenecen a esta estadística específica
            // y actualizamos su fecha_registro con la nueva fecha recibida.
            MatriculaEstadistica::where('estadistica_id', $estadistica_estudiante->id)
                ->update([
                    'fecha_registro' => $request->fecha
                ]);

            DB::commit();

            return redirect()->back()->with('success', 'Estadística y registros mensuales actualizados correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            // Es recomendable loguear el error para depuración
            // \Log::error("Error actualizando estadística: " . $e->getMessage());

            return redirect()->back()->with('error', 'Error al actualizar la estadística: ' . $e->getMessage());
        }
    }
    /**
     * Obtiene los grados y calcula el estatus de impresión basado en el mes seleccionado.
     * Si no hay mes seleccionado, el estatus es siempre 0.
     */
    private function getGradesWithStatus(?string $monthYearInput)
    {
        $historiales = collect();

        if ($monthYearInput) {
            $date = Carbon::parse($monthYearInput);
            $historiales = HistorialEstadistica::whereYear('fecha', $date->year)
                ->whereMonth('fecha', $date->month)
                ->get()
                ->keyBy('grado_id');
        }

        // OBTENER PERÍODO ACTIVO
        $periodoActivoId = PeriodoHelper::getActivoId();

        return Grado::orderBy('id', 'asc')
            ->get()
            ->map(function ($grado) use ($historiales, $monthYearInput, $periodoActivoId) {
                // CONTAR ESTUDIANTES ACTIVOS EN EL PERÍODO ACTUAL
                $totalStudents = EstudiantePeriodo::where('periodo_id', $periodoActivoId)
                    ->where('grado_id', $grado->id)
                    ->where('status', 'Activo')
                    ->count();

                $maleStudents = EstudiantePeriodo::where('periodo_id', $periodoActivoId)
                    ->where('grado_id', $grado->id)
                    ->where('status', 'Activo')
                    ->whereHas('estudiante', function ($query) {
                        $query->where('sexo', 'M');
                    })
                    ->count();

                $femaleStudents = EstudiantePeriodo::where('periodo_id', $periodoActivoId)
                    ->where('grado_id', $grado->id)
                    ->where('status', 'Activo')
                    ->whereHas('estudiante', function ($query) {
                        $query->where('sexo', 'F');
                    })
                    ->count();

                // Lógica de contador de impresiones (sin cambios)
                $contador = 0;
                if ($monthYearInput && $historiales->has($grado->id)) {
                    $contador = $historiales->get($grado->id)->contador;
                }

                return [
                    'id' => $grado->id,
                    'nombre_del_grado' => $grado->nombre_del_grado,
                    'seccion' => $grado->seccion,
                    'docente' => $grado->docente,
                    'total_students' => $totalStudents,
                    'male_students' => $maleStudents,
                    'female_students' => $femaleStudents,
                    'status_estadistica' => intval($contador),
                ];
            });
    }

    public function apertura(Request $request)
    {

        $mes = (int) $request->mes;
        $anio = (int) $request->anio;

        // Verificar si ya hay registros
        if (!CierreHelper::tablaVacia()) {
            return back()->with('error' , 'Ya existe una configuración de apertura.');
        }

        // Crear el primer mes abierto
        $cierre = CierreHelper::crearPrimerMes($mes, $anio);

        $nombreMes = Carbon::createFromDate($anio, $mes, 1)->translatedFormat('F Y');

        return back()->with('success', 'Ciclo de cierre iniciado en {$nombreMes}');
    }
   
}
