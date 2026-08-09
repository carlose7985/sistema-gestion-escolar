<?php

namespace App\Http\Controllers\Estudiantes\Fechas;

use App\Http\Controllers\Controller;
use App\Models\FechaEntregaDocumento;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FechaEntregaDocumentosController extends Controller
{
    public function index(Request $request){
        $query = FechaEntregaDocumento::orderBy('id', 'asc')->latest();

        if ($request->has('search') && $request->search != null) {
            $query->whereAny(['fecha'], 'like', '%' . $request->search . '%');
        }
        $datos = $query->paginate(1)->toArray();
        return Inertia::render('Estudiantes/FechaEntregaDocumentos/Index', [
            'datos' => $datos,
        ]);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'periodo_escolar' => ['required', 'string', 'max:255'],
            'fecha' => ['required', 'date'],
        ]);

        // Verificar si ya existe una entrada para este periodo escolar
        $existing = FechaEntregaDocumento::where('periodo_escolar', $request->periodo_escolar)->first();

        if ($existing) {
            session()->flash('success', 'La fecha de entrega para este período escolar ya ha sido registrada.');
            return back();
        }

        FechaEntregaDocumento::create([
            'periodo_escolar' => $request->periodo_escolar,
            'fecha' => $request->fecha,
        ]);
        return back();
       
    }

    public function edit(Request $request, FechaEntregaDocumento $fecha_entrega_documento)
    {
        return Inertia::render('Estudiantes/FechaEntregaDocumentos/Edit', [
            'fechadocumentoData' => $fecha_entrega_documento,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $fecha = FechaEntregaDocumento::findOrFail($id);

        $validated = $request->validate([
            'periodo_escolar' => ['required', 'string', 'max:255'],
            'fecha' => ['required', 'date'],
        ]);

        $fecha->update($validated);

        return to_route('estudiantes.activos.aprobados.index')->with('success', 'Fecha actualizada correctamente.');
    }
}

