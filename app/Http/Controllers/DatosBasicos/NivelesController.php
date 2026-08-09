<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NivelesController extends Controller
{
    public function index()
    {
        return Inertia::render('DatosBasicos/Niveles/Index', [
            'niveles' => Nivel::orderBy('id', 'asc')->get()
        ]);
    }

    public function toggle(Request $request)
    {
        $nivel = Nivel::findOrFail($request->id);
        $nivel->update(['activo' => !$nivel->activo]);

        return back()->with('success', 'Configuración de nivel actualizada');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'nivel' => 'required|string',
        ]);

        Nivel::create([
            'nombre' => $request->nombre,
            'nivel' => $request->nivel,
            'activo' => true // Se crea activo por defecto
        ]);

        return back()->with('success', 'Grado creado correctamente');
    }
}
