<?php

namespace App\Http\Controllers\Estudiantes\Unisex;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResponsableRequest;
use App\Models\Estudiante;
use App\Models\Grado;
use App\Models\Institucion;
use App\Models\Responsable;
use App\Models\UnisexRegistro;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UnisexController extends Controller
{


    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Consulta usando estudiante_periodos
        $estudiantes = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->leftJoin('responsables as representante', 'estudiantes.representante_id', '=', 'representante.id')
            ->leftJoin('responsables as padre', 'estudiantes.padre_id', '=', 'padre.id')
            ->where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Activo')
            // Excluir estudiantes ya registrados en unisex
            ->whereNotIn('estudiantes.id', function ($query) {
                $query->select('estudiante_id')
                    ->from('unisex_registros');
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('estudiantes.name', 'like', "%{$search}%")
                        ->orWhere('estudiantes.apellido', 'like', "%{$search}%")
                        ->orWhere('estudiantes.cedula', 'like', "%{$search}%")
                        ->orWhere('representante.name_r', 'like', "%{$search}%")
                        ->orWhere('representante.cedula_r', 'like', "%{$search}%")
                        ->orWhere('padre.name_r', 'like', "%{$search}%")
                        ->orWhere('padre.cedula_r', 'like', "%{$search}%");
                });
            })
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.fecha_de_nacimiento',
                'estudiantes.sexo',
                'estudiantes.representante_id',
                'estudiantes.padre_id',
                'grados.nombre_del_grado',
                'grados.seccion',
                'representante.id as representante_id',
                'representante.name_r as representante_name',
                'representante.cedula_r as representante_cedula',
                'representante.telefono_r as representante_telefono',
                'representante.direccion_r as representante_direccion',
                'padre.id as padre_id',
                'padre.name_r as padre_name',
                'padre.cedula_r as padre_cedula',
                'padre.telefono_r as padre_telefono',
                'padre.direccion_r as padre_direccion'
            )
            ->orderBy('estudiantes.apellido', 'asc')
            ->paginate(100)
            ->withQueryString();

        $grados = Grado::all(['id', 'nombre_del_grado', 'seccion']);

        return Inertia::render('Estudiantes/Unisex/Index', [
            'estudiantes' => $estudiantes,
            'grados' => $grados,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'registros' => 'required|array',
            'registros.*.estudiante_id' => 'required|exists:estudiantes,id',
        ]);

        $periodoActivo = PeriodoHelper::getActivo();
        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        foreach ($request->registros as $registro) {
            $estudianteId = (int) $registro['estudiante_id'];

            if ($estudianteId <= 0) {
                continue;
            }

            // Verificar si ya existe
            $existe = DB::table('unisex_registros')
                ->where('estudiante_id', $estudianteId)
                ->exists();

            if (!$existe) {
                // Obtener grado
                $gradoId = null;
                if ($periodoId) {
                    $estudiantePeriodo = DB::table('estudiante_periodos')
                        ->where('estudiante_id', $estudianteId)
                        ->where('periodo_id', $periodoId)
                        ->where('status', 'Activo')
                        ->first();

                    if ($estudiantePeriodo) {
                        $gradoId = $estudiantePeriodo->grado_id;
                    }
                }

                // 🔥 CONSTRUIR EL ARRAY COMPLETO
                $data = [
                    'estudiante_id' => $estudianteId,  // 🔥 TIENE QUE ESTAR
                    'grado_id' => $gradoId,
                    'status' => 1,
                    'fecha_registro' => now()->format('Y-m-d'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // 🔥 DEBUG FINAL
               // Log::info('Insertando:', $data);

                DB::table('unisex_registros')->insert($data);
            }
        }

        return redirect()->back()->with('success', 'Registros procesados correctamente.');
    }


    public function listado(Request $request)
    {
        $search = $request->input('search');

        $registros = UnisexRegistro::with([
            'estudiante',
            'estudiante.representante',
            'estudiante.padre',
            'grado'
        ])
            ->when($search, function ($query, $search) {
                $query->whereHas('estudiante', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('apellido', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%")
                        ->orWhereHas('representante', function ($qr) use ($search) {
                            $qr->where('name_r', 'like', "%{$search}%")
                                ->orWhere('cedula_r', 'like', "%{$search}%");
                        })
                        ->orWhereHas('padre', function ($qp) use ($search) {
                            $qp->where('name_r', 'like', "%{$search}%")
                                ->orWhere('cedula_r', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(4)
            ->withQueryString();

        return Inertia::render('Estudiantes/Unisex/Listado', [
            'registros' => $registros,
            'filters' => $request->only(['search'])
        ]);
    }


    public function updateVinculo(Request $request, int $id)
    {
        $request->validate([
            'responsable_id' => 'required|exists:responsables,id',
            'tipo' => 'required|in:representante,padre',
        ]);

        // Buscar el estudiante en la tabla estudiantes (no en estudiante_activos)
        $estudiante = Estudiante::findOrFail($id);
        $tipo = $request->tipo;
        $nuevoId = $request->responsable_id;
        $columna = ($tipo === 'representante') ? 'representante_id' : 'padre_id';
        $idViejo = $estudiante->$columna;

        // Actualizar el estudiante
        $estudiante->update([
            $columna => $nuevoId,
            'parentesco' => ($tipo === 'representante') ? $request->parentesco : $estudiante->parentesco
        ]);

        // Activar el nuevo responsable
        if ($nuevoId) {
            Responsable::where('id', $nuevoId)->update(['status_r' => 'Activo']);
        }

        // Inactivar el viejo si ya no tiene estudiantes asociados
        if ($idViejo && $idViejo != $nuevoId) {
            $conteoUsos = Estudiante::where('representante_id', $idViejo)
                ->orWhere('padre_id', $idViejo)
                ->count();

            if ($conteoUsos == 0) {
                Responsable::where('id', $idViejo)->update(['status_r' => 'Inactivo']);
            }
        }

        return back()->with('success', 'Vínculo actualizado correctamente.');
    }

    public function imprimir()
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();

        // Obtener todos los registros con relaciones
        $data = UnisexRegistro::with([
            'estudiante.representante',
            'estudiante.padre',
            'grado'
        ])
            ->where('status', true)
            ->get();

        // Filtrar y agrupar por serie basada en el responsable (representante)
        $registrosAgrupados = $data
            ->filter(function ($item) {
                return $item->estudiante && $item->estudiante->representante;
            })
            ->map(function ($item) {
                $representante = $item->estudiante->representante;
                $cedulaLimpia = preg_replace('/\D/', '', $representante->cedula_r ?? '');
                $item->serie = substr($cedulaLimpia, -1) ?: '0';
                $item->responsable_nombre = $representante->name_r;
                $item->responsable_cedula = $representante->cedula_r;
                $item->alterno_nombre = $item->estudiante->padre?->name_r ?? null;
                $item->alterno_cedula = $item->estudiante->padre?->cedula_r ?? null;
                return $item;
            })
            ->sortBy('serie')
            ->groupBy('serie');

        $seriesAgrupadasEnPares = [];
        $series = array_keys($registrosAgrupados->toArray());
        sort($series);

        for ($i = 0; $i < count($series); $i += 2) {
            $par = [];
            if (isset($series[$i])) {
                $serie1 = $series[$i];
                $par[$serie1] = $registrosAgrupados[$serie1];
            }
            if (isset($series[$i + 1])) {
                $serie2 = $series[$i + 1];
                $par[$serie2] = $registrosAgrupados[$serie2];
            }
            $seriesAgrupadasEnPares[] = $par;
        }

        $pdf = Pdf::loadView('pdfs.estudiantesPDF.unisex_lista', compact(
            'seriesAgrupadasEnPares',
            'institucion'
        ));

        $pdf->setPaper('letter', 'portrait');
        return $pdf->stream('Listado_Por_Series.pdf');
    }
    public function buscarResponsable(Request $request)
    {
        $cedula = $request->input('cedula');
        $trimmedCedula = trim($cedula);

        $responsable = Responsable::where('cedula_r', $trimmedCedula)->first();

        return response()->json(['responsable' => $responsable]);
    }

    public function storeResponsable(StoreResponsableRequest $request)
    {
        $validated = $request->validated();
        $responsable = Responsable::create($validated);

        return redirect()->back()->with([
            'success' => 'Responsable registrado exitosamente.',
            'responsable' => $responsable
        ]);
    }

    public function destroy(int $id)
    {
        $registro = UnisexRegistro::findOrFail($id);
        $registro->delete();

        return redirect()->back()->with('error', 'Registro eliminado permanentemente.');
    }

    public function eliminar()
    {
        try {
            $count = UnisexRegistro::count();

            if ($count === 0) {
                return redirect()->back()->with('info', 'No hay registros para eliminar.');
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            UnisexRegistro::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            return redirect()->back()->with('success', 'Todos los registros eliminados exitosamente.');
        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return redirect()->back()->with('error', 'Error al eliminar los registros: ' . $e->getMessage());
        }
    }
}