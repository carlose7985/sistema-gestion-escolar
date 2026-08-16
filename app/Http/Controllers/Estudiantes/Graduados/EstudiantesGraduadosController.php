<?php

namespace App\Http\Controllers\Estudiantes\Graduados;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGraduadosRequest;
use App\Http\Requests\UpdateGraduadosRequest;
use App\Models\Apreciacion;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use App\Models\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstudiantesGraduadosController extends Controller
{

    // public function index(Request $request)
    // {
    //     $search = $request->search;

    //     // Buscar en estudiante_periodos con status 'Graduado'
    //     $query = DB::table('estudiante_periodos')
    //         ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
    //         ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
    //         ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
    //         ->where('estudiante_periodos.status', 'Graduado')
    //         ->select(
    //             'estudiantes.id as estudiante_id',
    //             'estudiantes.name',
    //             'estudiantes.apellido',
    //             'estudiantes.cedula',
    //             'estudiantes.documento',
    //             'estudiantes.sexo',
    //             'estudiantes.fecha_de_nacimiento',
    //             'grados.nombre_del_grado',
    //             'grados.seccion',
    //             'periodo_escolars.nombre_periodo as periodo_escolar',
    //             'periodo_escolars.id as periodo_id',
    //             'estudiante_periodos.status',
    //             'estudiante_periodos.status_escolar',
    //             'estudiante_periodos.apreciacion',
    //             'estudiante_periodos.fecha_registro',
    //             'estudiante_periodos.contador_impresiones',
    //             'estudiante_periodos.estudiante_id',
    //             'estudiante_periodos.periodo_id',
    //             'estudiante_periodos.grado_id',
    //             DB::raw("CONCAT(estudiantes.id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as periodo_estudiante_id")
    //         );

    //     // Aplicar búsqueda
    //     if ($search) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('estudiantes.name', 'LIKE', "%{$search}%")
    //                 ->orWhere('estudiantes.apellido', 'LIKE', "%{$search}%")
    //                 ->orWhere('estudiantes.cedula', 'LIKE', "%{$search}%");
    //         });
    //     }

    //     // Ordenar por fecha_registro o periodo_id
    //     $estudiantes = $query->orderBy('estudiante_periodos.fecha_registro', 'desc')
    //         ->orderBy('periodo_escolars.id', 'desc')
    //         ->paginate(5)
    //         ->withQueryString();

    //     // Transformar los datos
    //     $estudiantes->getCollection()->transform(function ($item) {
    //         $age = $item->fecha_de_nacimiento ? \Carbon\Carbon::parse($item->fecha_de_nacimiento)->age : null;

    //         return (object) [
    //             'id' => $item->estudiante_id,
    //             'estudiante_id' => $item->estudiante_id,
    //             'periodo_id' => $item->periodo_id,
    //             'grado_id' => $item->grado_id,
    //             'periodo_estudiante_id' => $item->periodo_estudiante_id,
    //             'name' => $item->name,
    //             'apellido' => $item->apellido,
    //             'cedula' => $item->cedula,
    //             'documento' => $item->documento,
    //             'sexo' => $item->sexo,
    //             'fecha_de_nacimiento' => $item->fecha_de_nacimiento,
    //             'age' => $age,
    //             'nombre_del_grado' => $item->nombre_del_grado,
    //             'seccion' => $item->seccion,
    //             'periodo_escolar' => $item->periodo_escolar,
    //             'status' => $item->status,
    //             'status_escolar' => $item->status_escolar,
    //             'apreciacion' => $item->apreciacion,
    //             'fecha_registro' => $item->fecha_registro,
    //             'contador_impresiones' => $item->contador_impresiones ?? 0,
    //         ];
    //     });

    //     // 🔥 NUEVO: Totales generales
    //     $totalQuery = clone $query;
    //     $totales = [
    //         'general' => (clone $totalQuery)->count(),
    //         'masculino' => (clone $totalQuery)->where('estudiantes.sexo', 'M')->count(),
    //         'femenino' => (clone $totalQuery)->where('estudiantes.sexo', 'F')->count(),
    //     ];


    //     // 🔥 NUEVO: Conteo por periodo escolar
    //     $conteoPorPeriodo = DB::table('estudiante_periodos')
    //         ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
    //         ->where('estudiante_periodos.status', 'Graduado')
    //         ->select(
    //             'periodo_escolars.id as periodo_id',
    //             'periodo_escolars.nombre_periodo',
    //             DB::raw('COUNT(*) as total_graduados')
    //         )
    //         ->groupBy('periodo_escolars.id', 'periodo_escolars.nombre_periodo')
    //         ->orderBy('periodo_escolars.id', 'desc')
    //         ->get();

    //     // 🔥 NUEVO: Conteo por periodo y sexo
    //     $conteoPorPeriodoSexo = DB::table('estudiante_periodos')
    //         ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
    //         ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
    //         ->where('estudiante_periodos.status', 'Graduado')
    //         ->select(
    //             'periodo_escolars.id as periodo_id',
    //             'periodo_escolars.nombre_periodo',
    //             'estudiantes.sexo',
    //             DB::raw('COUNT(*) as total')
    //         )
    //         ->groupBy('periodo_escolars.id', 'periodo_escolars.nombre_periodo', 'estudiantes.sexo')
    //         ->orderBy('periodo_escolars.id', 'desc')
    //         ->get()
    //         ->groupBy('periodo_id');

    //     // 🔥 NUEVO: Formatear datos por periodo
    //     $periodos = $conteoPorPeriodo->map(function ($periodo) use ($conteoPorPeriodoSexo) {
    //         $sexos = $conteoPorPeriodoSexo->get($periodo->periodo_id, collect());

    //         return [
    //             'periodo_id' => $periodo->periodo_id,
    //             'nombre_periodo' => $periodo->nombre_periodo,
    //             'total_graduados' => $periodo->total_graduados,
    //             'masculino' => $sexos->where('sexo', 'M')->first()->total ?? 0,
    //             'femenino' => $sexos->where('sexo', 'F')->first()->total ?? 0,
    //         ];
    //     });

    //     $apreciacionesAprobadas = Apreciacion::aprobados()->get();

    //     return Inertia::render('Estudiantes/EstudiantesGraduados/Index', [
    //         'datos' => $estudiantes,
    //         'apreciacionesAprobadas' => $apreciacionesAprobadas,
    //         'totals' => $totales,
    //         'conteoPorPeriodo' => $periodos,  // 🔥 NUEVO: Enviar a la vista
    //         'filters' => ['search' => $search],
    //     ]);
    // }


    public function index(Request $request)
    {
        $search = $request->search;

        // Buscar en estudiante_periodos con status 'Graduado'
        $query = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->where('estudiante_periodos.status', 'Graduado')
            ->select(
                'estudiantes.id as estudiante_id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.documento',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                'grados.nombre_del_grado',
                'grados.seccion',
                'periodo_escolars.nombre_periodo as periodo_escolar',
                'periodo_escolars.id as periodo_id',
                'estudiante_periodos.status',
                'estudiante_periodos.status_escolar',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.fecha_registro',
                'estudiante_periodos.contador_impresiones',
                'estudiante_periodos.estudiante_id',
                'estudiante_periodos.periodo_id',
                'estudiante_periodos.grado_id',
                DB::raw("CONCAT(estudiantes.id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as periodo_estudiante_id")
            );

        // Aplicar búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estudiantes.name', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.apellido', 'LIKE', "%{$search}%")
                    ->orWhere('estudiantes.cedula', 'LIKE', "%{$search}%");
            });
        }

        // Ordenar por fecha_registro o periodo_id
        $estudiantes = $query->orderBy('estudiante_periodos.fecha_registro', 'desc')
            ->orderBy('periodo_escolars.id', 'desc')
            ->paginate(5)
            ->withQueryString();

        // Transformar los datos
        $estudiantes->getCollection()->transform(function ($item) {
            $age = $item->fecha_de_nacimiento ? \Carbon\Carbon::parse($item->fecha_de_nacimiento)->age : null;

            return (object) [
                'id' => $item->estudiante_id,
                'estudiante_id' => $item->estudiante_id,
                'periodo_id' => $item->periodo_id,
                'grado_id' => $item->grado_id,
                'periodo_estudiante_id' => $item->periodo_estudiante_id,
                'name' => $item->name,
                'apellido' => $item->apellido,
                'cedula' => $item->cedula,
                'documento' => $item->documento,
                'sexo' => $item->sexo,
                'fecha_de_nacimiento' => $item->fecha_de_nacimiento,
                'age' => $age,
                'nombre_del_grado' => $item->nombre_del_grado,
                'seccion' => $item->seccion,
                'periodo_escolar' => $item->periodo_escolar,
                'status' => $item->status,
                'status_escolar' => $item->status_escolar,
                'apreciacion' => $item->apreciacion,
                'fecha_registro' => $item->fecha_registro,
                'contador_impresiones' => $item->contador_impresiones ?? 0,
            ];
        });

        // 🔥 Totales generales
        // 🔥 NUEVO: Totales generales
        $totalQuery = clone $query;
        $totales = [
            'general' => (clone $totalQuery)->count(),
            'masculino' => (clone $totalQuery)->where('estudiantes.sexo', 'M')->count(),
            'femenino' => (clone $totalQuery)->where('estudiantes.sexo', 'F')->count(),
        ];

        // 🔥 NUEVO: Conteo por periodo escolar (con sexos)
        $conteoPorPeriodo = DB::table('estudiante_periodos')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->where('estudiante_periodos.status', 'Graduado')
            ->select(
                'periodo_escolars.id as periodo_id',
                'periodo_escolars.nombre_periodo as periodo_escolar', // <--- AGREGA EL ALIAS AQUÍ
                DB::raw('COUNT(*) as total_graduados'),
                DB::raw("SUM(CASE WHEN estudiantes.sexo = 'M' THEN 1 ELSE 0 END) as masculino"),
                DB::raw("SUM(CASE WHEN estudiantes.sexo = 'F' THEN 1 ELSE 0 END) as femenino")
            )
            ->groupBy('periodo_escolars.id', 'periodo_escolars.nombre_periodo') // Asegúrate que el nombre aquí coincida con la tabla
            ->orderBy('periodo_escolars.id', 'desc')
            ->get();

        // 🔥 NUEVO: Conteo por grado dentro de cada periodo
        $conteoPorGrado = DB::table('estudiante_periodos')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->where('estudiante_periodos.status', 'Graduado')
            ->select(
                'periodo_escolars.id as periodo_id',
                'periodo_escolars.nombre_periodo as periodo_escolar',
                'grados.id as grado_id',
                'grados.nombre_del_grado',
                'grados.seccion',
                DB::raw('COUNT(*) as total_graduados')
            )
            ->groupBy('periodo_escolars.id', 'periodo_escolars.nombre_periodo', 'grados.id', 'grados.nombre_del_grado', 'grados.seccion')
            ->orderBy('periodo_escolars.id', 'desc')
            ->orderBy('grados.nombre_del_grado')
            ->get()
            ->groupBy('periodo_id');

        $apreciacionesAprobadas = Apreciacion::aprobados()->get();

        return Inertia::render('Estudiantes/EstudiantesGraduados/Index', [
            'datos' => $estudiantes,
            'apreciacionesAprobadas' => $apreciacionesAprobadas,
            'totals' => $totales,
            'conteoPorPeriodo' => $conteoPorPeriodo,  // 🔥 Enviar a la vista
            'conteoPorGrado' => $conteoPorGrado,      // 🔥 Enviar a la vista
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Mostrar un estudiante graduado específico
     */
    public function show(string $periodoEstudianteId)
    {
        $ids = explode('-', $periodoEstudianteId);
        $estudianteId = (int)$ids[0];
        $periodoId = (int)$ids[1];
        $gradoId = (int)$ids[2];

        $estudiante = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->where('estudiante_periodos.estudiante_id', $estudianteId)
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.grado_id', $gradoId)
            ->where('estudiante_periodos.status', 'Graduado')
            ->select(
                'estudiantes.*',
                'grados.nombre_del_grado',
                'grados.seccion',
                'periodo_escolars.nombre_periodo',
                'estudiante_periodos.status',
                'estudiante_periodos.status_escolar',
                'estudiante_periodos.apreciacion'
            )
            ->first();

        if (!$estudiante) {
            return redirect()->route('estudiantes.inactivos.graduados.index')
                ->with('error', 'Estudiante no encontrado.');
        }

        return Inertia::render('Estudiantes/EstudiantesGraduados/Show', [
            'estudiante' => $estudiante,
        ]);
    }

    public function update(UpdateGraduadosRequest $request, string $periodoEstudianteId)
    {
        // 🔥 Parsear la clave compuesta
        $ids = explode('-', $periodoEstudianteId);

        if (count($ids) !== 3) {
            return redirect()->back()->with('error', 'ID de estudiante período inválido.');
        }

        $estudianteId = (int)$ids[0];
        $periodoId = (int)$ids[1];
        $gradoId = (int)$ids[2];

        // 🔥 1. Validar los datos
        $validatedData = $request->validated();

        // 🔥 2. Buscar el registro en estudiante_periodos (para verificar que existe)
        $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->where('status', 'Graduado')
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'Registro de graduado no encontrado.');
        }

        // 🔥 3. Actualizar la tabla estudiantes (datos personales)
        $estudiante = Estudiante::findOrFail($estudianteId);
        $estudiante->update([
            'name' => $validatedData['name'],
            'apellido' => $validatedData['apellido'],
            'fecha_de_nacimiento' => $validatedData['fecha_de_nacimiento'],
            'sexo' => $validatedData['sexo'],
            'cedula' => $validatedData['cedula'],
        ]);

        // 🔥 4. Actualizar la tabla estudiante_periodos (solo apreciacion)
        EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->update([
                'apreciacion' => $validatedData['apreciacion'],
            ]);

        return redirect()->back()->with('success', 'Datos del egresado actualizados correctamente.');
    }


    public function create()
    {
        $apreciacionesAprobadas = Apreciacion::aprobados()->get();
        return Inertia::render('Estudiantes/EstudiantesGraduados/Create', [
            'apreciacionesAprobadas' =>  $apreciacionesAprobadas,
        ]);
    }

    public function store(StoreGraduadosRequest $request)
    {
        // 1. Validar datos básicos
        $data = $request->validated();
    
        DB::beginTransaction();

        try {
            // 2. Buscar o crear el período escolar
            $periodo = PeriodoEscolar::where('nombre_periodo', $data['periodo_escolar'])->first();

            if (!$periodo) {
                $periodo = PeriodoEscolar::create([
                    'nombre_periodo' => $data['periodo_escolar'],
                    'status_periodo' => 'Culminado',
                    'status' => 'Finalizado',
                ]);
            }

            // 3. Buscar o crear el responsable genérico (padre_id y representante_id)
            $responsable = Responsable::where('cedula_r', '000000')->first();

            if (!$responsable) {
                $responsable = Responsable::create([
                    'name_r' => 'Global',
                    'fecha_de_nacimiento_r' => '2000-12-12',
                    'sexo_r' => 'M',
                    'telefono_r' => '0000-0000000',
                    'documento_r' => 'V-',
                    'cedula_r' => '000000',
                    'direccion_r' => 'Global',
                    'ocupacion_r' => 'Global',
                    'status_r' => 'Inactivo',
                ]);
            }

            // 4. Buscar un grado de 6to (cualquier sección)
            $grado = Grado::where('nombre_del_grado', 'like', '%6to%')->inRandomOrder()->first();

            if (!$grado) {
                throw new \Exception('No existe un grado de 6to en el sistema.');
            }

            // 5. Crear el estudiante en la tabla estudiantes
            $estudiante = Estudiante::create([
                'name' => $data['name'],
                'apellido' => $data['apellido'],
                'documento' => $data['documento'],
                'cedula' => $data['cedula'],
                'sexo' => $data['sexo'],
                'fecha_de_nacimiento' => $data['fecha_de_nacimiento'],
                'lugar_de_nacimiento' => $data['lugar_de_nacimiento'] ?? null,
                'entidad_federal' => $data['entidad_federal'] ?? null,
                'padre_id' => $responsable->id,
                'representante_id' => $responsable->id,
                'etnia' => 'Ninguna',
                'parentesco' => 'Padre',
                'enfermedades' => 'Ninguna',
                'tratamiento_medico' => 'Ninguno',
                'alergico' => 'No',
                'condicion_especial' => 'Ninguna',
                'problemas_fisicos' => 'Ninguno',
            ]);

            // 6. Crear el registro en estudiante_periodos (clave compuesta)
            EstudiantePeriodo::create([
                'estudiante_id' => $estudiante->id,
                'periodo_id' => $periodo->id,
                'grado_id' => $grado->id,
                'status' => 'Graduado',
                'status_escolar' => 'Graduado',
                'condicion' => 'Regular',
                'apreciacion' => $data['apreciacion'],
                'calificado' => 'Si',
                'actualizado' => 'No',
                'contador_impresiones' => 0,
                'fecha_registro' => now()->format('Y-m-d'),
                'direccion' => $data['direccion'] ?? null,
                'instituto_de_procedencia' => 'Escuela',
                'lateralidad' => 'Derecho',
                'talla_de_camisa' => '12',
                'talla_de_pantalon' => '12',
                'talla_de_zapato' => '34',
                'matricula_sisge' => 'Si',
            ]);

            DB::commit();

            return redirect()->route('estudiantes.inactivos.graduados.index')
                ->with('success', 'Egresado registrado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Error al registrar egresado: ' . $e->getMessage())
                ->withInput();
        }
    }
}
