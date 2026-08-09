<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\Plantel; // Asegúrate de tener el modelo creado
use App\Models\Zonificacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlantelesController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $planteles = Plantel::query()
            ->when($request->search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%")
                    ->orWhere('director', 'like', "%{$search}%");
            })
            ->orderBy('nombre', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Estudiantes/ZonificacionEstudiantes/Planteles', [
            'planteles' => $planteles,
            'filters' => $filters
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'     => 'required|string|max:255|unique:plantels,nombre',
            'director'  => 'nullable|string|max:500',
        ]);

        // Forzar mayúsculas antes de guardar
        $plantel = new Plantel();
        $plantel->nombre = strtoupper($data['nombre']);
        $plantel->director = $data['director'] ?? '';
        $plantel->save();

        return back()->with('success', 'Plantel creado con exito');
    }

    public function update(Request $request, Plantel $plantele)
    {
        // 1. Validación (Usamos $plantel->id para ignorar el registro actual en el unique)
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255|unique:plantels,nombre,' . $plantele->id,
            'director'   => 'nullable|string|max:255',
        ]);

        // 2. Actualización con transformación a Mayúsculas
        $plantele->update([
            'nombre'     => mb_strtoupper($validated['nombre'], 'UTF-8'),
            'director'   =>$validated['director'] ?? '', 'UTF-8',
        ]);

        // 3. Retornamos con mensaje para el Toast de React
        return back()->with('info', 'Los datos del plantel han sido actualizados.');
    }

    public function destroy(Plantel $plantele)
    {
        // 1. Verificamos si hay registros en la tabla de zonificación con este plantel
        $estaEnUso = Zonificacion::where('plantel_id', $plantele->id)->exists();

        if ($estaEnUso) {
            // Retornamos un mensaje de error que será capturado por el Toast de React
            return back()->with('error', 'No se puede eliminar: Este plantel ya tiene estudiantes asignados en el proceso de zonificación.');
        }

        // 2. Si no está en uso, procedemos a eliminar
        $nombre = $plantele->nombre;
        $plantele->delete();

        redirect()->back()
            ->with('error', "El plantel $nombre ha sido eliminado correctamente.");
    }

   
}
