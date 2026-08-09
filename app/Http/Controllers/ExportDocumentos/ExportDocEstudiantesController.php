<?php

namespace App\Http\Controllers\ExportDocumentos;

use App\Exports\EstudiantesMultiSheetExport;
use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\AsistenciaEstudiante;
use App\Models\Cargo;
use App\Models\EmpleadoActivo;
use App\Models\Estadistica;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\HistorialEstadistica;
use App\Models\Institucion;
use App\Models\Logo;
use App\Models\MatriculaEstadistica;
use App\Models\MatriculaFinal;
use App\Models\MatriculaInicial;
use App\Models\Movimiento;
use App\Models\PeriodoEscolar;
use App\Models\Plantel;
use App\Models\Responsable;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExportDocEstudiantesController extends Controller
{

    public function exportDocumentosEstudiante(Request $request)
    {

        $rawGrados = $request->query('gradoIds');
        $gradoIds = $rawGrados ? explode(',', $rawGrados) : [];
        $type = $request->query('type');
        $status = $request->query('status');
        $studentId = $request->query('studentId');
        $gradoId = $request->query('gradoId');
        $section = $request->query('section');
        $responsableId = $request->query('responsableId');
        $monthYear = $request->query('month_year');
        $periodo_escolar = $request->query('periodo');
        $estudianteId = $request->estudiante_id;
        $periodoId = $request->periodo_id;
        // $gradoId = $request->grado_id;
        $tipo = $request->query('tipo');
        //dd($request->query()); // Puedes descomentar para depurar

        switch ($type) {
            case 'listado-excell-general':
                return Excel::download(new EstudiantesMultiSheetExport(), 'Matricula_General_Estudiantes.xlsx');

            case 'gestion-de-cupo':
                return $this->gestiondeCupo($request->query('studentId'));

            case 'matricula-pdf-general':
                return $this->MatriculaGeneral();

            case 'data-uniforme':
                return $this->DataUniforme();

            case 'matricula-discriminada':
                return $this->MatriculaPorEdadySexo();

            case 'matricula-repitiente':
                return $this->MatriculaRepitiente();

            case 'matricula-por-condicion':
                return $this->ReporteMatriculaEspecialUnificado();

            case 'ingresos-egresos-mensuales':
                return $this->reporteMovimientosUnificado($monthYear, 'mensual');

            case 'ingresos-egresos-anuales':
                return $this->reporteMovimientosUnificado($monthYear, 'anual');

            case 'cambio-de-grado':
                return $this->CambiosDeGrado($monthYear);

            case 'matricula-inicial':
                return $this->matriculaInicial($request->query('periodo'));

            case 'matricula-final':
                return $this->matriculaFinal($request->query('periodo'));

            case 'matricula-oficial':
                return $this->matriculaOficial($request->query('periodo'));

            case 'ficha-de-registro':
                return $this->FichaDeRegistro();

            case 'control-de-asistencia':
                return $this->ListadoDeAsistencias($gradoIds);

            case 'listado-general-aprobados-reprobados':
                return $this->ListadoGeneralAprobadosReprobados($request);

            case 'inscripcion-inicial':
                return $this->IncripcionInicial($gradoIds);

            case 'cedulacion':
                return $this->Cedulacion($gradoIds);

            case 'directorio':
                return $this->Directorio($gradoIds);

            case 'control-aprobados-reprobados':
                return $this->ControlAprobadosReprobados($gradoIds);

            case 'control-de-zonificacion':
                return $this->ControlDeZonificacion($gradoIds);

            case 'lista-de-verificacion':
                return $this->ListaDeVerificacion($gradoIds);

            case 'rendimiento-estudiantil':
                return $this->RendimientoEstudiantil($gradoIds);

            case 'control-de-evaluacion':
                return $this->ControlDeEvaluaciones($gradoIds);

            case 'constancia-de-retiro':
                return $this->ConstanciaDeRetiro($request);

            case 'constancia-de-reunion':
                return $this->constanciadeparticipacionPDF($request->query('responsableId'));

            case 'estadistica-manual':
                return $this->EstadisticaManual($request);

                // --- ESTADÍSTICAS POR GRADO (Individual o Múltiple) ---
            case 'estadistica-por-grado':
                if (!$monthYear) {
                    return redirect()->back()->with('error', 'Debe seleccionar un mes válido.');
                }

                // Caso 1: Un solo grado (individual)
                if ($gradoId && is_numeric($gradoId)) {
                    return $this->EstadisticasPoGrado($request);
                }

                // Caso 2: Múltiples grados
                if (!empty($gradoIds)) {
                    $gradoIdsArray = array_filter($gradoIds, 'is_numeric');
                    if (count($gradoIdsArray) > 0) {
                        return $this->EstadisticasMultiplesGrados($request, $gradoIdsArray);
                    }
                }

                return redirect()->back()->with('error', 'Debe seleccionar al menos un grado válido.');


            case 'estadistica-general':
                if (!$monthYear) {
                    return redirect()->back()->with('error', 'Debe seleccionar un mes válido.');
                }
                return $this->EstadisticaGeneral($request);

                // --- OTROS CASOS ---
            case 'zonificacion-pdf':
                return $this->ZonificacionPdf($request);

            case 'reporte-sisge':
                return $this->exportMatriculasisge($request);

            case 'empleado':
                return $this->imprimirTicket($request);

            case 'estudiante':
                return $this->imprimirTicket($request);

            case 'responsable':
                return $this->imprimirListadoResponsables($request);

            default:
                abort(404, 'Tipo de documento no válido');
        }
    }


    public function imprimirTicket(Request $request)
    {
        $tipo = $request->query('type', 'estudiante');
        $coleccion = [];

        if ($tipo == 'empleado') {
            $empleados = EmpleadoActivo::all();
            foreach ($empleados as $emp) {
                $coleccion[] = (object)[
                    'tipo' => 'empleado',
                    'header' => 'Empleado: ' . $emp->nombres . ' ' . $emp->apellidos,
                    'cedula' => $emp->cedula,
                    'fecha_nac' => Carbon::parse($emp->fecha_de_nacimiento)->format('d-m-Y'),
                    'edad' => Carbon::parse($emp->fecha_de_nacimiento)->age,
                ];
            }
        } else {
            // Cargamos la relación en plural: 'estudiantesactivos.grados'
            $representantes = Responsable::has('estudiantesactivos')
                ->with(['estudiantesactivos.padre', 'estudiantesactivos.grados'])
                ->get();

            foreach ($representantes as $rep) {
                $primerHijo = $rep->estudiantesactivos->first();

                $coleccion[] = (object)[
                    'tipo' => 'estudiante',
                    'header' => 'Representante: ' . $rep->name_r,
                    'niños' => $rep->estudiantesactivos->map(function ($niño) {

                        // 1. Extraemos solo el número del grado (Ej: "1er Grado" -> "1ER")
                        $nombreCompleto = $niño->grados->nombre_del_grado ?? '';
                        if (preg_match('/[0-9]+[a-zA-Z]*/', $nombreCompleto, $coincidencias)) {
                            $gradoCorto = strtoupper($coincidencias[0]);
                        } else {
                            $gradoCorto = $nombreCompleto ? strtoupper(substr($nombreCompleto, 0, 4)) . '.' : '';
                        }

                        // 2. Extraemos la sección de forma limpia (Ej: "A")
                        $seccion = isset($niño->grados->seccion) ? strtoupper(trim($niño->grados->seccion)) : '';

                        // 3. Juntamos ambos valores con un espacio (Ej: "1ER A")
                        $gradoSeccion = trim("{$gradoCorto} {$seccion}");

                        // Si al final ambos estaban vacíos, ponemos Sin Grado
                        if (empty($gradoSeccion)) {
                            $gradoSeccion = 'S/G';
                        }

                        return (object)[
                            'sexo' => $niño->sexo == 'M' ? 'M' : 'F',
                            'fecha' => Carbon::parse($niño->fecha_de_nacimiento)->format('d-m-Y'),
                            'edad' => Carbon::parse($niño->fecha_de_nacimiento)->age,
                            'grado_seccion' => $gradoSeccion // Enviará el resultado final armado (Ej: "1ER A")
                        ];
                    }),
                    'alterno' => $primerHijo->padre->name_r ?? 'N/A',
                    'alterno_ci' => $primerHijo->padre->cedula_r ?? 'S/D'
                ];
            }
        }

        $coleccion = collect($coleccion);

        $pdf = Pdf::loadView('pdfs.tickets', compact('coleccion'))
            ->setPaper('letter', 'portrait');

        return $pdf->stream('tickets.pdf');
    }

    public function imprimirListadoResponsables(Request $request)
    {
        $coleccion = [];

        // Buscamos los responsables que tengan estudiantes activos
        $representantes = Responsable::has('estudiantesactivos')
            ->with(['estudiantesactivos.grados'])
            ->get()
            ->map(function ($rep) {
                // Buscamos el grado más bajo de todos sus hijos activos
                // Asumimos que 'nombre_del_grado' empieza por el número (ej: "1er Grado", "2do Grado")
                $menorGradoCompleto = '';
                $menorGradoNumero = 99; // Un número alto como fallback
                $seccionMenor = 'Z';

                foreach ($rep->estudiantesactivos as $niño) {
                    $nombreCompleto = $niño->grados->nombre_del_grado ?? '';

                    // Extraemos el número del grado para poder comparar matemáticamente cuál es menor
                    if (preg_match('/[0-9]+/', $nombreCompleto, $coincidencias)) {
                        $numeroGrado = (int)$coincidencias[0];

                        if ($numeroGrado < $menorGradoNumero) {
                            $menorGradoNumero = $numeroGrado;
                            $menorGradoCompleto = $nombreCompleto;
                            $seccionMenor = isset($niño->grados->seccion) ? strtoupper(trim($niño->grados->seccion)) : 'A';
                        }
                    }
                }

                // Procesamos el formato corto del grado menor encontrado (Ej: "1er Grado" -> "1ER")
                if (preg_match('/[0-9]+[a-zA-Z]*/', $menorGradoCompleto, $coincidencias)) {
                    $gradoCorto = strtoupper($coincidencias[0]);
                } else {
                    $gradoCorto = $menorGradoCompleto ? strtoupper(substr($menorGradoCompleto, 0, 4)) . '.' : '';
                }

                $gradoSeccion = trim("{$gradoCorto} {$seccionMenor}");
                if (empty($gradoSeccion)) {
                    $gradoSeccion = 'S/G';
                }

                return (object)[
                    'nombre' => $rep->name_r,
                    'cedula' => $rep->cedula_r ?? 'S/D',
                    'grado_seccion' => $gradoSeccion,
                    'orden_grado' => $menorGradoNumero, // Llave interna para ordenar
                    'orden_seccion' => $seccionMenor   // Llave interna para ordenar
                ];
            });

        // Ordenamos primero por el número de grado y luego por la sección alfabéticamente
        $coleccion = $representantes->sortBy([
            ['orden_grado', 'asc'],
            ['orden_seccion', 'asc']
        ])->values();

        $pdf = Pdf::loadView('pdfs.listado_firmas_responsables', compact('coleccion'))
            ->setPaper('letter', 'portrait');

        return $pdf->stream('listado_firmas.pdf');
    }

    //listo
    public function gestiondeCupo(int $studentId)
    {
        Carbon::setLocale('es');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');

        // 🔥 Hacer join con grados para obtener el nombre del grado
        $cupoestudiante = DB::table('cupo_estudiantes')
            ->join('grados', 'cupo_estudiantes.grado_id', '=', 'grados.id')
            ->select(
                'cupo_estudiantes.*',
                'grados.nombre_del_grado as grado_nombre',
                'grados.seccion'
            )
            ->where('cupo_estudiantes.id', $studentId)
            ->first();

        if (!$cupoestudiante) {
            abort(404, 'Cupo no encontrado.');
        }

        $title = 'Constancia asignación de cupo';

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.asignacion-de-cupo', compact(
            'title',
            'cupoestudiante',
            'institucion',
            'logoDocumento',
            'dia',
            'mes',
            'aho'
        ));

        $pdf->setPaper('Letter', 'portrait');
        return $pdf->stream('cupos-report.pdf');
    }


    public function ZonificacionPdf(Request $request)
    {
        $rawPlantels = $request->query('plantelIds') ?? $request->query('plantel_ids');
        $plantelesFiltrar = $rawPlantels ? explode(',', $rawPlantels) : [];
        $periodoNombre = $request->query('periodo');

        $periodo = PeriodoEscolar::where('nombre_periodo', $periodoNombre)->first();

        if (!$periodo) {
            return "Período no encontrado: $periodoNombre";
        }

        $periodoId = $periodo->id;

        $institucion = Institucion::first();
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');
        $fechaActual = \Carbon\Carbon::now()->format('d-m-Y');

        // 🔥 USAR LEFT JOIN para evitar que los datos faltantes eliminen registros
        $query = DB::table('zonificacions')
            ->join('estudiantes', 'zonificacions.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'zonificacions.grado_id', '=', 'grados.id')
            ->join('plantels', 'zonificacions.plantel_id', '=', 'plantels.id')
            ->where('zonificacions.periodo_id', $periodoId)
            ->select(
                'zonificacions.id',
                'zonificacions.estudiante_id',
                'zonificacions.grado_id',
                'zonificacions.plantel_id',
                'zonificacions.fecha_registro',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',  // 🔥 AGREGAR ESTO
                'grados.nombre_del_grado as grado_nombre',
                'grados.seccion as grado_seccion',
                'plantels.nombre as plantel_nombre',
                'plantels.director'
            )
            ->orderBy('estudiantes.apellido', 'asc');

        if (!empty($plantelesFiltrar)) {
            $plantelesExistentes = Plantel::whereIn('id', $plantelesFiltrar)->pluck('id')->toArray();
            if (!empty($plantelesExistentes)) {
                $query->whereIn('zonificacions.plantel_id', $plantelesExistentes);
            }
        }

        $resultados = $query->get();

        if ($resultados->isEmpty()) {
            // Mostrar depuración detallada
            $totalZonificaciones = DB::table('zonificacions')->where('periodo_id', $periodoId)->count();
            $estudiantesIds = DB::table('zonificacions')->where('periodo_id', $periodoId)->pluck('estudiante_id')->toArray();
            $estudiantesExistentes = DB::table('estudiantes')->whereIn('id', $estudiantesIds)->pluck('id')->toArray();
            $estudiantesFaltantes = array_diff($estudiantesIds, $estudiantesExistentes);

            return "No se encontraron resultados.
                 Período: $periodoNombre (ID: $periodoId)
                 Total zonificaciones: $totalZonificaciones
                 IDs de estudiantes en zonificaciones: " . implode(', ', $estudiantesIds) . "
                 IDs de estudiantes existentes: " . implode(', ', $estudiantesExistentes) . "
                 IDs de estudiantes FALTANTES: " . implode(', ', $estudiantesFaltantes);
        }

        $agrupadosPorPlantel = $resultados->groupBy('plantel_id');

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.zonificacion_reporte', [
            'institucion' => $institucion,
            'logoDocumento' => $logoDocumento,
            'grupos' => $agrupadosPorPlantel,
            'fechaActual' => $fechaActual,
            'periodoSeleccionado' => $periodoNombre,
            'periodo' => $periodo,
        ]);

        $pdf->setPaper('letter', 'portrait');

        $sufijo = !empty($plantelesFiltrar) ? "_Filtrado" : "_General";
        $filename = "Zonificacion" . $sufijo . "_" . str_replace('/', '-', $periodoNombre) . ".pdf";

        return $pdf->stream($filename);
    }

    
    public function EstadisticaManual(Request $request)
    {
        Carbon::setLocale('es');
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));

        // 1. Obtener Grados y Secciones
        $grados = Grado::select('id', 'nombre_del_grado', 'seccion')
            ->orderBy('nombre_del_grado')
            ->orderBy('seccion')
            ->get();

        // 2. Obtener Cargos
        $cargos = Cargo::select('nombre_del_cargo')
            ->orderBy('id')
            ->get();

        // 3. Generar días hábiles (Lunes a Viernes)
        $diasHabiles = [];
        $fechaInicio = Carbon::createFromDate($year, $month, 1);
        $diasEnMes = $fechaInicio->daysInMonth;

        for ($i = 1; $i <= $diasEnMes; $i++) {
            $fechaActual = Carbon::createFromDate($year, $month, $i);
            // 0 = Domingo, 6 = Sábado
            if (!$fechaActual->isWeekend()) {
                $diasHabiles[] = [
                    'nombre' => $fechaActual->translatedFormat('l'), // Ejemplo: lunes
                    'fecha' => $fechaActual->format('d/m/Y')         // Ejemplo: 01/05/2024
                ];
            }
        }

        // Usamos chunks de 5 para que la vista Blade los agrupe por filas si es necesario
        $diasAgrupados = array_chunk($diasHabiles, 5);

        $pdf = Pdf::loadView('pdfs.estudiantesPDF.estadistica_diaria_manual', [
            'grados' => $grados,
            'cargos' => $cargos,
            'diasAgrupados' => $diasAgrupados,
            'mesNombre' => Carbon::createFromDate($year, $month, 1)->translatedFormat('F'),
            'anio' => $year
        ])->setPaper('letter', 'landscape');

        return $pdf->stream('Estadistica_Diaria_' . $month . '_' . $year . '.pdf');
    }

    public function EstadisticasPoGrado(Request $request)
    {
        $monthYear = $request->input('month_year');
        $gradeId = (int) $request->input('gradoId');

        if (!$gradeId || $gradeId <= 0) {
            return redirect()->back()->with('error', 'Debe seleccionar un grado válido.');
        }

        Carbon::setLocale('es');
        list($year, $month) = explode('-', $monthYear);
        $date = Carbon::createFromFormat('Y-m', $monthYear);

        // Actualizar historial
        $this->updateHistorialEstadistica($gradeId, $year, $month, $date);

        // Obtener datos del grado
        $data = $this->getGradoData($gradeId, $year, $month);

        // Usar la misma vista, pasando un solo grado en un array
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.estadisticas.estadistica-por-grado', [
            'gradosData' => [$data],  // <--- Mismo formato que múltiple
            'institucion' => $data['institucion'],
            'logoDocumento' => $data['logoDocumento'] ?? null,
            'estadisticas' => $data['estadisticas'],
            'esMultiple' => false,  // <--- Indicador para la vista
        ])->setPaper("Letter", "portrait");

        return $pdf->stream("Estadistica_{$data['grado']->nombre_del_grado}_{$data['grado']->seccion}.pdf");
    }


    public function EstadisticasMultiplesGrados(Request $request, array $gradeIds)
    {
        $monthYear = $request->input('month_year');

        if (!$monthYear) {
            return redirect()->back()->with('error', 'Debe seleccionar un mes válido.');
        }

        Carbon::setLocale('es');
        list($year, $month) = explode('-', $monthYear);
        $date = Carbon::createFromFormat('Y-m', $monthYear);

        // Datos de institución (compartidos)
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');
        $estadisticas = Estadistica::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->get();

        $gradosData = [];

        foreach ($gradeIds as $gradeId) {
            $this->updateHistorialEstadistica($gradeId, $year, $month, $date);
            $data = $this->getGradoData($gradeId, $year, $month);
            $gradosData[] = $data;
        }

        // Usar la MISMA VISTA, con múltiples grados
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.estadisticas.estadistica-por-grado', [
            'gradosData' => $gradosData,
            'institucion' => $institucion,
            'logoDocumento' => $logoDocumento,
            'estadisticas' => $estadisticas,
            'esMultiple' => true,  // <--- Indicador para la vista
        ])->setPaper("Letter", "portrait");

        return $pdf->stream("Estadisticas_Multiples_Grados.pdf");
    }

    private function getGradoData(int $gradeId, int $year, int $month)
    {
        // Obtener logo
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');

        // --- DATOS BÁSICOS ---
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();
        $grado = Grado::findOrFail($gradeId);

        // --- CONSULTA DE EDADES (MATRÍCULA) ---
        $queryMatricula = MatriculaEstadistica::whereMonth('fecha_registro', $month)
            ->whereYear('fecha_registro', $year)
            ->where('grado_id', $gradeId);

        $selectAgeRaw = "SUM(cantidad) as total, 
                     SUM(CASE WHEN sexo = 'M' THEN cantidad ELSE 0 END) as totalm, 
                     SUM(CASE WHEN sexo = 'F' THEN cantidad ELSE 0 END) as totalf";

        $nombresEdades = [4 => 'cuatro', 5 => 'cinco', 6 => 'seis', 7 => 'siete', 8 => 'ocho', 9 => 'nueve', 10 => 'diez', 11 => 'once', 12 => 'doce', 13 => 'trece', 14 => 'catorce', 15 => 'quince', 16 => 'dieciseis'];

        foreach ($nombresEdades as $num => $txt) {
            $selectAgeRaw .= ", SUM(CASE WHEN sexo = 'M' AND edad = $num THEN cantidad ELSE 0 END) as {$txt}m";
            $selectAgeRaw .= ", SUM(CASE WHEN sexo = 'F' AND edad = $num THEN cantidad ELSE 0 END) as {$txt}f";
        }

        $total_por_edad = (clone $queryMatricula)->selectRaw($selectAgeRaw)->get();
        $matriculaactiva = (clone $queryMatricula)->selectRaw("SUM(cantidad) as totalma, SUM(CASE WHEN sexo = 'M' THEN cantidad ELSE 0 END) as totalmam, SUM(CASE WHEN sexo = 'F' THEN cantidad ELSE 0 END) as totalmaf")->get();

        // --- ASISTENCIAS ---
        $asistenciatotal = AsistenciaEstudiante::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->where('grado_id', $gradeId)
            ->sum('total');

        $asistenciatotalv = AsistenciaEstudiante::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->where('grado_id', $gradeId)
            ->sum('varones');

        $asistenciatotalh = AsistenciaEstudiante::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->where('grado_id', $gradeId)
            ->sum('hembras');

        $asistenciasss = AsistenciaEstudiante::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->where('grado_id', $gradeId)
            ->orderBy('fecha', 'asc')
            ->get();

        // --- MOVIMIENTOS ---
        $periodoActivoId = PeriodoHelper::getActivoId();

        $movBase = Movimiento::whereMonth('fecha_registro', $month)
            ->whereYear('fecha_registro', $year);

        // INGRESOS
        $ingresadosQuery = (clone $movBase)->where(function ($q) use ($gradeId) {
            $q->where(function ($sub) use ($gradeId) {
                $sub->where('tipo_de_movimiento', 'Ingreso')
                    ->where('grado_id_new', $gradeId);
            })->orWhere(function ($sub) use ($gradeId) {
                $sub->where('tipo_de_movimiento', 'Cambio')
                    ->where('grado_id_new', $gradeId);
            });
        });

        $ingresados = $ingresadosQuery
            ->with(['estudiante', 'gradoNuevo'])
            ->get()
            ->map(function ($movimiento) {
                $estudiante = $movimiento->estudiante;
                return (object) [
                    'id' => $estudiante->id,
                    'apellido' => $estudiante->apellido,
                    'name' => $estudiante->name,
                    'sexo' => $estudiante->sexo,
                    'age' => Carbon::parse($estudiante->fecha_de_nacimiento)->age,
                    'grado' => $movimiento->gradoNuevo?->nombre_del_grado ?? 'N/A',
                    'tipo_de_movimiento' => $movimiento->tipo_de_movimiento,
                    'status' => $movimiento->status,
                    'created_at' => $movimiento->fecha_registro,
                ];
            });

        // EGRESOS
        $egresadosQuery = (clone $movBase)->where(function ($q) use ($gradeId) {
            $q->where(function ($sub) use ($gradeId) {
                $sub->where('tipo_de_movimiento', 'Egreso')
                    ->where('grado_id_new', $gradeId);
            })->orWhere(function ($sub) use ($gradeId) {
                $sub->where('tipo_de_movimiento', 'Cambio')
                    ->where('grado_id_past', $gradeId);
            });
        });

        $egresados = $egresadosQuery
            ->with(['estudiante', 'gradoAnterior', 'gradoNuevo'])
            ->get()
            ->map(function ($movimiento) {
                $estudiante = $movimiento->estudiante;
                return (object) [
                    'id' => $estudiante->id,
                    'apellido' => $estudiante->apellido,
                    'name' => $estudiante->name,
                    'sexo' => $estudiante->sexo,
                    'age' => Carbon::parse($estudiante->fecha_de_nacimiento)->age,
                    'grado' => $movimiento->tipo_de_movimiento === 'Cambio'
                        ? ($movimiento->gradoAnterior?->nombre_del_grado ?? 'N/A')
                        : ($movimiento->gradoNuevo?->nombre_del_grado ?? 'N/A'),
                    'tipo_de_movimiento' => $movimiento->tipo_de_movimiento,
                    'status' => $movimiento->status,
                    'created_at' => $movimiento->fecha_registro,
                ];
            });

        // --- OBJETOS DE REFERENCIA ---
        $ingresos = collect([(object) [
            'totali'  => $ingresados->count(),
            'totalim' => $ingresados->where('sexo', 'M')->count(),
            'totalif' => $ingresados->where('sexo', 'F')->count(),
        ]]);

        $egresos = collect([(object) [
            'totale'  => $egresados->count(),
            'totalem' => $egresados->where('sexo', 'M')->count(),
            'totalef' => $egresados->where('sexo', 'F')->count(),
        ]]);

        $estadisticas = Estadistica::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->get();

        $director = Institucion::first();

        return [
            'institucion' => $institucion,
            'logoDocumento' => $logoDocumento,
            'grado' => $grado,
            'total_por_edad' => $total_por_edad,
            'matriculaactiva' => $matriculaactiva,
            'asistenciatotal' => $asistenciatotal,
            'asistenciatotalv' => $asistenciatotalv,
            'asistenciatotalh' => $asistenciatotalh,
            'asistenciasss' => $asistenciasss,
            'ingresados' => $ingresados,
            'egresados' => $egresados,
            'ingresos' => $ingresos,
            'egresos' => $egresos,
            'estadisticas' => $estadisticas,
            'director' => $director,
        ];
    }

    private function updateHistorialEstadistica(int $gradeId, int $year, int $month, Carbon $date)
    {
        HistorialEstadistica::where('grado_id', $gradeId)
            ->where(function ($query) use ($year, $month) {
                $query->whereYear('fecha', '!=', $year)
                    ->orWhereMonth('fecha', '!=', $month);
            })
            ->update(['status_estadistica' => 'Inactivo']);

        $historial = HistorialEstadistica::where('grado_id', $gradeId)
            ->whereYear('fecha', $year)
            ->whereMonth('fecha', $month)
            ->first();

        if ($historial) {
            $historial->update([
                'contador' => $historial->contador + 1,
                'status_estadistica' => 'Activo'
            ]);
        } else {
            HistorialEstadistica::create([
                'grado_id' => $gradeId,
                'fecha' => $date->startOfMonth()->format('Y-m-d'),
                'contador' => 1,
                'status_estadistica' => 'Activo'
            ]);
        }
    }


    public function EstadisticaGeneral(Request $request)
    {
        $monthYear = $request->input('month_year');

        if (!$monthYear) {
            return redirect()->back()
                ->with('error', 'Debe seleccionar un mes válido para generar el reporte.');
        }

        Carbon::setLocale('es');
        list($year, $month) = explode('-', $monthYear);
        $year = (int)$year;
        $month = (int)$month;

        // --- DATOS DE CONFIGURACIÓN ---
        $estadisticas = Estadistica::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->get();

        $diasLaborados = $estadisticas->isNotEmpty() ? $estadisticas->first()->dias_laborados : 0;

        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');

        $periodo_escolar_actual = PeriodoHelper::getActivoNombrePeriodo();
        $periodo_escolar_pasado = PeriodoHelper::getInactivoNombrePeriodo();
        $proceso_de_inscripcion = PeriodoEscolar::first()->proceso_de_inscripcion ?? 'Cerrado';
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // --- LÓGICA DE PERSONAL ---
        $total_empleados = EmpleadoActivo::selectRaw('count(*) as total')
            ->selectRaw("count(case when tipo_de_personal = 'Obrero' then 1 end) as obreroTotal")
            ->selectRaw("count(case when tipo_de_personal = 'Docente' then 1 end) as docenteTotal")
            ->selectRaw("count(case when tipo_de_personal = 'Administrativo' then 1 end) as adminTotal")
            ->selectRaw("count(case when tipo_de_personal = 'Vigilante' then 1 end) as vigiTotal")
            ->selectRaw("count(case when tipo_de_personal = 'Cenae' then 1 end) as cenaeTotal")
            ->selectRaw("count(case when tipo_de_personal = 'Obrero' && status_del_cargo = 'Nacional' then 1 end) as obreroN")
            ->selectRaw("count(case when tipo_de_personal = 'Obrero' && status_del_cargo = 'Estadal' then 1 end) as obreroE")
            ->selectRaw("count(case when tipo_de_personal = 'Docente' && status_del_cargo = 'Nacional' then 1 end) as docenteN")
            ->selectRaw("count(case when tipo_de_personal = 'Docente' && status_del_cargo = 'Estadal' then 1 end) as docenteE")
            ->selectRaw("count(case when tipo_de_personal = 'Administrativo' && status_del_cargo = 'Nacional' then 1 end) as adminN")
            ->selectRaw("count(case when tipo_de_personal = 'Administrativo' && status_del_cargo = 'Estadal' then 1 end) as adminE")
            ->selectRaw("count(case when tipo_de_personal = 'Vigilante' && status_del_cargo = 'Nacional' then 1 end) as vigiN")
            ->selectRaw("count(case when tipo_de_personal = 'Vigilante' && status_del_cargo = 'Estadal' then 1 end) as vigiE")
            ->selectRaw("count(case when tipo_de_personal = 'Cenae' && status_del_cargo = 'Nacional' then 1 end) as cenaeN")
            ->selectRaw("count(case when tipo_de_personal = 'Cenae' && status_del_cargo = 'Estadal' then 1 end) as cenaeE")
            ->get();

        $totalesPers = $total_empleados->first();
        $asistenciasReales = DB::table('asistencia_empleados')
            ->whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->where('status', 'Asistio')
            ->select('tipo_de_cargo', DB::raw('count(*) as total'))
            ->groupBy('tipo_de_cargo')
            ->pluck('total', 'tipo_de_cargo');

        $porcentajesPersonal = [];
        $sumAsis = 0;
        $sumPos = 0;

        $cargosMap = [
            'Docente' => $totalesPers->docenteTotal ?? 0,
            'Obrero' => $totalesPers->obreroTotal ?? 0,
            'Administrativo' => $totalesPers->adminTotal ?? 0,
            'Cenae' => $totalesPers->cenaeTotal ?? 0,
            'Vigilante' => $totalesPers->vigiTotal ?? 0
        ];

        foreach ($cargosMap as $cargo => $totalCant) {
            $asistieron = $asistenciasReales[$cargo] ?? 0;
            $posible = $totalCant * $diasLaborados;
            if ($posible > 0) {
                $calculo = ($asistieron / $posible) * 100;
                $porcentajesPersonal[$cargo] = $calculo > 100 ? 100 : $calculo;
            } else {
                $porcentajesPersonal[$cargo] = 0;
            }
            $sumAsis += $asistieron;
            $sumPos += $posible;
        }

        $porcentajeTotalPersonal = $sumPos > 0 ? ($sumAsis / $sumPos) * 100 : 0;
        if ($porcentajeTotalPersonal > 100) $porcentajeTotalPersonal = 100;

        // --- MOVIMIENTOS ACTUALIZADOS ---
        $periodoActivoId = PeriodoHelper::getActivoId();

        // --- INGRESOS DEL MES ---
        $ingresosQuery = Movimiento::where('periodo_id', $periodoActivoId)
            ->where('tipo_de_movimiento', 'Ingreso')
            ->whereMonth('fecha_registro', $month)
            ->whereYear('fecha_registro', $year);

        $ingresados = $ingresosQuery
            ->with(['estudiante', 'gradoNuevo'])
            ->get()
            ->map(function ($movimiento) {
                $estudiante = $movimiento->estudiante;
                return (object) [
                    'apellido' => $estudiante->apellido,
                    'name' => $estudiante->name,
                    'sexo' => $estudiante->sexo,
                    'age' => Carbon::parse($estudiante->fecha_de_nacimiento)->age,
                    'grado' => $movimiento->gradoNuevo?->nombre_del_grado ?? 'N/A',
                    'status' => $movimiento->status,
                    'created_at' => $movimiento->fecha_registro,
                ];
            });

        // --- EGRESOS DEL MES ---
        $egresosQuery = Movimiento::where('periodo_id', $periodoActivoId)
            ->where('tipo_de_movimiento', 'Egreso')
            ->whereMonth('fecha_registro', $month)
            ->whereYear('fecha_registro', $year);

        $egresados = $egresosQuery
            ->with(['estudiante', 'gradoNuevo'])
            ->get()
            ->map(function ($movimiento) {
                $estudiante = $movimiento->estudiante;
                return (object) [
                    'apellido' => $estudiante->apellido,
                    'name' => $estudiante->name,
                    'sexo' => $estudiante->sexo,
                    'age' => Carbon::parse($estudiante->fecha_de_nacimiento)->age,
                    'grado' => $movimiento->gradoNuevo?->nombre_del_grado ?? 'N/A',
                    'status' => $movimiento->status,
                    'created_at' => $movimiento->fecha_registro,
                ];
            });

        // Totales de ingresos/egresos
        $ingresosTotales = (object) [
            'ingresot' => $ingresados->count(),
            'ingresoM' => $ingresados->where('sexo', 'M')->count(),
            'ingresoF' => $ingresados->where('sexo', 'F')->count(),
        ];

        $egresosTotales = (object) [
            'egresot' => $egresados->count(),
            'egresoM' => $egresados->where('sexo', 'M')->count(),
            'egresoF' => $egresados->where('sexo', 'F')->count(),
        ];

        // Lista detallada para la tabla del PDF
        $ingresos = $ingresados;
        $egresos = $egresados;

        // --- LÓGICA DE ESTUDIANTES (MATRÍCULA) ---
        $queryMatricula = MatriculaEstadistica::whereMonth('fecha_registro', $month)
            ->whereYear('fecha_registro', $year);

        $estudiantesactuales = (clone $queryMatricula)
            ->selectRaw("SUM(cantidad) as totalactuales, SUM(CASE WHEN sexo='M' THEN cantidad ELSE 0 END) as totalactualesM, SUM(CASE WHEN sexo='F' THEN cantidad ELSE 0 END) as totalactualesF")
            ->get();

        $totalalumnos = (clone $queryMatricula)
            ->selectRaw("SUM(CASE WHEN sexo='M' THEN cantidad ELSE 0 END) as totalm, SUM(CASE WHEN sexo='F' THEN cantidad ELSE 0 END) as totalf")
            ->get();

        $grados = (clone $queryMatricula)
            ->join('grados as g', 'g.id', 'matricula_estadisticas.grado_id')
            ->select('g.nombre_del_grado as grado')
            ->selectRaw("SUM(cantidad) as total, SUM(CASE WHEN sexo='M' THEN cantidad ELSE 0 END) as totalm, SUM(CASE WHEN sexo='F' THEN cantidad ELSE 0 END) as totalf")
            ->groupBy('grado')
            ->get();

        // Edades - construcción dinámica
        $edadesSelect = "SUM(cantidad) as total, SUM(CASE WHEN sexo='M' THEN cantidad ELSE 0 END) as totalm, SUM(CASE WHEN sexo='F' THEN cantidad ELSE 0 END) as totalf";
        $nombres = [4 => 'cuatro', 5 => 'cinco', 6 => 'seis', 7 => 'siete', 8 => 'ocho', 9 => 'nueve', 10 => 'diez', 11 => 'once', 12 => 'doce', 13 => 'trece', 14 => 'catorce', 15 => 'quince', 16 => 'dieciseis'];
        foreach ($nombres as $num => $txt) {
            $edadesSelect .= ", SUM(CASE WHEN sexo='M' AND edad=$num THEN cantidad ELSE 0 END) as {$txt}m";
            $edadesSelect .= ", SUM(CASE WHEN sexo='F' AND edad=$num THEN cantidad ELSE 0 END) as {$txt}f";
        }

        $total_alumnos_por_edad = (clone $queryMatricula)->selectRaw($edadesSelect)->get();
        $total_alumnos_por_edad_y_grado = (clone $queryMatricula)
            ->join('grados as g', 'g.id', 'matricula_estadisticas.grado_id')
            ->select('g.nombre_del_grado as grado')
            ->selectRaw($edadesSelect)
            ->groupBy('grado')
            ->get();

        // --- ASISTENCIA ESTUDIANTES ---
        $asisQuery = DB::table('asistencia_estudiantes')
            ->whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->join('grados as g', 'g.id', 'asistencia_estudiantes.grado_id');

        $asistenciasv = (clone $asisQuery)
            ->selectRaw('g.nombre_del_grado as grado, SUM(varones) as totalv')
            ->groupBy('grado')
            ->get();

        $asistenciash = (clone $asisQuery)
            ->selectRaw('g.nombre_del_grado as grado, SUM(hembras) as totalh')
            ->groupBy('grado')
            ->get();

        $asistenciastotales = (clone $asisQuery)
            ->selectRaw('g.nombre_del_grado as grado, SUM(hembras + varones) as total')
            ->groupBy('grado')
            ->get();

        $asistenciasss = (clone $asisQuery)
            ->selectRaw('g.nombre_del_grado as equipo, SUM(varones) as totalv, SUM(hembras) as totalh')
            ->groupBy('equipo')
            ->get();

        $asistenciastv = DB::table('asistencia_estudiantes')
            ->whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->selectRaw('SUM(varones) as totalesv')
            ->get();

        $asistenciasth = DB::table('asistencia_estudiantes')
            ->whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->selectRaw('SUM(hembras) as totalesh')
            ->get();

        $asistenciascount = AsistenciaEstudiante::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->count();

        // --- Generación del PDF ---
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.estadisticas.estadistica-general-del-mes', compact(
            'asistenciascount',
            'totalalumnos',
            'estudiantesactuales',
            'ingresados',
            'egresados',
            'grados',
            'logoDocumento',
            'asistenciasv',
            'asistenciastv',
            'asistenciash',
            'asistenciasth',
            'total_empleados',
            'periodo_escolar_actual',
            'periodo_escolar_pasado',
            'estadisticas',
            'institucion',
            'asistenciastotales',
            'total_alumnos_por_edad',
            'total_alumnos_por_edad_y_grado',
            'asistenciasss',
            'ingresos',
            'egresos',
            'porcentajesPersonal',
            'porcentajeTotalPersonal',
            'proceso_de_inscripcion',
            'ingresosTotales',
            'egresosTotales'
        ));

        $pdf->setPaper("letter", "landscape");
        return $pdf->stream("Estadistica_General_{$month}_{$year}.pdf");
    }

    //Respoinsables padres madres
    public function constanciadeparticipacionPDF(int $responsableId)
    {
        $idResponsable = $responsableId;

        $suma = 1;
        Carbon::setLocale('es');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->find(1);
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');

        $responsable = Responsable::find($idResponsable);
        $title = 'Constancia de participación';
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');
        $pdf = pdf::loadView('pdfs.estudiantesPDF.constancia-de-participacion-representante', compact(
            'responsable',
            'dia',
            'mes',
            'title',
            'aho',
            'suma',
            'institucion',
            'logoDocumento'
        ));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Ficha de Incripcion Inicial.pdf'); //visualizar
    }


    //Listo
    public function MatriculaGeneral()
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $institucion = Institucion::all();
        $logo = Logo::first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        // 2. Total de matrícula (estudiantes ACTIVOS del período actual)
        $totalmatricula = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as totalm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as totalf")
            ->first();

        // 🔥 Si no hay resultados, crear un objeto con valores en 0
        if (!$totalmatricula) {
            $totalmatricula = (object) [
                'total' => 0,
                'totalm' => 0,
                'totalf' => 0
            ];
        }

        // 3. Total por grado
        $totalporgrado = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'estudiante_periodos.grado_id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select('g.nombre_del_grado as grado')
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as totalm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as totalf")
            ->groupBy('grado')
            ->orderBy('grado')
            ->get();

        // 4. Total por grado y sección
        $totalporgradoiseccion = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'estudiante_periodos.grado_id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select('g.nombre_del_grado as grado', 'g.seccion as seccion')
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as totalm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as totalf")
            ->groupBy('grado', 'seccion')
            ->orderBy('grado')
            ->get();

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-general', compact(
            'institucion',
            'logoDocumento',
            'logoInstitucion',
            'totalmatricula',
            'totalporgrado',
            'totalporgradoiseccion'
        ));

        return $pdf->setPaper("Letter", "portrait")->stream('Matricula_General.pdf');
    }

    protected $ages = [];

    //Listo
    public function DataUniforme()
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // Arrays de referencia
        $tallasCamisaPantalon = ['2', '4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L'];
        $tallasZapatos = ['24', '25', '26', '27', '28', '29', '30', '32', '34', '35', '36', '37', '38', '39', '40', '41', '42'];

        // 2. Obtener estudiantes ACTIVOS del período actual
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select(
                'estudiantes.sexo',
                'estudiante_periodos.talla_de_camisa',
                'estudiante_periodos.talla_de_pantalon',
                'estudiante_periodos.talla_de_zapato'
            )
            ->get();

        // Inicializar matrices con CEROS
        $dataCamisa = ['BLANCA' => array_fill_keys($tallasCamisaPantalon, 0)];
        $dataPantalon = [
            'VARONES' => array_fill_keys($tallasCamisaPantalon, 0),
            'HEMBRAS' => array_fill_keys($tallasCamisaPantalon, 0)
        ];
        $dataZapatos = [
            'VARONES' => array_fill_keys($tallasZapatos, 0),
            'HEMBRAS' => array_fill_keys($tallasZapatos, 0)
        ];

        foreach ($estudiantes as $est) {
            $sexo = (in_array(strtoupper($est->sexo), ['M', 'MASCULINO', 'VARON'])) ? 'VARONES' : 'HEMBRAS';

            // PROCESAR CAMISA
            $tCamisa = $this->mapearTallaRopa(ltrim($est->talla_de_camisa, '0'));
            if (array_key_exists($tCamisa, $dataCamisa['BLANCA'])) {
                $dataCamisa['BLANCA'][$tCamisa]++;
            }

            // PROCESAR PANTALÓN
            $tPantalon = $this->mapearTallaRopa(ltrim($est->talla_de_pantalon, '0'));
            if (array_key_exists($tPantalon, $dataPantalon[$sexo])) {
                $dataPantalon[$sexo][$tPantalon]++;
            }

            // PROCESAR ZAPATOS
            $tZapato = $this->mapearTallaZapato(ltrim($est->talla_de_zapato, '0'));
            if (array_key_exists($tZapato, $dataZapatos[$sexo])) {
                $dataZapatos[$sexo][$tZapato]++;
            }
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.data-uniforme', compact(
            'institucion',
            'dataCamisa',
            'dataPantalon',
            'dataZapatos',
            'tallasCamisaPantalon',
            'tallasZapatos'
        ));

        return $pdf->setPaper("Letter", "landscape")->stream('Data Uniforme.pdf');
    }

    /**
     * Mapear talla de ropa (camisa/pantalón)
     */
    private function mapearTallaRopa($talla)
    {
        if (empty($talla)) return 'S';

        // Limpiar y normalizar
        $talla = trim($talla);

        // Si es número, asegurar que esté en el array
        if (is_numeric($talla)) {
            $talla = (string) $talla;
            // Si es 0 o negativo, usar S
            if ((int)$talla <= 0) return 'S';
            return $talla;
        }

        // Si es letra (S, M, L), normalizar mayúscula
        $talla = strtoupper($talla);
        if (in_array($talla, ['S', 'M', 'L'])) {
            return $talla;
        }

        return 'S'; // default
    }

    /**
     * Mapear talla de zapato
     */
    private function mapearTallaZapato($talla)
    {
        if (empty($talla)) return '24';

        $talla = trim($talla);

        if (is_numeric($talla)) {
            $talla = (string) $talla;
            if ((int)$talla < 24) return '24';
            return $talla;
        }

        return '24'; // default
    }

    //Listo
    public function MatriculaPorEdadySexo()
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Consulta usando estudiante_periodos
        $reporteRaw = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select(
                'grados.nombre_del_grado as grado',
                'estudiantes.sexo',
                DB::raw('TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) as age'),
                DB::raw('count(*) as total_estudiantes')
            )
            ->groupBy('grados.nombre_del_grado', 'estudiantes.sexo', 'age')
            ->orderBy('grados.nombre_del_grado')
            ->orderBy('estudiantes.sexo')
            ->orderBy('age')
            ->get();

        $processedReport = [];
        $uniqueAges = collect();
        $grandTotal = 0;
        $totalByAgeColumn = [];

        foreach ($reporteRaw as $item) {
            $grado = $item->grado;
            $sexo = $item->sexo;
            $age = $item->age;
            $totalEstudiantes = $item->total_estudiantes;

            if (!isset($processedReport[$grado])) {
                $processedReport[$grado] = [
                    'M' => ['total_fila' => 0],
                    'F' => ['total_fila' => 0],
                ];
            }

            $processedReport[$grado][$sexo][$age] = $totalEstudiantes;
            $processedReport[$grado][$sexo]['total_fila'] += $totalEstudiantes;

            if (!$uniqueAges->contains($age)) {
                $uniqueAges->push($age);
            }

            $grandTotal += $totalEstudiantes;
            $totalByAgeColumn[$age] = ($totalByAgeColumn[$age] ?? 0) + $totalEstudiantes;
        }

        $uniqueAges = $uniqueAges->sort()->values();

        $reportTotals = [
            'totalByAgeColumn' => $totalByAgeColumn,
            'grandTotal' => $grandTotal
        ];

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-por-grado-edad-y-sexo', compact('processedReport', 'uniqueAges', 'reportTotals'));
        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Matricula por grado, edad, y genero.pdf');
    }

    //Listo
    public function MatriculaRepitiente()
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Consulta usando estudiante_periodos
        $reporteRaw = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->where('estudiante_periodos.condicion', '=', 'Repitiente')
            ->select(
                'grados.nombre_del_grado as grado',
                'grados.seccion as seccion',
                'estudiantes.sexo',
                DB::raw('count(*) as total_estudiantes')
            )
            ->groupBy('grados.nombre_del_grado', 'grados.seccion', 'estudiantes.sexo')
            ->orderBy('grados.nombre_del_grado')
            ->orderBy('grados.seccion')
            ->orderBy('estudiantes.sexo')
            ->get();

        $processedReport = [];
        $uniqueSections = collect();
        $grandTotal = 0;
        $totalBySectionColumn = [];

        foreach ($reporteRaw as $item) {
            $grado = $item->grado;
            $seccion = $item->seccion;
            $sexo = $item->sexo;
            $totalEstudiantes = $item->total_estudiantes;

            if (!isset($processedReport[$grado])) {
                $processedReport[$grado] = [
                    'M' => ['total_fila' => 0],
                    'F' => ['total_fila' => 0],
                ];
            }

            $processedReport[$grado][$sexo][$seccion] = ($processedReport[$grado][$sexo][$seccion] ?? 0) + $totalEstudiantes;
            $processedReport[$grado][$sexo]['total_fila'] += $totalEstudiantes;

            if (!$uniqueSections->contains($seccion)) {
                $uniqueSections->push($seccion);
            }

            $grandTotal += $totalEstudiantes;
            $totalBySectionColumn[$seccion] = ($totalBySectionColumn[$seccion] ?? 0) + $totalEstudiantes;
        }

        $uniqueSections = $uniqueSections->sort()->values();

        $reportData = [
            'processedReport' => $processedReport,
            'uniqueAges' => $uniqueSections,
            'reportTotals' => [
                'totalByAgeColumn' => $totalBySectionColumn,
                'grandTotal' => $grandTotal
            ],
            'isSectionReport' => true
        ];

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-repitiente', array_merge($reportData, ['title' => 'Reporte: Estudiantes Repitientes (Grado, Sección, Género)']));
        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Matricula Repitiente.pdf');
    }

    //Listo
    public function ReporteMatriculaEspecialUnificado()
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 1. Condición Especial (Los que NO tienen "Ninguna")
        $dataCondicion = $this->getProcessedMatrixData('estudiantes.condicion_especial', '!=', 'Ninguna', $periodoId);

        // 2. Etnias (Los que NO tienen "Ninguna")
        $dataEtnia = $this->getProcessedMatrixData('estudiantes.etnia', '!=', 'Ninguna', $periodoId);

        // 3. Vuelta a la Patria (Los que tienen "Otros")
        $dataVuelta = $this->getProcessedMatrixData('estudiante_periodos.status_escolar', '=', 'Otros', $periodoId);

        // 4. No Escolarizados (Los que tienen "No escolarizado")
        $dataNoEscolarizado = $this->getProcessedMatrixData('estudiante_periodos.status_escolar', '=', 'No escolarizado', $periodoId);

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.reporte-especial-unificado', [
            'condicion'      => $dataCondicion,
            'etnia'          => $dataEtnia,
            'vuelta'         => $dataVuelta,
            'noEscolarizado' => $dataNoEscolarizado
        ]);

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Reporte_Matricula_Integral.pdf');
    }
    //Listo seguanda parte de ReporteMatriculaEspecialUnificado
    private function getProcessedMatrixData(string $campo, string $operador, string $valor, int $periodoId)
    {
        // Construir la consulta base
        $query = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo');

        // Aplicar filtro según el campo (puede ser de estudiantes o de estudiante_periodos)
        if (str_contains($campo, 'estudiantes.')) {
            $query->where($campo, $operador, $valor);
        } else {
            $query->where($campo, $operador, $valor);
        }

        $reporteRaw = $query->select(
            'grados.nombre_del_grado as grado',
            'estudiantes.sexo',
            DB::raw('TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) as age'),
            DB::raw('count(*) as total_estudiantes')
        )
            ->groupBy('grados.nombre_del_grado', 'estudiantes.sexo', 'age')
            ->orderBy('grados.nombre_del_grado')
            ->orderBy('estudiantes.sexo')
            ->get();

        $processedReport = [];
        $uniqueAges = collect();
        $grandTotal = 0;
        $totalByAgeColumn = [];

        foreach ($reporteRaw as $item) {
            $grado = $item->grado;
            $sexo = $item->sexo;
            $age = $item->age;
            $totalEstudiantes = $item->total_estudiantes;

            if (!isset($processedReport[$grado])) {
                $processedReport[$grado] = [
                    'M' => ['total_fila' => 0],
                    'F' => ['total_fila' => 0],
                ];
            }

            $processedReport[$grado][$sexo][$age] = $totalEstudiantes;
            $processedReport[$grado][$sexo]['total_fila'] += $totalEstudiantes;

            if (!$uniqueAges->contains($age)) {
                $uniqueAges->push($age);
            }

            $grandTotal += $totalEstudiantes;
            $totalByAgeColumn[$age] = ($totalByAgeColumn[$age] ?? 0) + $totalEstudiantes;
        }

        return [
            'processedReport' => $processedReport,
            'uniqueAges'      => $uniqueAges->sort()->values(),
            'reportTotals'    => [
                'totalByAgeColumn' => $totalByAgeColumn,
                'grandTotal' => $grandTotal
            ]
        ];
    }

    //Listo
    private function reporteMovimientosUnificado(string $monthYear, string $tipo)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // Preparamos la fecha
        $fecha = Carbon::parse($monthYear);
        $anio = $fecha->year;
        $mes = $fecha->month;

        // Query Base común usando estudiante_periodos
        $queryBase = Movimiento::join('estudiantes', 'movimientos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'movimientos.grado_id_new') // 🔥 Usar grado_id_new
            ->where('movimientos.periodo_id', $periodoId) // 🔥 Filtrar por período activo
            ->whereYear('movimientos.fecha_registro', $anio)
            ->select(
                'g.nombre_del_grado as grado',
                'g.seccion as seccion'
            )
            ->selectRaw('count(*) as totals')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as sexosm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as sexosf")
            ->groupBy('grado', 'seccion')
            ->orderBy('grado');

        if ($tipo === 'mensual') {
            $queryBase->whereMonth('movimientos.fecha_registro', $mes);
            $titulo = "INGRESOS Y EGRESOS MENSUALES - " . strtoupper($fecha->translatedFormat('F')) . " " . $anio;
        } else {
            $titulo = "INGRESOS Y EGRESOS ANUALES - " . $anio;
        }

        // Clonamos la query para separar Ingresos y Egresos
        $ingreso = (clone $queryBase)->where('movimientos.tipo_de_movimiento', 'Ingreso')->get()->groupBy('grado');
        $egreso = (clone $queryBase)->where('movimientos.tipo_de_movimiento', 'Egreso')->get()->groupBy('grado');

        $pdf = Pdf::loadView(
            'PDFS.estudiantesPDF.matriculas.reporte-movimientos',
            compact('institucion', 'ingreso', 'egreso', 'titulo')
        );

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream($titulo . '.pdf');
    }

    //Listo
    public function CambiosDeGrado(string $monthYear)
    {
        Carbon::setLocale('es');

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // 2. Extraer año y mes del parámetro
        $fecha = Carbon::parse($monthYear);
        $anio = $fecha->year;
        $mes = $fecha->month;

        // 3. 🔥 Consulta con LEFT JOIN para evitar que los grados vacíos rompan la consulta
        $cambios = Movimiento::where('movimientos.tipo_de_movimiento', 'Cambio')
            ->where('movimientos.periodo_id', $periodoId)
            ->whereYear('movimientos.fecha_registro', $anio)
            ->whereMonth('movimientos.fecha_registro', $mes)
            ->join('estudiantes', 'movimientos.estudiante_id', '=', 'estudiantes.id')
            ->leftJoin('grados as ganterior', 'ganterior.id', '=', 'movimientos.grado_id_past')
            ->leftJoin('grados as gactual', 'gactual.id', '=', 'movimientos.grado_id_new')
            ->select(
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'movimientos.fecha_registro',
                'ganterior.nombre_del_grado as grado_anterior',
                'ganterior.seccion as seccion_anterior',
                'gactual.nombre_del_grado as grado_nuevo',
                'gactual.seccion as seccion_nuevo',
                'movimientos.grado_id_past',
                'movimientos.grado_id_new'
            )
            ->orderBy('movimientos.fecha_registro', 'asc')
            ->get();

        // 4. 🔥 DEPURACIÓN: Ver qué está llegando
        // dd($cambios->toArray(), $periodoId, $anio, $mes);

        $nombreMes = strtoupper($fecha->translatedFormat('F'));
        $tituloReporte = "CAMBIOS DE GRADO - $nombreMes $anio";

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.cambios-de-grado', [
            'institucion' => $institucion,
            'cambios' => $cambios,
            'titulo' => $tituloReporte
        ]);

        $pdf->setPaper("Letter", "landscape");
        return $pdf->stream("Cambios_de_Grado_{$nombreMes}_{$anio}.pdf");
    }

    //Listo
    public function ListadoGeneralAprobadosReprobados(Request $request)
    {
        $logo = Logo::first();

        // 1. Obtener período desde la petición
        $periodoId = $request->input('periodoId');

        if (!$periodoId) {
            return redirect()->back()->with('error', 'Debe seleccionar un período para generar el reporte.');
        }

        $periodo = PeriodoEscolar::find($periodoId);

        if (!$periodo) {
            return redirect()->back()->with('error', 'Período no encontrado.');
        }

        $periodo_escolar = $periodo->nombre_periodo;

        // Rutas de logos
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // 2. Consulta de estudiantes del período seleccionado
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'estudiante_periodos.grado_id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Reprobado', 'Graduado'])
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.status',
                'g.nombre_del_grado as grado',
                'g.seccion as seccion',
                'g.docente as docente'
            )
            ->get();

        // 3. Agrupar por grado y sección
        $estudiantesPorGradoSeccion = $estudiantes
            ->groupBy(function ($item) {
                return $item->grado . ' - SECCIÓN "' . $item->seccion . '"';
            })
            ->map(function ($estudiantes) {
                $aprobados = $estudiantes->where('status', 'Aprobado');
                $reprobados = $estudiantes->where('status', 'Reprobado');
                $graduados = $estudiantes->where('status', 'Graduado');

                return [
                    'estudiantes' => $estudiantes,
                    'totales' => [
                        'aprobados_m' => $aprobados->where('sexo', 'M')->count(),
                        'aprobados_f' => $aprobados->where('sexo', 'F')->count(),
                        'reprobados_m' => $reprobados->where('sexo', 'M')->count(),
                        'reprobados_f' => $reprobados->where('sexo', 'F')->count(),
                        'graduados_m' => $graduados->where('sexo', 'M')->count(),
                        'graduados_f' => $graduados->where('sexo', 'F')->count(),
                    ]
                ];
            })
            ->sortKeys();

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.listado-general-aprobados-reprobados', compact(
            'estudiantesPorGradoSeccion',
            'periodo_escolar',
            'institucion',
            'logoDocumento',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Listado_General_Evaluacion.pdf');
    }

    //Listo
    public function matriculaInicial(string $periodo_escolar)
    {
        $institucion = Institucion::all();

        // 1. TOTAL GENERAL
        $totalmatricula = MatriculaInicial::where('periodo_escolar', $periodo_escolar)
            ->selectRaw('SUM(total_general) as total, SUM(total_varones) as totalm, SUM(total_hembras) as totalf')
            ->get();

        // 2. TOTAL POR GRADO (usando nombre_grado_snapshot porque no tenemos grado_id)
        $totalporgrado = MatriculaInicial::where('periodo_escolar', $periodo_escolar)
            ->select('nombre_grado_snapshot as grado_nombre')
            ->selectRaw('SUM(total_general) as total, SUM(total_varones) as totalm, SUM(total_hembras) as totalf')
            ->groupBy('nombre_grado_snapshot')
            ->orderBy('nombre_grado_snapshot')
            ->get();

        // 3. TOTAL POR GRADO Y SECCIÓN (Detalle)
        $totalporgradoiseccion = MatriculaInicial::where('periodo_escolar', $periodo_escolar)
            ->select('nombre_grado_snapshot as grado_completo', 'total_general as total', 'total_varones as totalm', 'total_hembras as totalf')
            ->orderBy('id', 'asc')
            ->get();

        // 4. TOTAL POR GRADO, SEXO Y EDADES
        $selectRawEdades = "nombre_grado_snapshot as grado_nombre, SUM(total_general) as total_grado, SUM(total_varones) as total_v, SUM(total_hembras) as total_h";
        for ($i = 4; $i <= 16; $i++) {
            $selectRawEdades .= ", SUM(v_$i) as v_$i, SUM(h_$i) as h_$i";
        }

        $totalporedades = MatriculaInicial::where('periodo_escolar', $periodo_escolar)
            ->selectRaw($selectRawEdades)
            ->groupBy('nombre_grado_snapshot')
            ->orderBy('nombre_grado_snapshot')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-inicial', compact(
            'institucion',
            'totalmatricula',
            'totalporgrado',
            'totalporgradoiseccion',
            'totalporedades',
            'periodo_escolar'
        ));

        return $pdf->setPaper('letter', 'landscape')->stream('Matricula Inicial ' . $periodo_escolar . '.pdf');
    }
    //Listo
    public function matriculaFinal(string $periodo_escolar)
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // 1. TOTAL GENERAL
        $totalmatricula = MatriculaFinal::where('periodo_escolar', $periodo_escolar)
            ->selectRaw('SUM(total_general) as total')
            ->selectRaw('SUM(total_varones) as totalm')
            ->selectRaw('SUM(total_hembras) as totalf')
            ->first();

        // 🔥 Si no hay resultados, crear un objeto con valores en 0
        if (!$totalmatricula) {
            $totalmatricula = (object) [
                'total' => 0,
                'totalm' => 0,
                'totalf' => 0
            ];
        }

        // 2. TOTAL POR GRADO (con JOIN)
        $totalporgrado = MatriculaFinal::join('grados', 'grados.id', '=', 'matricula_finals.grado_id')
            ->where('matricula_finals.periodo_escolar', $periodo_escolar)
            ->select('grados.nombre_del_grado as grado')
            ->selectRaw('SUM(total_general) as total')
            ->selectRaw('SUM(total_varones) as totalm')
            ->selectRaw('SUM(total_hembras) as totalf')
            ->groupBy('grados.nombre_del_grado')
            ->orderByRaw('MIN(grados.id) ASC')
            ->get();

        // 3. TOTAL POR GRADO Y SECCIÓN
        $totalporgradoiseccion = MatriculaFinal::where('periodo_escolar', $periodo_escolar)
            ->select(
                'nombre_grado_snapshot as grado_completo',
                'total_general as total',
                'total_varones as totalm',
                'total_hembras as totalf'
            )
            ->orderBy('grado_id', 'asc')
            ->get();

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-final', compact(
            'institucion',
            'totalmatricula',
            'totalporgrado',
            'totalporgradoiseccion',
            'periodo_escolar'
        ));

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Matricula Final ' . $periodo_escolar . '.pdf');
    }

    //Listo
    public function matriculaOficial(string $periodo_escolar)
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        $comparativa = DB::table('matricula_inicials as i')
            ->leftJoin('matricula_finals as f', function ($join) {
                $join->on('i.grado_id', '=', 'f.grado_id')
                    ->on('i.periodo_escolar', '=', 'f.periodo_escolar');
            })
            ->where('i.periodo_escolar', $periodo_escolar)
            ->select(
                'i.nombre_grado_snapshot as grado',
                'i.total_varones as ini_m',
                'i.total_hembras as ini_f',
                'i.total_general as ini_t',
                'f.total_varones as fin_m',
                'f.total_hembras as fin_f',
                'f.total_general as fin_t'
            )
            ->orderBy('i.grado_id', 'asc')
            ->get();

        // Calculamos totales generales para el cuadro superior
        $totales = [
            'ini_t' => $comparativa->sum('ini_t'),
            'fin_t' => $comparativa->sum('fin_t'),
            'diferencia' => $comparativa->sum('fin_t') - $comparativa->sum('ini_t')
        ];

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.matriculas.matricula-oficial', compact(
            'institucion',
            'comparativa',
            'totales',
            'periodo_escolar'
        ));

        $pdf->setPaper("Letter", "landscape");
        return $pdf->stream('Matricula Oficial Comparativa ' . $periodo_escolar . '.pdf');
    }

    //Listo
    public function exportMatriculasisge(Request $request)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $institucion = Institucion::all();
        $logo = Logo::first();

        // Imagen Izquierda
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Imagen Derecha
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        // 2. Totales generales
        $sm = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as totalm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as totalf")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatri")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'M' then 1 end) as totalmatriM")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'F' then 1 end) as totalmatriF")
            ->first();

        // 3. Totales por grado
        $sfg = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'estudiante_periodos.grado_id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select('g.nombre_del_grado as grado')
            ->selectRaw('count(*) as totalmf')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as sexom")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as sexof")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatrig")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'M' then 1 end) as totalmatriMg")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'F' then 1 end) as totalmatriFg")
            ->groupBy('grado')
            ->orderBy('grado')
            ->get();

        // 4. Totales por grado y sección
        $smg = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'g.id', '=', 'estudiante_periodos.grado_id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->select('g.nombre_del_grado as grado', 'g.seccion as seccion')
            ->selectRaw('count(*) as totals')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as sexosm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as sexosf")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatrigs")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'M' then 1 end) as totalmatriMgs")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' and estudiantes.sexo = 'F' then 1 end) as totalmatriFgs")
            ->groupBy('grado', 'seccion')
            ->orderBy('grado')
            ->get();

        $pdf = Pdf::loadView('pdfs.estudiantesPDF.matriculas.matricula-sisge', compact(
            'sm',
            'smg',
            'sfg',
            'institucion',
            'logoDocumento',
            'logoInstitucion'
        ));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Matriculación General Sisge.pdf');
    }

    //ficha para registrar manualmente los estudiantes en el sistema
    // --listo
    public function FichaDeRegistro()
    {
        $suma = 1;
        Carbon::setLocale('es');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        $periodoEscolarActual = PeriodoEscolar::first();
        $periodo_escolar = $periodoEscolarActual->periodo_actual;

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.ficha-de-registro', compact(
            'periodo_escolar',
            'suma',
            'institucion',
            'logoDocumento'
        ));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Ficha de Incripcion.pdf'); //visualizar
    }

    // --listo
    public function ListadoDeAsistencias(array $gradoIds)
    {
        $logo = Logo::find(1);
        $mes = \Carbon\Carbon::now()->translatedFormat('F');

        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el listado.');
        }

        $periodoId = $periodoActivo->id;

        $grados = Grado::whereIn('id', $gradoIds)->get();

        foreach ($grados as $grado) {
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->leftJoin('movimientos', function ($join) use ($periodoId) {
                    $join->on('movimientos.estudiante_id', '=', 'estudiantes.id')
                        ->where('movimientos.periodo_id', '=', $periodoId);
                })
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.sexo',
                    'estudiante_periodos.status',
                    'movimientos.tipo_de_movimiento'
                )
                ->orderBy('estudiantes.sexo', 'asc')
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.listado-de-asistencias', compact('grados', 'mes', 'logo'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Asistencias.pdf');
    }

    // --listo
    public function Directorio(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el directorio.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Datos de la institución
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // 3. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 4. Obtener estudiantes ACTIVOS del período actual con sus responsables
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->leftJoin('responsables as r', 'estudiantes.representante_id', '=', 'r.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.sexo',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'r.name_r',
                    'r.fecha_de_nacimiento_r',
                    'r.sexo_r',
                    'r.documento_r',
                    'r.cedula_r',
                    'r.ocupacion_r',
                    'r.direccion_r',
                    'r.telefono_r'
                )
                ->orderBy('estudiantes.sexo', 'asc')
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_directorio = $estudiantes;
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.directorio', compact('grados', 'institucion'));
        $pdf->setPaper("Letter", "landscape");
        return $pdf->stream('Directorio.pdf');
    }

    // --listo
    public function IncripcionInicial(array $gradoIds)
    {

        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar la inscripción inicial.');
        }

        $periodoId = $periodoActivo->id;

        $logo = Logo::find(1);
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.sexo',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'estudiantes.lugar_de_nacimiento',
                    'estudiante_periodos.talla_de_camisa',    // 🔥 AGREGADO
                    'estudiante_periodos.talla_de_pantalon',  // 🔥 AGREGADO
                    'estudiante_periodos.talla_de_zapato',    // 🔥 AGREGADO
                    DB::raw("TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) as age")
                )
                ->orderBy('estudiantes.sexo', 'asc')
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_inscripcion = $estudiantes;
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.incripcion-inicial', compact('grados', 'institucion', 'logo'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Inscripcion Inicial.pdf');
    }

    // --listo
    public function ListaDeVerificacion(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar la lista de verificación.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.id',
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.sexo',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiantes.lugar_de_nacimiento',
                    'estudiante_periodos.status',
                    'estudiante_periodos.status_escolar',
                    'estudiante_periodos.condicion',           // 🔥 AGREGADO
                    'estudiante_periodos.direccion',
                    'estudiante_periodos.lateralidad',
                    DB::raw("TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) as age")  // 🔥 CALCULAR EDAD
                )
                ->orderBy('estudiantes.sexo', 'asc')
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;

            // 4. Calcular estadísticas
            $grado->mgeneral = $estudiantes->count();
            $grado->mgeneralF = $estudiantes->where('sexo', 'F')->count();
            $grado->mgeneralM = $estudiantes->where('sexo', 'M')->count();
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.lista-de-verificacion', compact('grados'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Lista_de_Verificacion.pdf');
    }

    // --listo
    public function ControlAprobadosReprobados(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS con status_escolar Aprobado o Reprobado
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                // ->whereIn('estudiante_periodos.status_escolar', ['Aprobado', 'Reprobado'])
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido'
                )
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.control-aprobados-reprobados', compact('grados','logoDocumento'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Control_AprobadosReprobados.pdf');
    }

    // --listo
    public function ControlDeEvaluaciones(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $logo = Logo::find(1);
        $mes = Carbon::now()->translatedFormat('F');

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido'
                )
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.control-de-evaluaciones', compact('grados', 'mes', 'logo'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Control_de_Evaluaciones.pdf');
    }

    // --listo
    public function Cedulacion(array $gradoIds)
    {
        Carbon::setLocale('es');

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');

        $periodo_escolar = $periodoActivo->nombre_periodo;

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.id',
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'estudiantes.sexo',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiantes.lugar_de_nacimiento',
                    'estudiante_periodos.direccion',
                    'estudiante_periodos.condicion'  // 🔥 AGREGADO
                )
                ->orderBy('estudiantes.cedula', 'asc')
                ->get();

            $grado->estudiantes_cedulacion = $estudiantes;
            $grado->mgeneral = $estudiantes->count();
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.cedulacion', compact(
            'periodo_escolar',
            'grados',
            'institucion',
            'dia',
            'mes',
            'aho',
            'logoDocumento'
        ));

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Cedulacion.pdf');
    }

    // --listo
    public function ControlDeActividades(Request $request)
    {

        // 1. Validar request
        $request->validate([
            'grado_ids' => 'required',
            'campos'    => 'required',
            'titulos'   => 'required',
        ]);

        // 2. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 3. Decodificar datos
        $gradoIds = json_decode($request->grado_ids, true);

        if (empty($gradoIds)) {
            return back()->with('error', 'Debe seleccionar al menos un grado.');
        }

        $columnasSeleccionadas = json_decode($request->campos, true);
        $titulosPersonalizados = json_decode($request->titulos, true);
        $filasVacias = (int) $request->filas_vacias;
        $tituloReporte = $request->titulo_reporte ?? "CONTROL ESTUDIANTIL";
        $paper = $request->input('paper', 'letter');
        $orientation = $request->input('orientation', 'portrait');

        // 4. Datos de institución y logo
        $logo = Logo::first();
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // 5. Obtener grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 6. Obtener estudiantes ACTIVOS del período actual usando estudiante_periodos
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->leftJoin('responsables as representante', 'estudiantes.representante_id', '=', 'representante.id')
                ->leftJoin('responsables as padre', 'estudiantes.padre_id', '=', 'padre.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.id',
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'estudiantes.sexo',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiantes.lugar_de_nacimiento',
                    'estudiantes.entidad_federal',
                    'estudiantes.etnia',
                    'estudiantes.enfermedades',
                    'estudiantes.tratamiento_medico',
                    'estudiantes.alergico',
                    'estudiantes.condicion_especial',
                    'estudiantes.problemas_fisicos',
                    'estudiante_periodos.direccion',
                    'estudiante_periodos.instituto_de_procedencia',
                    'estudiante_periodos.lateralidad',
                    'estudiante_periodos.talla_de_camisa',
                    'estudiante_periodos.talla_de_pantalon',
                    'estudiante_periodos.talla_de_zapato',
                    'estudiante_periodos.status',
                    'estudiante_periodos.status_escolar',
                    'estudiante_periodos.condicion',
                    'estudiante_periodos.apreciacion',
                    'estudiante_periodos.contador_impresiones',
                    'representante.name_r as representante_name',
                    'representante.cedula_r as representante_cedula',
                    'representante.telefono_r as representante_telefono',
                    'representante.direccion_r as representante_direccion',
                    'representante.ocupacion_r as representante_ocupacion',
                    'representante.sexo_r as representante_sexo',
                    'representante.documento_r as representante_documento',
                    'padre.name_r as padre_name',
                    'padre.cedula_r as padre_cedula',
                    'padre.telefono_r as padre_telefono',
                    'padre.direccion_r as padre_direccion',
                    'padre.ocupacion_r as padre_ocupacion',
                    'padre.sexo_r as padre_sexo',
                    'padre.documento_r as padre_documento'
                )
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes = $estudiantes;
        }

        // 7. Mapear columnas
        $columnas = [];
        foreach ($columnasSeleccionadas as $campo) {
            $columnas[] = [
                'campo'  => $campo,
                'titulo' => $titulosPersonalizados[$campo] ?? 'S/N'
            ];
        }

        // 8. Generar PDF
        $pdf = Pdf::loadView('reportes.control_imprimir', compact(
            'grados',
            'columnas',
            'filasVacias',
            'tituloReporte',
            'logoDocumento',
            'logoInstitucion',
            'institucion'
        ));

        return $pdf->setPaper($paper, $orientation)->stream("reporte_control.pdf");
    }

    // --listo
    public function ControlDeZonificacion(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        $periodo_escolar_actual = $periodoActivo->nombre_periodo;

        // Período inactivo (pasado)
        $periodoInactivo = PeriodoHelper::getInactivo();
        $periodo_escolar_pasado = $periodoInactivo ? $periodoInactivo->nombre_periodo : 'No definido';

        // Estado del proceso de inscripción
        $proceso_de_inscripcion = $periodoActivo->status_periodo ?? 'Cerrado';

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.name',
                    'estudiantes.apellido'
                )
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;
            $grado->mgeneral = $estudiantes->count();
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.control-de-zonificacion', compact(
            'grados',
            'periodo_escolar_pasado',
            'periodo_escolar_actual',
            'proceso_de_inscripcion'
        ));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Control_de_Zonificacion.pdf');
    }

    // --listo
    public function RendimientoEstudiantil(array $gradoIds)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Grados seleccionados
        $grados = Grado::whereIn('id', $gradoIds)->orderBy('id', 'asc')->get();

        foreach ($grados as $grado) {
            // 3. Obtener estudiantes ACTIVOS del período actual
            $estudiantes = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.grado_id', $grado->id)
                ->where('estudiante_periodos.status', 'Activo')
                ->select(
                    'estudiantes.id',
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.sexo',
                    'estudiantes.cedula',
                    'estudiantes.fecha_de_nacimiento',
                    'estudiante_periodos.status',
                    'estudiante_periodos.status_escolar',
                    'estudiante_periodos.condicion',
                    'estudiante_periodos.apreciacion',
                    DB::raw("TIMESTAMPDIFF(YEAR, estudiantes.fecha_de_nacimiento, CURDATE()) as age")
                )
                ->orderBy('estudiantes.sexo', 'asc')
                ->orderBy('estudiantes.name', 'asc')
                ->get();

            $grado->estudiantes_listado = $estudiantes;
            $grado->mgeneral = $estudiantes->count();
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.rendimiento-estudiantil', compact('grados'));
        $pdf->setPaper("Letter", "landscape");
        return $pdf->stream('Rendimiento_Estudiantil.pdf');
    }

    // --listo
    public function ConstanciaDeRetiro(Request $request)
    {
        $estudianteId = $request->estudiante_id;
        $periodoId = $request->periodo_id;
        $gradoId = $request->grado_id;

        Carbon::setLocale('es');

        $logo = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Buscar el registro en estudiante_periodos con status 'Retirado'
        $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->where('status', 'Retirado')
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'Registro de retiro no encontrado.');
        }

        // Obtener datos del estudiante
        $estudiante = Estudiante::find($estudianteId);
        $grado = Grado::find($gradoId);
        $periodo = PeriodoEscolar::find($periodoId); // 🔥 Obtener el período

        // Combinar datos para la vista
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado' => $grado->nombre_del_grado,
                'seccion' => $grado->seccion,
                'docente' => $grado->docente ?? '',
                'status_escolar' => $registro->status_escolar,
                'apreciacion' => $registro->apreciacion,
                'periodo_escolar' => $periodo ? $periodo->periodo_actual : '', // 🔥 Agregar período
            ]
        );

        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');
        $title = 'Constancia de retiro';

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-retiro', compact(
            'title',
            'logoDocumento',
            'estudianteData',
            'institucion',
            'dia',
            'mes',
            'aho'
        ));

        $pdf->setPaper("Letter", "portrait");
        $nombreArchivo = 'C-D-R_' . ($estudiante->name . '_' . $estudiante->apellido) . '.pdf';
        return $pdf->stream($nombreArchivo);
    }
}
