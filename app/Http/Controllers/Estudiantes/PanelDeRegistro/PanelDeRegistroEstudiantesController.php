<?php

namespace App\Http\Controllers\Estudiantes\PanelDeRegistro;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEstudiantesRequest;
use App\Http\Requests\StoreResponsableRequest;
use App\Models\Apreciacion;
use App\Models\CupoEstudiante;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\Movimiento;
use App\Models\Responsable;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PanelDeRegistroEstudiantesController extends Controller
{
    public function index()
    {
        // 1. Obtener el período activo usando el Helper
        $periodoActivo = PeriodoHelper::getActivo();

        // 2. Bloqueo por proceso cerrado
        if ($periodoActivo->inscribe === 'No') {
            return Inertia::render('Modulos/Estudiantes/EstudiantesRegistro', [
                'periodo_escolar' => $periodoActivo->id,
                'showModal' => true
            ]);
        }        

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No existe un período escolar activo en el sistema.');
        }

        $periodoId = $periodoActivo->id;

        // Evaluamos el estado del proceso desde el modelo PeriodoEscolar
        $isRegistrationOpen = ($periodoActivo->status_periodo === 'Abierto' || $periodoActivo->status === 'Activo');

        // 2. Validar estudiantes registrados en el período activo
        $totalRegistradosPeriodo = EstudiantePeriodo::where('periodo_id', $periodoId)->count();

        if ($totalRegistradosPeriodo === 0) {
            return redirect()->route('estudiantes.registro.index')->with('alerta_pendientes', true);
        }

        // 3. Estudiantes sin grado asignado (SGA) en el período activo
        $sgaQuery = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->whereNull('estudiante_periodos.grado_id')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id');

        $sgaStats = [
            'total_studentsr'  => (clone $sgaQuery)->count(),
            'male_studentsr'   => (clone $sgaQuery)->where('estudiantes.sexo', 'M')->count(),
            'female_studentsr' => (clone $sgaQuery)->where('estudiantes.sexo', 'F')->count(),
        ];

        // 4. Cupos reservados en CupoEstudiante para el período activo con status "Pendiente"
        // CORREGIDO: Se cambia 'periodo_id' por 'periodo_escolar'
        $cuposAdicionales = CupoEstudiante::where('periodo_escolar', $periodoActivo->nombre_periodo)
            ->where('status', 'Pendiente')
            ->select('grado_id', DB::raw('count(*) as total'))
            ->groupBy('grado_id')
            ->pluck('total', 'grado_id');

        // 5. Carga y conteos por Grado para el período activo
        $grades = Grado::withCount([
            'estudiantePeriodos as activos_m' => function ($q) use ($periodoId) {
                $q->where('periodo_id', $periodoId)
                    ->whereHas('estudiante', fn($sq) => $sq->where('sexo', 'M'));
            },
            'estudiantePeriodos as activos_f' => function ($q) use ($periodoId) {
                $q->where('periodo_id', $periodoId)
                    ->whereHas('estudiante', fn($sq) => $sq->where('sexo', 'F'));
            },
        ])->get()->map(function ($grado) use ($cuposAdicionales) {
            $males = $grado->activos_m ?? 0;
            $females = $grado->activos_f ?? 0;
            $activosTotales = $males + $females;

            $limiteGrado = (int) ($grado->limite_de_estudiantes ?? 0);
            $reservados = (int) ($cuposAdicionales->get($grado->id) ?? 0);

            $cuposOcupados = $activosTotales + $reservados;
            $cuposDisponibles = max(0, $limiteGrado - $cuposOcupados);

            return [
                'id'                 => $grado->id,
                'nombre_del_grado'   => $grado->nombre_del_grado,
                'seccion'            => $grado->seccion,
                'total_students'     => $activosTotales,
                'male_students'      => $males,
                'female_students'    => $females,
                'limite_estudiantes' => $limiteGrado,
                'cupos_reservados'   => $reservados,
                'cupos_disponibles'  => $cuposDisponibles,
                'tiene_cupos'        => $cuposDisponibles > 0,
            ];
        });

        // 6. Retorno a Inertia usando exactamente las columnas de PeriodoEscolar
        return Inertia::render('Estudiantes/PanelDeRegistro/Index', [
            'isRegistrationOpen' => $isRegistrationOpen,
            'periodo_escolar'    => $periodoActivo->nombre_periodo,
            'periodo_id'         => $periodoId, // 🔥 AGREGAR ESTO
            'status_periodo'     => $periodoActivo->status_periodo,
            'status'             => $periodoActivo->status,
            'grades'             => $grades,
            'sgaStats'           => $sgaStats,
        ]);
    }

    public function seleccionaResponsable(Request $request)
    {
        $grado_id = $request->query('grade_id');
        $status = $request->query('student_status');
        return Inertia::render('Estudiantes/PanelDeRegistro/SeleccionDeResponsables', [
            'grado_id' => $grado_id,
            'status' => $status,
        ]);
    }

    public function createEstudiante(Request $request)
    {
        $representante_id = $request->input('representante_id');
        $padre_id = $request->input('padre_id');
        $parentesco = $request->input('parentesco');
        $grado_id = $request->input('grado_id');
        $status = $request->input('status');

        $representante = null;
        if ($representante_id) {
            $representante = Responsable::find($representante_id);
        }

        $padre = null;
        if ($padre_id) {
            $padre = Responsable::find($padre_id); // Assuming padre also comes from the Responsable model
        }

        $apreciaciones = Apreciacion::orderBy('id', 'asc')->get();
         // Assuming you have a model for Apreciacion
        return Inertia::render('Estudiantes/PanelDeRegistro/FormularioDeRegistro', [
            'representante_id' => $representante_id,
            'padre_id' => $padre_id,
            'parentesco' => $parentesco,
            'apreciaciones' => $apreciaciones,
            'grado_id' => $grado_id,
            'status' => $status,
            'representante_data' => $representante ? $representante->only(['id', 'name_r', 'apellido_r']) : null, // Pass relevant fields
            'padre_data' => $padre ? $padre->only(['id', 'name_r', 'apellido_r']) : null,
        ]);
    }

    public function storeEstudiante(StoreEstudiantesRequest $request)
    {
        $validated = $request->validated();

        // 1. Validar la existencia estricta del Período Escolar Actual
        $periodoEscolarActual = PeriodoHelper::getActivo();

        if (!$periodoEscolarActual) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'No existe un período escolar activo..');
        }

        $periodoId = $periodoEscolarActual->id;
        $estadoPeriodo = $periodoEscolarActual->status_periodo ?? 'Cerrado';

        // 2. Ajuste para padre_id en caso de no venir en la petición
        if (empty($validated['padre_id'])) {
            $validated['padre_id'] = $validated['representante_id'] ?? null;
        }

        // =========================================================================
        // 3. MAPEO EXACTO PARA LA TABLA `Estudiante`
        // =========================================================================
        $camposEstudiante = [
            'name',
            'apellido',
            'cedula',
            'documento',
            'sexo',
            'fecha_de_nacimiento',
            'lugar_de_nacimiento',
            'entidad_federal',
            'etnia',
            'representante_id',
            'padre_id',
            'parentesco',
            'enfermedades',
            'tratamiento_medico',
            'alergico',
            'condicion_especial',
            'problemas_fisicos',
        ];

        // Extrae EXCLUSIVAMENTE las claves que pertenecen a Estudiante
        $datosEstudiante = Arr::only($validated, $camposEstudiante);

        // Guardar registro base
        $estudiante = Estudiante::create($datosEstudiante);

        // =========================================================================
        // 4. MAPEO EXACTO PARA LA TABLA `EstudiantePeriodo`
        // =========================================================================
        $camposEstudiantePeriodo = [
            'direccion',
            'instituto_de_procedencia',
            'lateralidad',
            'talla_de_camisa',
            'talla_de_pantalon',
            'talla_de_zapato',
            'condicion',
            'status_escolar',
            'matricula_sisge',
            'apreciacion',
            'actualizado',
            'contador_impresiones',
            'calificado',
            'fecha_registro',
        ];

        // Extrae los valores ingresados válidos para EstudiantePeriodo
        $datosPeriodo = Arr::only($validated, $camposEstudiantePeriodo);

        // Inyectar relaciones e indicadores requeridos
        $datosPeriodo['estudiante_id']   = $estudiante->id;
        $datosPeriodo['periodo_id']      = $periodoId;
        $datosPeriodo['grado_id']        = $request->input('grado_id');
        $datosPeriodo['status']          = 'Activo'; // Siempre 'Activo' en EstudiantePeriodo
        $datosPeriodo['status_escolar']  = $validated['status_escolar'] ?? null;
        $datosPeriodo['matricula_sisge'] =  'No';
        $datosPeriodo['status_sisge'] = ($estadoPeriodo === 'Abierto') ? 'Activo' : 'Nuevo Ingreso';
        $datosPeriodo['fecha_registro']  = $validated['fecha_registro'] ?? Carbon::now()->format('Y-m-d');

        // Guardar registro en EstudiantePeriodo
        $estudiantePeriodo = EstudiantePeriodo::create($datosPeriodo);

        // =========================================================================
        // 5. REGISTRO EN MOVIMIENTO (Solo si el período está CERRADO)
        // =========================================================================
        if ($estadoPeriodo !== 'Abierto') {
            Movimiento::create([
                'estudiante_id'      => $estudiante->id,
                'periodo_id'         => $periodoId,
                'tipo_de_movimiento'  => 'Ingreso',
                'grado_id_past'      => $request->input('grado_id'),
                'grado_id_new'       => $request->input('grado_id'),
                'status'             => 'Nuevo Ingreso', // En Movimiento se guarda Nuevo Ingreso al estar cerrado
                'matricula_sisge'    => 'No',
                'fecha_registro'     => Carbon::now()->format('Y-m-d'),
            ]);
        }

        // =========================================================================
        // 6. ACTIVAR RESPONSABLES INACTIVOS
        // =========================================================================
        $responsablesIds = array_filter(array_unique([
            $validated['representante_id'] ?? null,
            $validated['padre_id'] ?? null
        ]));

        if (!empty($responsablesIds)) {
            Responsable::whereIn('id', $responsablesIds)
                ->where('status_r', 'Inactivo')
                ->update(['status_r' => 'Activo']);
        }
        // =========================================================================
        // 7. ACTUALIZAR STATUS EN CupoEstudiante (NUEVA LÓGICA)
        // =========================================================================
        // Buscamos si el estudiante tenía un cupo reservado por su cédula
            CupoEstudiante::where('cedula', $estudiante->cedula)
            ->update(['status' => 'Inscrito']);
        // 8. Redirección final
        return redirect()->route('estudiantes.registro.selecciona.grado')
            ->with('success', 'Estudiante registrado exitosamente.')
            ->with('student_id', $estudiante->id)
            ->with('student_type', 'activo');
    }
    
    public function buscarResponsable(Request $request)
    {

        $cedula = $request->input('cedula');
        $trimmedCedula = trim($cedula);

        $responsable = Responsable::where('cedula_r', $trimmedCedula)->first();

        return response()->json(['responsable' => $responsable]);
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

    public function scanFormulario(Request $request)
    {
        // 1. Validar que llegue la imagen
        $request->validate(['document' => 'required|image|max:10240']);

        try {
            $gemini = new GeminiService();
            $jsonString = $gemini->procesarFormulario($request->file('document')->getRealPath());

            if (!$jsonString) {
                return response()->json(['error' => 'No se pudo procesar la imagen con IA'], 500);
            }
            Log::info('Respuesta de Gemini: ' . json_encode($jsonString));

            // 2. Limpieza de respuesta para asegurar que sea JSON puro
            $jsonClean = trim(str_replace(['```json', '```'], '', $jsonString));
            $data = json_decode($jsonClean, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'Formato de respuesta inválido'], 500);
            }

            // 3. Retornar datos al frontend
            // Mapeamos a ['value' => '...'] para que tu frontend lo consuma tal cual
            return response()->json([
                'success' => true,
                'prediction' => collect($data)->map(fn($v) => ['value' => $v])->toArray()
            ]);
        } catch (\Exception $e) {
            Log::error('Error crítico en escaneo: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

  
}
