<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\Logo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LogosController extends Controller
{
    public function index()
    {
        $logos = Logo::first() ?? new Logo();
        return Inertia::render('DatosBasicos/Logos/Index', [
            'logos' => $logos // Ahora lleva los 'appends' automáticos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'campo' => 'required|string',
            'imagen' => 'required|image|max:4096', // Máximo 4MB
        ]);

        $campo = $request->campo;
        // Buscamos el registro único o creamos uno nuevo
        $logos = Logo::firstOrNew(['id' => 1]);

        if ($request->hasFile('imagen')) {
            // Borrar imagen anterior si existe para no llenar el disco de Laragon
            if ($logos->getRawOriginal($campo)) {
                Storage::disk('public')->delete($logos->getRawOriginal($campo));
            }

            // Guardar la nueva y asignar la ruta
            $path = $request->file('imagen')->store('logos', 'public');
            $logos->$campo = $path;
            $logos->save();
        }
        $message = $logos->wasRecentlyCreated
            ? 'Logo creado con éxito'
            : 'Logo actualizado con éxito';

            
        return back()->with('success', $message);
    }
}
