<?php

namespace App\Http\Controllers\Estudiantes\Retirados;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Apreciacion;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\Movimiento;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstudiantesRetiradosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 🔥 Buscar en estudiante_periodos con status 'Retirado' de TODOS los períodos
        $query = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
            ->where('estudiante_periodos.status', 'Retirado')
            ->where('estudiante_periodos.status_escolar', '!=', 'Reingresado')
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

        // Ordenar por fecha_registro
        $datos = $query->orderBy('estudiante_periodos.fecha_registro', 'desc')
            ->paginate(5)
            ->withQueryString();

        // Transformar los datos
        $datos->getCollection()->transform(function ($item) {
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

        // Totales
        $totalQuery = clone $query;
        $totales = [
            'general' => (clone $totalQuery)->count(),
            'masculino' => (clone $totalQuery)->where('estudiantes.sexo', 'M')->count(),
            'femenino' => (clone $totalQuery)->where('estudiantes.sexo', 'F')->count(),
        ];

        // Grados para el modal de reingreso
        $grados = Grado::all()->map(function ($grado) {
            return [
                'id' => $grado->id,
                'name' => $grado->nombre_del_grado . ' - ' . $grado->seccion,
            ];
        });

        // Apreciaciones para el modal de edición
        $apreciaciones = Apreciacion::all()->map(function ($item) {
            return [
                'id' => $item->id,
                'literal' => $item->literal,
                'numeral' => $item->numeral,
                'nombre_completo' => $item->numeral ? $item->literal . '-' . $item->numeral : $item->literal,
            ];
        });

        return Inertia::render('Estudiantes/EstudiantesRetirados/Index', [
            'datos' => $datos,
            'totals' => $totales,
            'filters' => ['search' => $search],
            'grados' => $grados,
            'apreciaciones' => $apreciaciones,
        ]);
    }

    public function update(Request $request, string $periodoEstudianteId)
    {
        // Parsear clave compuesta
        $ids = explode('-', $periodoEstudianteId);

        if (count($ids) !== 3) {
            return redirect()->back()->with('error', 'ID de estudiante período inválido.');
        }

        $estudianteId = (int)$ids[0];
        $periodoId = (int)$ids[1];
        $gradoId = (int)$ids[2];

        // Validar datos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cedula' => 'required|min:8|max:11|unique:estudiantes,cedula,' . $estudianteId,
            'fecha_de_nacimiento' => 'required|date',
            'sexo' => 'required|in:M,F',
            'apreciacion' => 'required|string',
        ]);

        // Actualizar tabla estudiantes
        $estudiante = Estudiante::findOrFail($estudianteId);
        $estudiante->update([
            'name' => $validated['name'],
            'apellido' => $validated['apellido'],
            'cedula' => $validated['cedula'],
            'fecha_de_nacimiento' => $validated['fecha_de_nacimiento'],
            'sexo' => $validated['sexo'],
        ]);

        // Actualizar tabla estudiante_periodos (apreciacion)
        EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->update([
                'apreciacion' => $validated['apreciacion'],
            ]);

        return redirect()->back()->with('success', 'Datos actualizados correctamente.');
    }


    public function reingresar(Request $request, string $periodoEstudianteId)
    {
        // Parsear clave compuesta
        $ids = explode('-', $periodoEstudianteId);

        if (count($ids) !== 3) {
            return redirect()->back()->with('error', 'ID de estudiante período inválido.');
        }

        $estudianteId = (int)$ids[0];
        $periodoIdViejo = (int)$ids[1];
        $gradoIdViejo = (int)$ids[2];

        // Validar datos
        $validated = $request->validate([
            'grado_id' => 'required|exists:grados,id',
            'condicion' => 'required|string',
            'status_escolar' => 'required|string',
        ]);

        // Obtener período activo usando HELPER
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para reingresar.');
        }

        $estudiante = Estudiante::with(['padre', 'representante'])->findOrFail($estudianteId);

        // 🔥 Obtener el registro viejo para copiar los datos
        $registroViejo = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoIdViejo)
            ->where('grado_id', $gradoIdViejo)
            ->first();

        if (!$registroViejo) {
            return redirect()->back()->with('error', 'Registro anterior no encontrado.');
        }

        DB::transaction(function () use ($estudiante, $periodoActivo, $validated, $estudianteId, $periodoIdViejo, $gradoIdViejo, $registroViejo) {
            // 1. Marcar el registro viejo como "Reingresado"
            EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoIdViejo)
                ->where('grado_id', $gradoIdViejo)
                ->update([
                    'status_escolar' => 'Reingresado'
                ]);

            // 2. Crear nuevo registro en período activo COPIANDO DATOS DEL REGISTRO VIEJO
            $existeRegistro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('periodo_id', $periodoActivo->id)
                ->where('grado_id', $validated['grado_id'])
                ->exists();

            if (!$existeRegistro) {
                EstudiantePeriodo::create([
                    'estudiante_id' => $estudianteId,
                    'periodo_id' => $periodoActivo->id,
                    'grado_id' => $validated['grado_id'],
                    'status' => 'Activo',
                    'status_escolar' => 'Escolarizado',
                    'condicion' => $validated['condicion'],
                    'apreciacion' => 'S-D',
                    'fecha_registro' => now()->format('Y-m-d'),
                    'actualizado' => 'No',
                    'matricula_sisge' =>  'No',
                    'status_sisge' => 'Reingreso',
                    'calificado' => 'No',
                    // 🔥 COPIAR DATOS DEL REGISTRO VIEJO
                    'direccion' => $registroViejo->direccion ?? null,
                    'instituto_de_procedencia' => $registroViejo->instituto_de_procedencia ?? null,
                    'lateralidad' => $registroViejo->lateralidad ?? null,
                    'talla_de_camisa' => $registroViejo->talla_de_camisa ?? null,
                    'talla_de_pantalon' => $registroViejo->talla_de_pantalon ?? null,
                    'talla_de_zapato' => $registroViejo->talla_de_zapato ?? null,
                ]);
            }

            if ($periodoActivo->status_periodo === 'Cerrado') {
                Movimiento::create([
                    'estudiante_id' => $estudianteId,
                    'periodo_id' => $periodoActivo->id,
                    'tipo_de_movimiento' => 'Ingreso',
                    'grado_id_past' => $gradoIdViejo,
                    'grado_id_new' => $validated['grado_id'],
                    'status' => 'Reingreso',
                    'matricula_sisge' => 'No',
                    'fecha_registro' => now()->format('Y-m-d'),
                ]);
            }
            // 4. ACTIVAR RESPONSABLES (padre y representante)
            $responsablesIds = array_filter(array_unique([
                $estudiante->representante_id,
                $estudiante->padre_id
            ]));

            foreach ($responsablesIds as $respId) {
                if ($respId) {
                    DB::table('responsables')
                        ->where('id', $respId)
                        ->update([
                            'status_r' => 'Activo'
                        ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Estudiante reingresado correctamente.');
    }
}
