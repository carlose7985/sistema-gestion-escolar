<?php

namespace App\Http\Controllers\Estudiantes\Responsables;


use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResponsableRequest;
use App\Http\Requests\UpdateResponsableRequest;
use App\Models\Responsable;
use Illuminate\Http\Request;

class RegistroResponsablesController extends Controller
{


    public function index(Request $request)
    {
        $search = $request->search;

        $datos = Responsable::with([
            // Cargamos los representados directos
            'representadosDirectos' => function ($query) {
                // Quitamos 'grado_id' porque ya no está en esta tabla
                $query->select('id', 'name', 'apellido', 'padre_id')
                    ->with(['estudiantePeriodos' => function ($q) {
                        // Traemos la inscripción del periodo más reciente
                        $q->latest()
                            ->with('grado:id,nombre_del_grado,seccion');
                    }]);
            },
            // Cargamos los representados asociados
            'representadosAsociados' => function ($query) {
                $query->select('id', 'name', 'apellido', 'representante_id')
                    ->with(['estudiantePeriodos' => function ($q) {
                        $q->latest()
                            ->with('grado:id,nombre_del_grado,seccion');
                    }]);
            }
        ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name_r', 'like', "%{$search}%")
                        ->orWhere('cedula_r', 'like', "%{$search}%");
                });
            })
            ->orderBy('id', 'asc')
            ->paginate(6)
            ->withQueryString();

        return inertia('Estudiantes/Responsables/Index', [
            'datos' => $datos,
            'filters' => [
                'search' => $search
            ]
        ]);
    }
    public function store(StoreResponsableRequest $request)
    {
        $validated = $request->validated();
        $validated['status_r'] = 'Activo';
        $responsable = Responsable::create($validated);
        
        return to_route('estudiantes.registro.responsables.index')->with('success', 'Datos registrados correctamente.');
    }

    public function update(UpdateResponsableRequest $request,int $id)
    {
        $responsable = Responsable::findOrFail($id);

        $validated = $request->validated();

        $responsable->update($validated);

        return to_route('estudiantes.registro.responsables.index')->with('success', 'Datos actualizados correctamente.');
    }

    public function destroy(int $id)
    {
        $responsable = Responsable::findOrFail($id);

        // Validar si el estatus es Activo
        if ($responsable->status_r === 'Activo') {
            return back()->with('error', 'No se puede eliminar el responsable porque su estatus está Activo.');
            // O si prefieres redirigir a la ruta específica:
            // return to_route('estudiantes.registro.responsables.index')->with('error', 'No se puede eliminar un responsable activo.');
        }

        $responsable->delete();

        return to_route('estudiantes.registro.responsables.index')->with('success', 'Datos eliminados correctamente.');
    }
    // En el controlador RegistroResponsablesController, agregar este método

    public function updateStatus(Request $request, int $id)
    {
        $responsable = Responsable::findOrFail($id);

        $request->validate([
            'status_r' => 'required|in:Activo,Inactivo'
        ]);

        $responsable->update([
            'status_r' => $request->status_r
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente'
        ]);
    }
  
}


