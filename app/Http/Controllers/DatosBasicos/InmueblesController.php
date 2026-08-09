<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\AreaTrabajo;
use App\Models\Inmueble;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InmueblesController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $inmuebles = Inmueble::query()
            ->when($search, function ($query, $search) {
                $query->where('tipo_de_inmueble', 'like', "%{$search}%")
                    ->orWhere('ubicacion', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(1) // Mostramos 7 por página como acordamos
            ->withQueryString();

        return Inertia::render('DatosBasicos/Inmuebles/Index', [
            'inmuebles' => $inmuebles,
            'areas' => AreaTrabajo::orderBy('nombre_del_area', 'asc')->get(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo_de_inmueble' => 'required|string',
            'ubicacion' => 'required|string',
            'condicion_legal' => 'required|string',
            'largo' => 'required',
            'ancho' => 'required',
            'alto' => 'required',
            'costo_aproximado' => 'required',
            'cantidad' => 'required',
            'color' => 'required|string',
        ]);

        $inmueble = Inmueble::updateOrCreate(['id' => $request->id], $data);

        $message = $inmueble->wasRecentlyCreated
            ? 'Registro creado con éxito'
            : 'Registro actualizado con éxito';

        return back()->with('success', $message);
    }

    public function storeFastArea(Request $request)
    {
        $request->validate([
            'nombre_del_area' => 'required|string|unique:area_trabajos,nombre_del_area',
        ]);

        $area = AreaTrabajo::create([
            'nombre_del_area' => mb_strtoupper($request->nombre_del_area, 'UTF-8'),
            'status' => 'Activo'
        ]);

        // Regresamos con el mensaje de éxito para que Sonner lo capture
        return back()->with('success', "Área {$area->nombre_del_area} creada y seleccionada");
    }

    public function destroy(int $id)
    {
        try {
            $inmueble = Inmueble::findOrFail($id);
            $inmueble->delete();

            // Regresamos a la vista anterior con un mensaje de éxito
            return redirect()->route('settings.institucion.inmuebles.index')->with('warning', 'Inmueble eliminado correctamente');
        } catch (\Exception $e) {
            return redirect()->route('settings.institucion.inmuebles.index')->with('error', 'No se pudo eliminar el registro');
        }
    }
}
