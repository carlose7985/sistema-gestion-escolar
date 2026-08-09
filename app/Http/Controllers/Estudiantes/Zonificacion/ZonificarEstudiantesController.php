<?php

namespace App\Http\Controllers\Estudiantes\Zonificacion;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use App\Models\Plantel;
use App\Models\Zonificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ZonificarEstudiantesController extends Controller
{

    public function index(Request $request)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para gestionar la zonificación.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Obtener filtros
        $search = $request->get('search', '');
        $gradoId = $request->get('grado_id', '');
        $plantelId = $request->get('plantel_id', '');

        // 3. Construir consulta
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
                'estudiantes.fecha_de_nacimiento',
                'grados.nombre_del_grado as grado_nombre',
                'grados.seccion as grado_seccion',
                'plantels.nombre as plantel_nombre',
                'plantels.director'
            )
            ->orderBy('estudiantes.apellido', 'asc');

        // Aplicar filtros
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estudiantes.name', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.apellido', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.cedula', 'LIKE', "%{$search}%");
            });
        }

        if ($gradoId) {
            $query->where('zonificacions.grado_id', $gradoId);
        }

        if ($plantelId) {
            $query->where('zonificacions.plantel_id', $plantelId);
        }

        // 4. Paginación
        $datos = $query->paginate(6)->withQueryString();

        // 5. Obtener TOTAL de estudiantes de 6to grado (Activos en el período)
        $totalEstudiantes6to = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->where('grados.nombre_del_grado', 'like', '6to%')
            ->count();

        // 6. Obtener TOTAL de zonificados
        $totalZonificados = DB::table('zonificacions')
            ->where('periodo_id', $periodoId)
            ->count();

        // 7. Estadísticas
        $stats = [
            'procesados' => $totalZonificados,
            'pendientes' => $totalEstudiantes6to - $totalZonificados,
        ];

        // 8. Resumen por sección (con pendientes)
        $secciones6to = Grado::where('nombre_del_grado', 'like', '6to%')->orderBy('seccion')->get();

        $resumenSecciones = [];

        foreach ($secciones6to as $seccion) {
            // Total de estudiantes en esta sección
            $totalSeccion = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->where('estudiante_periodos.periodo_id', $periodoId)
                ->where('estudiante_periodos.status', 'Activo')
                ->where('estudiante_periodos.grado_id', $seccion->id)
                ->count();

            // Zonificados en esta sección
            $zonificadosSeccion = DB::table('zonificacions')
                ->where('periodo_id', $periodoId)
                ->where('grado_id', $seccion->id)
                ->count();

            $resumenSecciones[] = (object) [
                'id' => $seccion->id,
                'nombre' => '6to Grado ' . $seccion->seccion,
                'procesados' => $zonificadosSeccion,
                'pendientes' => $totalSeccion - $zonificadosSeccion,
            ];
        }

        // 9. Planteles
        $planteles = Plantel::orderBy('nombre', 'asc')->get();

        // 10. Períodos disponibles
        $periodosDisponibles = PeriodoEscolar::orderBy('id', 'desc')
            ->pluck('nombre_periodo')
            ->toArray();

        return Inertia::render('Estudiantes/ZonificacionEstudiantes/Index', [
            'datos' => $datos,
            'resumenSecciones' => $resumenSecciones,
            'planteles' => $planteles,
            'stats' => $stats,
            'periodosDisponibles' => $periodosDisponibles,
            'filters' => [
                'search' => $search,
                'grado_id' => $gradoId,
                'plantel_id' => $plantelId,
            ],
        ]);
    }

    // Actualizar datos personales
    public function update(Request $request, int $id)
    {
        // 1. Buscar la zonificación y obtener el estudiante
        $zonificacion = Zonificacion::findOrFail($id);
        $estudianteId = $zonificacion->estudiante_id;

        // 2. Validar usando el ID del estudiante
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'cedula' => 'required|unique:estudiantes,cedula,' . $estudianteId,
            'sexo' => 'required|in:M,F',
            'fecha_de_nacimiento' => 'required|date',
        ]);

        // 3. Actualizar el estudiante
        $estudiante = Estudiante::findOrFail($estudianteId);
        $estudiante->update($data);

        return back()->with('info', 'Datos personales actualizados correctamente.');
    }


    // Cambiar solo el plantel
    public function cambiarPlantel(Request $request, int $id)
    {
        $request->validate([
            'plantel_id'    => 'nullable|exists:plantels,id',
            'nuevo_plantel' => 'nullable|string|max:255',
            'director'      => 'nullable|string|max:255',
        ]);

        $zonificacion = Zonificacion::findOrFail($id);

        // Obtener el estudiante para mostrar su nombre en el mensaje
        $estudiante = Estudiante::find($zonificacion->estudiante_id);

        $plantelIdDestino = null;

        if ($request->filled('nuevo_plantel')) {
            $nombreMayuscula = mb_strtoupper($request->nuevo_plantel, 'UTF-8');
            $directorMayuscula = $request->filled('director')
                ? mb_strtoupper($request->director, 'UTF-8')
                : null;

            $plantel = Plantel::firstOrCreate(
                ['nombre' => $nombreMayuscula],
                ['director' => $directorMayuscula]
            );

            $plantelIdDestino = $plantel->id;
        } else {
            $plantelIdDestino = $request->plantel_id;
        }

        if (!$plantelIdDestino) {
            return back()->withErrors(['plantel_id' => 'Debe seleccionar un liceo existente o registrar el nombre de uno nuevo.']);
        }

        $zonificacion->update([
            'plantel_id' => $plantelIdDestino
        ]);

        $nombreEstudiante = $estudiante ? $estudiante->name . ' ' . $estudiante->apellido : 'El estudiante';

        return back()->with('info', 'El destino académico de ' . $nombreEstudiante . ' ha sido actualizado correctamente.');
    }

    // Eliminar zonificación
    public function destroy(int $id)
    {
        $registro = Zonificacion::findOrFail($id);

        // Obtener el estudiante para mostrar su nombre
        $estudiante = Estudiante::find($registro->estudiante_id);
        $nombreAlumno = $estudiante ? $estudiante->name . ' ' . $estudiante->apellido : 'El estudiante';

        $registro->delete();

        return redirect()->route('estudiantes.acciones.zonificacion.index')
            ->with('info', "La zonificación de $nombreAlumno ha sido eliminada del listado.");
    }

    // VISTA DE SELECCIÓN: Busca en la tabla maestra
    public function seleccionar(Request $request)
    {
        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para gestionar la zonificación.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Obtener secciones de 6to grado
        $secciones6to = Grado::where('nombre_del_grado', 'like', '6to%')->orderBy('seccion')->get();

        $gradoId = $request->grado_id;

        if (!$gradoId && $secciones6to->isNotEmpty()) {
            $gradoId = $secciones6to->first()->id;
        }

        // 3. Obtener estudiantes de 6to grado NO zonificados
        // Primero, obtener los IDs de estudiantes ya zonificados en el período activo
        $yaZonificadosIds = DB::table('zonificacions')
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->pluck('estudiante_id')
            ->toArray();

        // 4. Consulta de estudiantes
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.grado_id', $gradoId)
            ->where('estudiante_periodos.status', 'Activo')
            ->whereNotIn('estudiantes.id', $yaZonificadosIds)
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo'
            )
            ->when($request->search, function ($q, $s) {
                $q->where(function ($query) use ($s) {
                    $query->where('estudiantes.name', 'like', "%{$s}%")
                        ->orWhere('estudiantes.apellido', 'like', "%{$s}%")
                        ->orWhere('estudiantes.cedula', 'like', "%{$s}%");
                });
            })
            ->orderBy('estudiantes.apellido', 'asc')
            ->get();

        // 5. Obtener planteles
        $planteles = Plantel::orderBy('nombre', 'asc')->get();

        return inertia('Estudiantes/ZonificacionEstudiantes/Seleccionar', [
            'datos' => $estudiantes,
            'secciones' => $secciones6to,
            'planteles' => $planteles,
            'filters' => [
                'grado_id' => (int) $gradoId,
                'search' => $request->search
            ]
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validar
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:estudiantes,id',
            'plantel_id' => 'nullable|exists:plantels,id',
            'nuevo_plantel' => 'nullable|string|max:255',
            'director' => 'nullable|string|max:255',
            'asiste' => 'nullable|string',  // 🔥 Ahora es string
            'grado_id_actual' => 'required|integer|exists:grados,id',
        ]);

        // 2. Decodificar asiste string: "371:Si,378:No,372:Si"
        $asisteData = [];
        if ($request->asiste) {
            $pares = explode(',', $request->asiste);
            foreach ($pares as $par) {
                $partes = explode(':', $par);
                if (count($partes) === 2) {
                    $asisteData[(int)$partes[0]] = $partes[1];
                }
            }
        }

        // 3. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo.');
        }

        $periodoId = $periodoActivo->id;

        // 4. Si es un nuevo plantel, crearlo
        if ($request->nuevo_plantel && !$request->plantel_id) {
            $plantel = Plantel::create([
                'nombre' => $request->nuevo_plantel,
                'director' => $request->director,
            ]);
            $plantelId = $plantel->id;
        } else {
            $plantelId = $request->plantel_id;
        }

        if (!$plantelId) {
            return redirect()->back()->with('error', 'Debe seleccionar o crear un plantel.');
        }

        // 5. Registrar zonificación para cada estudiante
        $fechaRegistro = now()->format('Y-m-d');
        $errors = [];
        $registrados = 0;

        foreach ($request->ids as $estudianteId) {
            try {
                $existe = DB::table('zonificacions')
                    ->where('estudiante_id', $estudianteId)
                    ->where('periodo_id', $periodoId)
                    ->where('grado_id', $request->grado_id_actual)
                    ->exists();

                if (!$existe) {
                    // 🔥 Obtener el asiste del array decodificado
                    $asiste = $asisteData[$estudianteId] ?? 'Si';

                    DB::table('zonificacions')->insert([
                        'estudiante_id' => $estudianteId,
                        'periodo_id' => $periodoId,
                        'grado_id' => $request->grado_id_actual,
                        'plantel_id' => $plantelId,
                        'asiste' => $asiste,
                        'fecha_registro' => $fechaRegistro,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $registrados++;
                }
            } catch (\Exception $e) {
                $errors[] = "Error al zonificar estudiante ID: {$estudianteId} - " . $e->getMessage();
            }
        }

        $mensaje = $registrados . ' estudiantes zonificados exitosamente.';
        if (!empty($errors)) {
            $mensaje .= ' Algunos registros fallaron: ' . implode(', ', $errors);
            return redirect()->back()->with('warning', $mensaje);
        }

        return redirect()->route('estudiantes.acciones.zonificacion.index', [
            'grado_id' => $request->grado_id_actual
        ])->with('success', $mensaje);
    }

   
}
