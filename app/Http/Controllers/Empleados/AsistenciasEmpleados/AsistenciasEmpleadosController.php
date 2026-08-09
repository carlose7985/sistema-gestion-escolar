<?php

namespace App\Http\Controllers\Empleados\AsistenciasEmpleados;

use App\Http\Controllers\Controller;
use App\Models\AsistenciaEmpleado;
use App\Models\Cargo;
use App\Models\DiaFestivo;
use App\Models\EmpleadoActivo;
use App\Models\TotalEmpleado;
use App\Models\VigilanteGuardia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AsistenciasEmpleadosController extends Controller
{

    public function index(Request $request)
    {
        Carbon::setLocale("es");
        $redirect = $this->chequearPermisosVencidos();

        if ($redirect) {
            return $redirect;
        }
        $vacacionesVencidasNombres = $this->chequearVacacionesVencidas();

        // 1. Preparar Fechas
        $selectedDate = $request->input('fecha') ? Carbon::parse($request->input('fecha')) : Carbon::today();
        
        $fechaFormateada = ucfirst($selectedDate->isoFormat('dddd D [de] MMMM'));

        // 2. Verificar estatus del día
        $estatusDia = $this->verificarEstadoDelDia($selectedDate);

        // 3. Obtener Contexto
        $contextoGlobal = $this->obtenerContextoDelMes($selectedDate);

        // 4. Procesar Cargos
        $cargos = Cargo::select('id', 'nombre_del_cargo')->get();
        $datosProcesados = $this->procesarListadoCargos($cargos, $selectedDate, $contextoGlobal);

        // Verificar si se puede habilitar Vigilantes
        $puedeRegistrarVigilante = $this->verificarAccesoVigilantes($datosProcesados['cargos']);

        return Inertia::render('Empleados/Asistencias/Index', [
            'cargos'            => $datosProcesados['cargos'],
            'totalesGeneral'    => $datosProcesados['totales'],
            'fechaSeleccionada' => $selectedDate->format('Y-m-d'),
            'fechaFormateada'   => $fechaFormateada,
            'estatusDia'        => $estatusDia,
            'vacacionesVencidas' => $vacacionesVencidasNombres,
            'puedeRegistrarVigilante' => $puedeRegistrarVigilante,
        ]);
    }
   
    public function create(Request $request)
    {

        $cargoId = $request->input('cargo_id');
        $fechaRaw = $request->input('fecha') ? $request->input('fecha') : now()->toDateString();
        $fechaSeleccionada = Carbon::parse($fechaRaw);
        $yaVerificado = $request->boolean('verificado');

        // 1. Obtener todos los empleados del cargo (Plantilla completa)
        $cargo = Cargo::findOrFail($cargoId);
        $empleadosCargados = $this->obtenerEmpleadosFiltrados($cargo);

        // 2. EXCLUIR EMPLEADOS QUE YA ESCANEARON QR
        // Filtramos la lista para quedarnos solo con los que NO han usado el terminal QR hoy
        $empleados = $this->excluirMarcadosPorQr($empleadosCargados, $fechaSeleccionada);

        // Si después de filtrar por QR ya no queda nadie por marcar, volvemos al panel
        if ($empleados->isEmpty()) {
            return redirect()->route('recursos.asistencia.empleados.index', ['fecha' => $fechaRaw])
                ->with('info', 'Todos los empleados de este cargo ya registraron su asistencia vía QR.');
        }

        // 3. RECUPERAR ASISTENCIAS MANUALES PREVIAS (Para los empleados que quedan)
        // Buscamos si ya se les pasó asistencia manual antes para saber si es "Edición"
        $asistenciasPrevias = AsistenciaEmpleado::whereDate('fecha', $fechaSeleccionada->toDateString())
            ->whereIn('empleado_id', $empleados->pluck('id'))
            ->where('metodo', '!=', 'Qr') // Solo nos interesan las manuales para la edición
            ->get()
            ->keyBy('empleado_id');

        $esEdicion = $asistenciasPrevias->isNotEmpty();

        // 4. LÓGICA DE VIGILANTES
        $esGrupoVigilantes = $empleados->contains('funcion_en_el_plantel', 'Vigilante');

        $nombresDeDiasABuscar = [];
        if ($fechaSeleccionada->isMonday()) {
            $nombresDeDiasABuscar = ['viernes', 'sábado', 'domingo'];
        } else {
            $fechaAnterior = $fechaSeleccionada->copy()->subDay();
            $nombresDeDiasABuscar = [Str::lower($fechaAnterior->locale('es')->dayName)];
        }

        // Vista intermedia Vigilantes (Solo si no es edición y no se ha verificado guardia)
        if ($esGrupoVigilantes && !$esEdicion && !$yaVerificado) {
            $vigilantesTocaGuardia = $this->buscarVigilantesPorDias($empleados, $nombresDeDiasABuscar);

            return Inertia::render('Empleados/Asistencias/VerificarGuardia', [
                'cargo' => $cargo,
                'fecha' => $fechaSeleccionada->toDateString(),
                'empleados' => $empleados->values(),
                'vigilantesTocaGuardia' => $vigilantesTocaGuardia,
                'diasCorrespondientes' => $nombresDeDiasABuscar,
            ]);
        }

        // 5. PREPARAR VISTA PRINCIPAL (TomarAsistencias)
        $estadosSugeridos = [];
        $resumenVigilantes = [];

        if (!$esEdicion) {
            // Solo calculamos sugeridos si es una carga manual nueva para este grupo
            $estadosSugeridos = $this->calcularEstadosPorDefecto($empleados, $fechaSeleccionada);

            if ($esGrupoVigilantes && $yaVerificado) {
                $resumenVigilantes = $this->buscarVigilantesPorDias($empleados, $nombresDeDiasABuscar);
            }
        }

        return Inertia::render('Empleados/Asistencias/TomarAsistencias', [
            'cargo' => $cargo,
            'empleados' => $empleados->values(),
            'fecha' => $fechaSeleccionada->toDateString(),
            'asistenciasPrevias' => $asistenciasPrevias,
            'esEdicion' => $esEdicion,
            'estadosSugeridos' => $estadosSugeridos,
            'abrirModalResumen' => $yaVerificado,
            'resumenVigilantes' => $resumenVigilantes,
        ]);
    }
    /**
     * STORE - Guarda asistencias con hora_entrada y hora_salida
     */
    public function store(Request $request)
    {
        try {

            // Validación
            $request->validate([
                'fecha' => 'required|date',
                'asistencias' => 'required|array',
                'asistencias.*.empleado_id' => 'required|exists:empleado_activos,id',
                'asistencias.*.status' => 'required|in:Asistio,Falto,Permiso',
            ]);

            $fechaSeleccionada = $request->input('fecha');
            $horaActual = Carbon::now()->format('H:i:s');

            DB::transaction(function () use ($request, $fechaSeleccionada, $horaActual) {
                foreach ($request->asistencias as $registro) {
                    $data = ['status' => $registro['status']];

                    if ($registro['status'] === 'Asistio') {
                        $data['hora_entrada'] = $horaActual;
                        $data['hora_salida'] = null;
                    } else {
                        $data['hora_entrada'] = null;
                        $data['hora_salida'] = null;
                    }

                    AsistenciaEmpleado::updateOrCreate(
                        [
                            'fecha' => $fechaSeleccionada,
                            'empleado_id' => $registro['empleado_id'],
                            'metodo' => 'Manual',
                        ],
                        $data
                    );
                }
            });

            // Recalcular totales
            $this->recalcularTodosLosTotales($fechaSeleccionada);


            return redirect()->route('recursos.asistencia.empleados.index', ['fecha' => $fechaSeleccionada])
                ->with('success', 'Asistencias guardadas correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al guardar asistencias: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->back()
                ->with('error', 'Error al guardar: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Verifica si todos los cargos (excepto Vigilante) tienen asistencia registrada.
     */
    private function verificarAccesoVigilantes($listaCargosProcesados)
    {
        foreach ($listaCargosProcesados as $cargo) {
            $nombre = mb_strtolower($cargo['nombre_del_cargo']);
            if (!str_contains($nombre, 'vigilante') && $cargo['total_asistentes'] == 0) {
                return false;
            }
        }
        return true;
    }
    /**
     * Nueva Función: Filtra la colección de empleados eliminando a los que ya tienen asistencia 'Qr'.
     */
    private function excluirMarcadosPorQr($empleados, $fecha)
    {
        // Obtenemos los IDs de los empleados que ya marcaron por QR hoy
        $idsMarcadosQr = AsistenciaEmpleado::whereDate('fecha', $fecha->toDateString())
            ->whereIn('empleado_id', $empleados->pluck('id'))
            ->where('metodo', 'Qr')
            ->pluck('empleado_id')
            ->toArray();

        // Devolvemos la colección excluyendo esos IDs
        return $empleados->reject(function ($empleado) use ($idsMarcadosQr) {
            return in_array($empleado->id, $idsMarcadosQr);
        });
    }

    /**
     * Función para actualizar la configuración desde la VISTA PREVIA (VerificarGuardia).
     */
    public function actualizarGuardiaDiaria(Request $request)
    {
        $cambios = $request->input('cambios');

        if ($cambios) {
            foreach ($cambios as $cambio) {
                VigilanteGuardia::where('empleado_id', $cambio['empleado_id'])
                    ->update(['status' => $cambio['status']]);
            }
        }

        $cargoId = $request->input('cargo_id');
        $fecha = $request->input('fecha');

        return to_route('recursos.asistencia.empleados.create', [
            'cargo_id' => $cargoId,
            'fecha' => $fecha,
            'verificado' => 1
        ])->with('success', 'Guardia verificada. Confirme la asistencia final.');
    }

    private function buscarVigilantesPorDias($empleados, array $diasABuscar)
    {
        $resultados = collect();

        $todosLosVigilantes = VigilanteGuardia::whereIn('empleado_id', $empleados->pluck('id'))->get();

        foreach ($todosLosVigilantes as $vigi) {
            $diasGuardiaEmpleado = is_string($vigi->dias_guardia) ? json_decode($vigi->dias_guardia) : $vigi->dias_guardia;
            $diasGuardiaEmpleado = array_map(fn($d) => Str::lower($d), $diasGuardiaEmpleado ?? []);

            $coincidencias = array_intersect($diasABuscar, $diasGuardiaEmpleado);

            if (!empty($coincidencias)) {
                $empleadoData = $empleados->firstWhere('id', $vigi->empleado_id);
                if ($empleadoData) {
                    $resultados->put($vigi->empleado_id, [
                        'empleado_id' => $vigi->empleado_id,
                        'nombre' => $empleadoData->nombres . ' ' . $empleadoData->apellidos,
                        'status_actual' => $vigi->status,
                        'dias_coincidentes' => array_values($coincidencias)
                    ]);
                }
            }
        }
        return $resultados->values()->all();
    }

    private function obtenerEmpleadosFiltrados($cargo)
    {
        $query = EmpleadoActivo::query();

        if ($cargo->nombre_del_cargo === 'Vigilante') {
            $query->where('funcion_en_el_plantel', 'Vigilante');
        } else {
            $query->where('tipo_de_personal', $cargo->nombre_del_cargo);
            $query->where('funcion_en_el_plantel', '!=', 'Vigilante');
        }

        return $query->select($this->getSelectToEmployee())
            ->orderByRaw($this->getOrdenJerarquicoSql())
            ->orderBy('id', 'asc')
            ->get();
    }

  

    private function obtenerStatusSegunSituacion($situacion)
    {
        $s = mb_strtolower($situacion, 'UTF-8');

        // CORRECCIÓN: Si contiene 'activo', retornar 'Asistio'
        if (str_contains($s, 'activo')) {
            return 'Asistio';  // <--- Esto ya está bien
        }

        if (
            str_contains($s, 'permiso') || str_contains($s, 'comision') ||
            str_contains($s, 'comisión') || str_contains($s, 'jubilado')
        ) {
            return 'Permiso';
        }

        if (str_contains($s, 'administrativo') || str_contains($s, 'proceso')) {
            return 'Falto';
        }

        return 'Asistio';  // Valor por defecto
    }

    /**
     * Recalcula todos los totales para una fecha específica
     */
    private function recalcularTodosLosTotales($fecha)
    {
        // Obtener todos los cargos únicos de los empleados que tienen asistencia ese día
        $empleadosConAsistencia = AsistenciaEmpleado::where('fecha', $fecha)
            ->pluck('empleado_id');

        $cargosAfectados = EmpleadoActivo::whereIn('id', $empleadosConAsistencia)
            ->distinct()
            ->pluck('tipo_de_personal');

        foreach ($cargosAfectados as $tipoPersonal) {
            $this->calcularTotalesPorCargo($fecha, $tipoPersonal);
        }
    }

    /**
     * Calcula los totales para un cargo específico en una fecha
     */
    private function calcularTotalesPorCargo($fecha, $tipoPersonal)
    {
        // IDs de empleados del cargo
        $empleadosIds = EmpleadoActivo::where('tipo_de_personal', $tipoPersonal)
            // ->where('status_del_cargo', 'Nacional')
            ->pluck('id');

        // Totales de plantilla
        $empleadosExistentes = EmpleadoActivo::whereIn('id', $empleadosIds)
            ->selectRaw('COUNT(*) as total, 
                SUM(CASE WHEN sexo = "M" THEN 1 ELSE 0 END) as varones, 
                SUM(CASE WHEN sexo = "F" THEN 1 ELSE 0 END) as hembras')
            ->first();

        // Asistentes del día
        $asistentesIds = AsistenciaEmpleado::where('fecha', $fecha)
            ->whereIn('empleado_id', $empleadosIds)
            ->where('status', 'Asistio')
            ->pluck('empleado_id');

        $varonesAsistentes = 0;
        $hembrasAsistentes = 0;
        $totalAsistentes = 0;

        if ($asistentesIds->isNotEmpty()) {
            $asistentesPorGenero = EmpleadoActivo::whereIn('id', $asistentesIds)
                ->selectRaw('COUNT(*) as total, 
                    SUM(CASE WHEN sexo = "M" THEN 1 ELSE 0 END) as varones,
                    SUM(CASE WHEN sexo = "F" THEN 1 ELSE 0 END) as hembras')
                ->first();

            $varonesAsistentes = $asistentesPorGenero->varones ?? 0;
            $hembrasAsistentes = $asistentesPorGenero->hembras ?? 0;
            $totalAsistentes = $asistentesPorGenero->total ?? 0;
        }

        TotalEmpleado::updateOrCreate(
            [
                'fecha_registro' => $fecha,
                'tipo_de_personal' => $tipoPersonal
            ],
            [
                'varones_existentes' => $empleadosExistentes->varones ?? 0,
                'hembras_existentes' => $empleadosExistentes->hembras ?? 0,
                'total_existentes'   => $empleadosExistentes->total ?? 0,
                'varones_asistentes' => $varonesAsistentes,
                'hembras_asistentes' => $hembrasAsistentes,
                'total_asistentes'   => $totalAsistentes,
            ]
        );
    }
   
    private function verificarDiasSaltados(string $nombreCargo, string $inicioStr, string $finStr, array $diasFestivos, Carbon $fechaVisual)
    {
        $fechaInicio = Carbon::parse($inicioStr);
        $fechaFin = Carbon::parse($finStr);

        // Si el inicio y el fin son el mismo día, no hay huecos.
        if ($fechaInicio->equalTo($fechaFin)) {
            return [];
        }

        // 1. Obtener IDs de empleados de ESTE cargo específico
        $empleadosIds = EmpleadoActivo::where('tipo_de_personal', $nombreCargo)
            ->pluck('id')
            ->toArray();

        if (empty($empleadosIds)) {
            return [];
        }

        // 2. Obtener días con asistencia registrada para ESTE cargo específico
        // CORRECCIÓN: Buscar asistencias de los empleados de este cargo
        $asistenciasCargo = AsistenciaEmpleado::whereIn('empleado_id', $empleadosIds)
            ->whereBetween('fecha', [$fechaInicio->format('Y-m-d'), $fechaFin->format('Y-m-d')])
            ->get()
            ->map(function ($asistencia) {
                return Carbon::parse($asistencia->fecha)->format('Y-m-d');
            })
            ->unique()
            ->toArray();

        // 3. Normalizar días festivos a array de strings 'Y-m-d'
        $festivosArray = [];
        foreach ($diasFestivos as $festivo) {
            if ($festivo instanceof Carbon) {
                $festivosArray[] = $festivo->format('Y-m-d');
            } elseif (is_string($festivo)) {
                $festivosArray[] = Carbon::parse($festivo)->format('Y-m-d');
            } elseif (is_array($festivo) && isset($festivo['fecha'])) {
                $festivosArray[] = Carbon::parse($festivo['fecha'])->format('Y-m-d');
            } elseif (is_object($festivo) && isset($festivo->fecha)) {
                $festivosArray[] = Carbon::parse($festivo->fecha)->format('Y-m-d');
            }
        }

        // 4. Generar período y comparar
        $periodo = CarbonPeriod::create($fechaInicio, $fechaFin);
        $diasFaltantes = [];

        foreach ($periodo as $dia) {
            $fechaStr = $dia->format('Y-m-d');

            // --- REGLAS DE EXCLUSIÓN ---

            // A. Excluir la fecha actual seleccionada
            if ($fechaStr === $fechaVisual->format('Y-m-d')) {
                continue;
            }

            // B. Excluir fines de semana
            if ($dia->isWeekend()) {
                continue;
            }

            // C. Excluir días Festivos
            if (in_array($fechaStr, $festivosArray)) {
                continue;
            }

            // D. Excluir días que ESTE cargo SÍ tiene registrados
            // CORRECCIÓN CLAVE: Solo excluye si ESTE cargo ya registró asistencia ese día
            if (in_array($fechaStr, $asistenciasCargo)) {
                continue;
            }

            // Si llega aquí, es un día que falta para ESTE cargo
            $diasFaltantes[] = [
                'fecha' => $fechaStr,
                'formato_humano' => ucfirst($dia->isoFormat('dddd D')) // Ej: Miércoles 3
            ];
        }

        return $diasFaltantes;
    }

    private function obtenerContextoDelMes(Carbon $fecha): array
    {
        return [
            'inicio_mes' => AsistenciaEmpleado::whereMonth('fecha', $fecha->month)
                ->whereYear('fecha', $fecha->year)
                ->min('fecha'),

            'fin_mes' => AsistenciaEmpleado::whereMonth('fecha', $fecha->month)
                ->whereYear('fecha', $fecha->year)
                ->max('fecha'),

            // CORRECCIÓN: Obtener las fechas como strings 'Y-m-d'
            'festivos' => DiaFestivo::whereMonth('fecha', $fecha->month)
                ->whereYear('fecha', $fecha->year)
                ->pluck('fecha')
                ->map(function ($fecha) {
                    return Carbon::parse($fecha)->format('Y-m-d');
                })
                ->toArray()
        ];
    }

    private function procesarListadoCargos($cargos, Carbon $selectedDate, array $contexto): array
    {
        $listaCargos = [];
        $totalVarones = 0;
        $totalHembras = 0;

        foreach ($cargos as $cargo) {
            $stats = $this->obtenerContadoresAsistencia($cargo->nombre_del_cargo, $selectedDate);

            $fechasFaltantes = [];
            if ($contexto['inicio_mes'] && $contexto['fin_mes']) {
                $fechasFaltantes = $this->verificarDiasSaltados(
                    $cargo->nombre_del_cargo,
                    $contexto['inicio_mes'],
                    $contexto['fin_mes'],
                    $contexto['festivos'],
                    $selectedDate
                );
            }

            $totalVarones += $stats['varones'];
            $totalHembras += $stats['hembras'];
            // Dentro de procesarListadoCargos:
            $listaCargos[] = [
                'id'                 => $cargo->id,
                'nombre_del_cargo'   => $cargo->nombre_del_cargo,
                'varones_asistentes' => $stats['varones'],
                'hembras_asistentes' => $stats['hembras'],
                'total_asistentes'   => $stats['total_asistio'],    // <--- Cambiado a solo asistidos
                'total_procesados'   => $stats['total_procesados'], // <--- Nuevo: para saber si mostrar el botón
                'total_plantilla'    => $stats['total_plantilla'],  // <--- Nuevo: para comparar
                'tiene_pendientes'   => count($fechasFaltantes) > 0,
                'fechas_faltantes'   => $fechasFaltantes,
            ];
        }

        return [
            'cargos' => $listaCargos,
            'totales' => [
                'varones' => $totalVarones,
                'hembras' => $totalHembras,
                'total'   => $totalVarones + $totalHembras
            ]
        ];
    }

    // Busca esta función en tu controlador y reemplázala:
    private function obtenerContadoresAsistencia(string $nombreCargo, Carbon $fecha): array
    {
        // 1. Obtener IDs y total de la plantilla de este cargo
        $empleadoIds = EmpleadoActivo::where('tipo_de_personal', $nombreCargo)->pluck('id');
        $totalPlantilla = $empleadoIds->count();

        if ($empleadoIds->isEmpty()) {
            return [
                'varones' => 0,
                'hembras' => 0,
                'total_asistio' => 0,
                'total_procesados' => 0,
                'total_plantilla' => 0
            ];
        }

        // 2. Obtener todos los registros de asistencia de hoy para estos empleados (QR y Manual)
        $asistenciasDia = AsistenciaEmpleado::whereIn('empleado_id', $empleadoIds)
            ->whereDate('fecha', $fecha->toDateString())
            ->with('empleados:id,sexo')
            ->get();

        // 3. Filtrar SOLO los que tienen status 'Asistio' para los contadores de la tarjeta
        $soloAsistieron = $asistenciasDia->where('status', 'Asistio');

        $varones = $soloAsistieron->where('empleados.sexo', 'M')->count();
        $hembras = $soloAsistieron->where('empleados.sexo', 'F')->count();

        return [
            'varones'          => $varones,
            'hembras'          => $hembras,
            'total_asistio'    => $soloAsistieron->count(), // Solo los que vinieron
            'total_procesados' => $asistenciasDia->count(),  // Todos los que ya tienen marca (Asistio/Falto/Permiso)
            'total_plantilla'  => $totalPlantilla            // El total de empleados que existen en ese cargo
        ];
    }

    private function verificarEstadoDelDia(Carbon $fecha): array
    {
        if ($fecha->isWeekend()) {
            return [
                'es_no_laborable' => true,
                'motivo' => 'Fin de Semana (' . ucfirst($fecha->isoFormat('dddd')) . ')',
                'tipo' => 'weekend'
            ];
        }

        $esFestivo = DiaFestivo::whereDate('fecha', $fecha->toDateString())->exists();

        if ($esFestivo) {
            return [
                'es_no_laborable' => true,
                'motivo' => 'Día Festivo Registrado',
                'tipo' => 'holiday'
            ];
        }

        return [
            'es_no_laborable' => false,
            'motivo' => '',
            'tipo' => 'workday'
        ];
    }

    private function calcularEstadosPorDefecto($empleados, Carbon $fecha)
    {
        // El día de la semana debe coincidir con el formato guardado (ej: "Lunes")
        $diaSemana = ucfirst($fecha->locale('es')->dayName);

        // 1. Obtenemos todos los permisos que afectan a esta fecha (Vacaciones, Eventuales o Permanentes del día)
        $permisosDelDia = \App\Models\Permiso::where('status', 'Activo')
            ->where(function ($q) use ($fecha, $diaSemana) {
                $q->where(function ($sub) use ($fecha) {
                    // Caso: Vacaciones y Eventuales (Rango de fechas)
                    $sub->whereIn('tipo', ['Vacacion', 'Eventual'])
                        ->whereDate('fecha_de_inicio', '<=', $fecha)
                        ->whereDate('fecha_final', '>=', $fecha);
                })->orWhere(function ($sub) use ($diaSemana) {
                    // Caso: Permanente (Día de la semana)
                    $sub->where('tipo', 'Permanente')
                        ->where('dia', $diaSemana);
                });
            })
            ->pluck('tipo', 'empleado_id') // Crea un array [empleado_id => tipo]
            ->toArray();

        $vigilantesConfig = VigilanteGuardia::all()->keyBy('empleado_id');
        $mapaEstados = [];

        foreach ($empleados as $empleado) {
            // PRIORIDAD 1: Si tiene cualquier permiso en la tabla unificada
            if (isset($permisosDelDia[$empleado->id])) {
                $mapaEstados[$empleado->id] = 'Permiso';
                continue;
            }

            // PRIORIDAD 2: Vigilantes (Lógica de guardias)
            if ($empleado->funcion_en_el_plantel == 'Vigilante') {
                if ($empleado->situacion_laboral != 'Activo') {
                    $mapaEstados[$empleado->id] = $this->obtenerStatusSegunSituacion($empleado->situacion_laboral);
                } elseif (isset($vigilantesConfig[$empleado->id])) {
                    $mapaEstados[$empleado->id] = $vigilantesConfig[$empleado->id]->status;
                } else {
                    $mapaEstados[$empleado->id] = 'Asistio';
                }
                continue;
            }

            // PRIORIDAD 3: Estándar (Situación laboral base)
            $mapaEstados[$empleado->id] = $this->obtenerStatusSegunSituacion($empleado->situacion_laboral);
        }

        return $mapaEstados;
    }

    private function chequearVacacionesVencidas()
    {
        $fechaActual = now()->format('Y-m-d');

        // Buscamos vacaciones en la tabla única
        $vacacionesVencidas = \App\Models\Permiso::where('tipo', 'Vacacion')
            ->where('status', 'Activo')
            ->whereDate('fecha_final', '<', $fechaActual)
            ->get();

        $nombresProcesados = [];

        foreach ($vacacionesVencidas as $vacacion) {
            $vacacion->update(['status' => 'Vencido']);

            $empleado = EmpleadoActivo::find($vacacion->empleado_id);
            if ($empleado) {
                $empleado->update(['situacion_laboral' => 'Activo']);
                $nombresProcesados[] = "{$empleado->nombres} {$empleado->apellidos}";
            }
        }

        return $nombresProcesados;
    }

    private function chequearPermisosVencidos()
    {
        $fechaActual = now()->format('Y-m-d');

        // Buscamos permisos eventuales en la tabla única
        $permisosVencidos = \App\Models\Permiso::with('empleado')
            ->where('tipo', 'Eventual')
            ->where('status', 'Activo')
            ->whereDate('fecha_final', '<', $fechaActual)
            ->get();

        if ($permisosVencidos->isNotEmpty()) {
            $dataParaInertia = $permisosVencidos->map(function ($p) {
                $emp = $p->empleado;
                if ($emp) {
                    return [
                        'permiso_id'           => $p->id,
                        'empleado_id'          => $p->empleado_id,
                        'nombre_empleado'      => "{$emp->nombres} {$emp->apellidos}",
                        'cedula'               => $emp->cedula,
                        'departamento'         => $emp->tipo_de_personal,
                        'fecha_inicio_permiso' => $p->fecha_de_inicio,
                        'fecha_final_permiso'  => $p->fecha_final,
                        'motivo_permiso'       => $p->descripcion, // Campo unificado
                        'status_actual'        => $p->status
                    ];
                }
                return null;
            })->filter()->values();

            return Inertia::render('Empleados/Permisos/ChequearPermisos', [
                'permisosVencidos' => $dataParaInertia,
                'totalPendientes'  => count($dataParaInertia)
            ]);
        }

        return null;
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

    private function getSelectToEmployee()
    {
        return [
            'id',
            'nombres',
            'apellidos',
            'cedula',
            'sexo',
            'tipo_de_personal',
            'situacion_laboral',
            'funcion_en_el_plantel',
            // 'primer_nombre',
            // 'primer_apellido'
        ];
    }
}
