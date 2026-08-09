<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\AreaTrabajo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaTrabajoController extends Controller
{
    public function index(Request $request)
    {
        
        $search = $request->input('search');

        $areas = AreaTrabajo::query()
            ->when($search, function ($query, $search) {
                $query->where('nombre_del_area', 'like', "%{$search}%");
            })
            ->orderBy('id', 'asc')
            ->paginate(7)
            ->withQueryString();

        return Inertia::render('DatosBasicos/Areas/Index', [
            'areas' => $areas,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_del_area' => 'required|string|unique:area_trabajos,nombre_del_area,' . $request->id,
        ]);

       $areas = AreaTrabajo::updateOrCreate(
            ['id' => $request->id],
            ['nombre_del_area' => mb_strtoupper($request->nombre_del_area, 'UTF-8')]
        );

        $message = $areas->wasRecentlyCreated
            ? 'Área de trabajo creada con éxito'
            : 'Área de trabajo actualizada con éxito';
        return back()->with('success', $message);
    }


    public function toggle(int $id)
    {
        $area = AreaTrabajo::findOrFail($id);
        $nuevoStatus = ($area->status === 'Activo') ? 'Inactivo' : 'Activo';
        $area->update(['status' => $nuevoStatus]);

        return redirect()->back()->with('success', "El área ahora está {$nuevoStatus}");
    }
}
