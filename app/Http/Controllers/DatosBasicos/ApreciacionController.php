<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\Apreciacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApreciacionController extends Controller
{
    public function index()
    {
        $apreciaciones = Apreciacion::orderBy('literal', 'asc')
            ->orderBy('numeral', 'asc')
            ->paginate(6);

        return Inertia::render('DatosBasicos/Apreciaciones/Index', [
            'apreciaciones' => $apreciaciones,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'literal' => 'required|string|max:50',
            'numeral' => 'nullable|string|max:10',
            'status' => 'required|string|in:Sin Definir,Aprobado,Reprobado',
        ]);

        // Verificar duplicado (misma literal y numeral)
        $exists = Apreciacion::where('literal', $request->literal)
            ->where('numeral', $request->numeral)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Ya existe una apreciación con esta combinación.');
        }

        Apreciacion::create($request->all());

        return redirect()->back()->with('success', 'Apreciación creada exitosamente.');
    }

    public function update(Request $request,int $id)
    {
        $request->validate([
            'literal' => 'required|string|max:50',
            'numeral' => 'nullable|string|max:10',
            'status' => 'required|string|in:Sin Definir,Aprobado,Reprobado',
        ]);

        $apreciacion = Apreciacion::findOrFail($id);

        // Verificar duplicado (excluyendo el registro actual)
        $exists = Apreciacion::where('literal', $request->literal)
            ->where('numeral', $request->numeral)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Ya existe otra apreciación con esta combinación.');
        }

        $apreciacion->update($request->all());

        return redirect()->back()->with('success', 'Apreciación actualizada exitosamente.');
    }

  
}
