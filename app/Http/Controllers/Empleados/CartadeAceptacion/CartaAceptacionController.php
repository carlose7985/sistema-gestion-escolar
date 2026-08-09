<?php

namespace App\Http\Controllers\Empleados\CartadeAceptacion;

use App\Http\Controllers\Controller;
use App\Models\CartaAceptacion;
use App\Models\Cargo; // Usaremos los cargos que ya creamos
use Illuminate\Http\Request;
use Inertia\Inertia;


class CartaAceptacionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $cartas = CartaAceptacion::query()
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('Empleados/CartaAceptacion/Index', [
            'cartas' => $cartas,
            'cargos' => Cargo::all(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'cedula' => 'required|unique:carta_aceptacions,cedula,' . $request->id,
            'sexo' => 'required',
            'tipo_de_personal' => 'required',
        ]);

        CartaAceptacion::updateOrCreate(
            ['id' => $request->id],
            [
                'nombres' => mb_convert_case($request->nombres, MB_CASE_TITLE, "UTF-8"),
                'apellidos' => mb_convert_case($request->apellidos, MB_CASE_TITLE, "UTF-8"),
                'documento' => $request->documento ?? 'V-',
                'cedula' => $request->cedula,
                'sexo' => $request->sexo,
                'tipo_de_personal' => $request->tipo_de_personal,
                'fecha_registro' => now(),
            ]
        );
        $mensage = $request->id ? 'Carta de aceptación actualizada con éxito' : 'Carta de aceptación creada con éxito';
        return back()->with('success', $mensage);
    }
   
    public function destroy(int $id)
    {
        CartaAceptacion::destroy($id);
        return back()->with('info', 'Registro eliminado');
    }
}
