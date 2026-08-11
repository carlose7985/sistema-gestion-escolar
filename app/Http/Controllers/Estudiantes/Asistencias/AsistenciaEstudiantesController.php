<?php

namespace App\Http\Controllers\Estudiantes\Asistencias;

use App\Helpers\CierreHelper;
use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\AsistenciaEstudiante;
use App\Models\CierreMensual;
use App\Models\DiaFestivo;
use App\Models\Grado;
use App\Models\TotalEstudiante;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AsistenciaEstudiantesController extends Controller
{

    public function index(Request $request)
    {
        // 1. DETERMINAR EL PERÍODO ACTIVO
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()
                ->with('error', 'No se encontró un período escolar activo para gestionar la asistencia.');
        }

        $periodoAsistencia = $periodoActivo;

        // 2. VERIFICAR SI EL PERÍODO ACTIVO ESTÁ ABIERTO
        if ($periodoAsistencia->status_periodo === 'Abierto') {
            return Inertia::render('Estudiantes/Asistencias/Index', [
                'mostrarModalCierrePeriodo' => true,
                'periodoActivo' => $periodoAsistencia,
                'periodoNombre' => $periodoAsistencia->nombre_periodo,
                'statusCierre' => null,
                'fechaSeleccionada' => now()->toDateString(),
                'grados' => [],
                'gradoEstudiantesCounts' => [],
                'asistenciaExistenteHoy' => false,
                'asistenciaDataInitial' => [],
                'fechasFaltantes' => [],
                'isWeekend' => false,
                'isHoliday' => false,
                'holidayDescription' => null,
                'esPeriodoAnterior' => false,
                'mostrarModalConfiguracionInicial' => false,
                'mesSugerido' => null,
                'anioSugerido' => null,
                'mesBloqueado' => false,
            ]);
        }

        // 3. VALIDACIÓN: Estudiantes aptos para tomar asistencia
        $hayEstudiantesAptos = DB::table('estudiante_periodos')
            ->where('periodo_id', $periodoAsistencia->id)
            ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado'])
            ->exists();

        if (!$hayEstudiantesAptos) {
            return redirect()->route('estudiantes.activos.listado.index')
                ->with('error', '⚠️ No hay estudiantes con estatus Activo, Aprobado o Reprobado en el período actual.');
        }

        // 4. CONFIGURACIÓN INICIAL
        if (CierreHelper::tablaVacia()) {
            return Inertia::render('Estudiantes/Asistencias/Index', [
                'mostrarModalConfiguracionInicial' => true,
                'mostrarModalCierrePeriodo' => false,
                'mesSugerido' => now()->month,
                'anioSugerido' => now()->year,
                'periodoActivo' => $periodoAsistencia,
                'periodoNombre' => $periodoAsistencia->nombre_periodo,
                'statusCierre' => null,
                'fechaSeleccionada' => now()->toDateString(),
                'grados' => [],
                'gradoEstudiantesCounts' => [],
                'asistenciaExistenteHoy' => false,
                'asistenciaDataInitial' => [],
                'fechasFaltantes' => [],
                'isWeekend' => false,
                'isHoliday' => false,
                'holidayDescription' => null,
                'esPeriodoAnterior' => false,
                'mesBloqueado' => false,
            ]);
        }

        // 5. VERIFICACIÓN DE CIERRE MENSUAL PENDIENTE
        $mesAbierto = CierreMensual::where('estado', 'Abierto')->first();

        if ($mesAbierto) {
            $mesActual = now()->month;
            $anioActual = now()->year;

            if ($mesAbierto->mes != $mesActual || $mesAbierto->anio != $anioActual) {
                return redirect()->route('estudiantes.acciones.estadisticas.index')
                    ->with('error', 'Debe cerrar las estadísticas del mes pasado.');
            }
        }

        // 6. LÓGICA DE FECHAS Y DÍAS FESTIVOS
        $fechaSeleccionada = $this->procesarFechaSeleccionada($request);
        $selectedDateString = $fechaSeleccionada->toDateString();
        $feriado = DiaFestivo::where('fecha', $selectedDateString)->first();
        $isHoliday = !is_null($feriado);
        $statusCierre = \App\Services\AsistenciaService::verificarCierreMesAnterior($fechaSeleccionada);

        // ============================================================
        // 🔥 NUEVO: VERIFICAR SI EL MES ESTÁ CERRADO EN cierres_mensuales
        // ============================================================
        $mes = $fechaSeleccionada->month;
        $anio = $fechaSeleccionada->year;
        $mesBloqueado = CierreHelper::mesCerrado($mes, $anio);
        // ============================================================

        // 7. CONTEO DE ESTUDIANTES
        $grados = $this->obtenerGradosConConteoEstudiantes($periodoAsistencia->id);
        $gradoEstudiantesCounts = $this->mapearConteoEstudiantesPorGrado($grados);

        // 8. DATOS DE ASISTENCIA
        $asistencias = $this->obtenerAsistenciasPorFecha($selectedDateString);
        $asistenciaExistenteHoy = $asistencias->isNotEmpty();
        $asistenciaDataInitial = $this->prepararDatosAsistencia($grados, $asistencias, $asistenciaExistenteHoy);

        return Inertia::render('Estudiantes/Asistencias/Index', [
            'mostrarModalCierrePeriodo' => false,
            'mostrarModalConfiguracionInicial' => false,
            'statusCierre' => $statusCierre,
            'fechaSeleccionada' => $selectedDateString,
            'grados' => $grados,
            'gradoEstudiantesCounts' => $gradoEstudiantesCounts,
            'asistenciaExistenteHoy' => $asistenciaExistenteHoy,
            'asistenciaDataInitial' => $asistenciaDataInitial,
            'fechasFaltantes' => $this->obtenerFechasFaltantes($selectedDateString),
            'isWeekend' => $fechaSeleccionada->isWeekend(),
            'isHoliday' => $isHoliday,
            'holidayDescription' => $isHoliday ? $feriado->descripcion : null,
            'periodoNombre' => $periodoAsistencia->nombre_periodo,
            'esPeriodoAnterior' => false,
            'periodoActivo' => $periodoAsistencia,
            'mesSugerido' => null,
            'anioSugerido' => null,
            'mesBloqueado' => $mesBloqueado, // 🔥 NUEVA PROP
        ]);
    }

    private function obtenerGradosConConteoEstudiantes(int $periodoId)
    {
        return Grado::withCount([
            'estudiantePeriodos as total_varones_enrolled' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    // IMPORTANTE: Contamos Activos, Aprobados y Reprobados
                    ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado'])
                    ->whereHas('estudiante', function ($q) {
                        $q->where('sexo', 'M');
                    });
            },
            'estudiantePeriodos as total_hembras_enrolled' => function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId)
                    ->whereIn('status', ['Activo', 'Aprobado', 'Reprobado'])
                    ->whereHas('estudiante', function ($q) {
                        $q->where('sexo', 'F');
                    });
            }
        ])->get();
    }

    // --- MÉTODOS DE APOYO (Mantienen lógica similar pero adaptada) ---

    private function procesarFechaSeleccionada(Request $request): Carbon
    {
        $fechaInput = $request->input('fecha');
        if (!$fechaInput) return Carbon::today();

        $parsedDate = Carbon::parse($fechaInput);
        return $parsedDate->greaterThan(Carbon::today()) ? Carbon::today() : $parsedDate;
    }

    private function mapearConteoEstudiantesPorGrado($grados)
    {
        return $grados->mapWithKeys(fn($g) => [
            $g->id => ['varones' => $g->total_varones_enrolled, 'hembras' => $g->total_hembras_enrolled]
        ]);
    }

    private function obtenerAsistenciasPorFecha(string $fecha)
    {
        return AsistenciaEstudiante::where('fecha', $fecha)->get();
    }

    private function prepararDatosAsistencia($grados, $asistencias, bool $asistenciaExistente): array
    {
        $data = [];
        foreach ($grados as $grado) {
            $asis = $asistencias->firstWhere('grado_id', $grado->id);
            $data[$grado->id] = [
                'varones' => $asistenciaExistente && $asis ? $asis->varones : 0,
                'hembras' => $asistenciaExistente && $asis ? $asis->hembras : 0,
            ];
        }
        return $data;
    }

    private function obtenerFechasFaltantes(string $selectedDateString): array
    {
        $missingDates = [];
        $selectedDate = Carbon::parse($selectedDateString);

        // Si es el día 1, no hay días previos en este mes
        if ($selectedDate->day === 1) return [];

        $startOfMonth = $selectedDate->copy()->startOfMonth();
        $limitDate = $selectedDate->copy()->subDay();

        // ============================================================
        // 1. VERIFICAR SI EL MES ESTÁ CERRADO EN CIERRES_MENSUALES
        // ============================================================
        $mes = $selectedDate->month;
        $anio = $selectedDate->year;

        // Si el mes está cerrado, NO hay faltantes
        if (CierreHelper::mesCerrado($mes, $anio)) {
            return [];
        }

        // ============================================================
        // 2. OBTENER LA PRIMERA ASISTENCIA DEL MES
        // ============================================================
        $primeraAsistencia = AsistenciaEstudiante::whereYear('fecha', $selectedDate->year)
            ->whereMonth('fecha', $selectedDate->month)
            ->orderBy('fecha', 'asc')
            ->first();

        // Si NO hay asistencias en el mes, retornar vacío (aún no ha empezado)
        if (!$primeraAsistencia) {
            return [];
        }

        // Fecha de la primera asistencia (desde allí empezamos a contar)
        $fechaInicio = Carbon::parse($primeraAsistencia->fecha);

        // ============================================================
        // 3. VERIFICAR SI EL MES TIENE FECHA DE CIERRE
        // ============================================================
        $cierre = CierreMensual::where('mes', $mes)->where('anio', $anio)->first();
        $fechaLimite = $limitDate; // Por defecto, el día anterior a la fecha seleccionada

        if ($cierre && $cierre->fecha_cierre) {
            // Si el mes tiene fecha de cierre, limitar hasta esa fecha
            $fechaCierre = Carbon::parse($cierre->fecha_cierre);

            // Si la fecha de cierre es menor que el límite, usar la fecha de cierre
            if ($fechaCierre->lessThan($limitDate)) {
                $fechaLimite = $fechaCierre;
            }
        }

        // ============================================================
        // 4. OBTENER ASISTENCIAS REGISTRADAS (Normalizadas)
        // ============================================================
        $recordedDates = AsistenciaEstudiante::whereYear('fecha', $selectedDate->year)
            ->whereMonth('fecha', $selectedDate->month)
            ->distinct()
            ->pluck('fecha')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        // ============================================================
        // 5. OBTENER DÍAS FESTIVOS (Normalizados)
        // ============================================================
        $holidays = DiaFestivo::whereYear('fecha', $selectedDate->year)
            ->whereMonth('fecha', $selectedDate->month)
            ->pluck('fecha')
            ->map(fn($f) => Carbon::parse($f)->toDateString())
            ->toArray();

        // ============================================================
        // 6. RECORRER DESDE LA PRIMERA ASISTENCIA HASTA EL LÍMITE
        // ============================================================
        $checkDate = $fechaInicio->copy();

        while ($checkDate->lessThanOrEqualTo($fechaLimite)) {
            $dateStr = $checkDate->toDateString();

            $isWeekend = $checkDate->isWeekend();
            $isHoliday = in_array($dateStr, $holidays);
            $alreadyRecorded = in_array($dateStr, $recordedDates);

            // Solo es falta si: No es fin de semana Y No es feriado Y No está grabada
            if (!$isWeekend && !$isHoliday && !$alreadyRecorded) {
                $missingDates[] = [
                    'fecha' => $dateStr,
                    'formateada' => $checkDate->translatedFormat('d \d\e F'),
                    'dia_nombre' => $checkDate->translatedFormat('l')
                ];
            }
            $checkDate->addDay();
        }

        return $missingDates;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fechaSeleccionada' => 'required|date',
            'asistenciaData' => 'required|array',
            'asistenciaData.*.grado_id' => 'required|exists:grados,id',
            'asistenciaData.*.varones' => 'required|integer|min:0',
            'asistenciaData.*.hembras' => 'required|integer|min:0',
        ]);

        // ============================================================
        // VALIDACIÓN DE CIERRE: Verificar si el mes está cerrado
        // ============================================================
        $fecha = Carbon::parse($validated['fechaSeleccionada']);
        $mes = $fecha->month;
        $anio = $fecha->year;

        if (CierreHelper::mesCerrado($mes, $anio)) {
            return redirect()->back()
                ->with('error', "La estadistica del mes de {$fecha->translatedFormat('F Y')} está cerrado. No se puede registrar ni modificar  asistencia.");
        }
        // ============================================================

        // DETECTAR EL PERIODO OTRA VEZ PARA EL GUARDADO
        $periodoActivo = PeriodoHelper::getActivo();
        $periodoId = $periodoActivo->id;

        // Si el periodo activo no tiene gente, guardamos los totales para el inactivo
        // $hayAlumnos = DB::table('estudiante_periodos')->where('periodo_id', $periodoId)->exists();
        // if (!$hayAlumnos) {
        //     $inactivo = PeriodoHelper::getInactivo();
        //     $periodoId = $inactivo ? $inactivo->id : $periodoId;
        // }

        DB::transaction(function () use ($validated, $fecha, $periodoId) {
            AsistenciaEstudiante::where('fecha', $fecha)->delete();

            $totalAsisV = 0;
            $totalAsisH = 0;

            foreach ($validated['asistenciaData'] as $data) {
                AsistenciaEstudiante::create([
                    'fecha' => $fecha,
                    'grado_id' => $data['grado_id'],
                    'varones' => $data['varones'],
                    'hembras' => $data['hembras'],
                    'total' => $data['varones'] + $data['hembras'],
                ]);
                $totalAsisV += $data['varones'];
                $totalAsisH += $data['hembras'];
            }

            // Totales existentes del periodo que estamos procesando
            $totales = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->whereIn('estudiante_periodos.status', ['Activo', 'Aprobado', 'Reprobado'])
                ->select(
                    DB::raw('COUNT(CASE WHEN estudiantes.sexo = "M" THEN 1 END) as v'),
                    DB::raw('COUNT(CASE WHEN estudiantes.sexo = "F" THEN 1 END) as h'),
                    DB::raw('COUNT(*) as t')
                )->first();

            TotalEstudiante::updateOrCreate(
                ['fecha_registro' => $fecha],
                [
                    'periodo_id' => $periodoId,
                    'varones_existentes' => $totales->v,
                    'hembras_existentes' => $totales->h,
                    'total_existentes' => $totales->t,
                    'varones_asistentes' => $totalAsisV,
                    'hembras_asistentes' => $totalAsisH,
                    'total_asistentes' => $totalAsisV + $totalAsisH,
                ]
            );
        });

        return redirect()->back()->with('success', 'Asistencias guardadas.');
    }

    public function scanFormularioAsistencia(Request $request)
    {
        $fechas = $request->input('fecha_objetivo');
        $fecha = Carbon::parse($fechas)->format('d-m-Y');
        Log::info('Asistencia para fecha: ' . $fecha);

        $file = $request->file('document');

        $gemini = new GeminiService();
        $respuesta = $gemini->procesarAsistencia($file->getRealPath(), $fecha);
        Log::info('Respuesta de Gemini: ' . $respuesta);

        if (!$respuesta) {
            return response()->json(['error' => 'No se detectaron datos'], 500);
        }

        preg_match('/\{.*\}/s', $respuesta, $matches);
        $jsonClean = $matches[0] ?? $respuesta;

        $dataRaw = json_decode($jsonClean, true);

        if (!$dataRaw || !isset($dataRaw['grados']) || empty($dataRaw['grados'])) {
            return response()->json(['data_asistencia' => (object)[], 'mensaje' => 'No se encontraron datos.'], 200);
        }

        $data_asistencia = [];
        foreach ($dataRaw['grados'] as $item) {
            // "1er Grado A" -> Separar "1er Grado" y "A" si tu BD los tiene separados
            // Si tu columna 'nombre_del_grado' guarda "1er Grado A" completo, usa la línea original.

            // Asumiendo que están separados (ejemplo: '1er Grado' y 'A'):
            $textoGrado = $item['grado'];
            $seccion = substr($textoGrado, -1); // Toma la última letra ("A", "B", etc.)
            $nombreGrado = trim(substr($textoGrado, 0, -1)); // Toma el resto ("1er Grado")

            $grado = \App\Models\Grado::where('nombre_del_grado', $nombreGrado)
                ->where('seccion', $seccion)
                ->first();

            // SI tu BD tiene el nombre completo ("1er Grado A") en una sola columna, usa esto en su lugar:
            // $grado = \App\Models\Grado::where('nombre_del_grado', $item['grado'])->first();

            if ($grado) {
                // Guardamos usando el ID como String para evitar que se indexe como array numérico en JSON
                $data_asistencia[(string)$grado->id] = [
                    'varones' => (int)($item['V'] ?? 0),
                    'hembras' => (int)($item['H'] ?? 0)
                ];
            } else {
                Log::warning("No se encontró el grado en la BD para el texto: " . $item['grado']);
            }
        }

        // JSON_FORCE_OBJECT es crucial para que { "1": {...} } llegue como objeto a React
        return response()->json(['data_asistencia' => $data_asistencia], 200, [], JSON_FORCE_OBJECT);
    }
}
