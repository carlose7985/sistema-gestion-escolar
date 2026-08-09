<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\DiaFestivo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiaFestivoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $festivos = DiaFestivo::query()
            ->when($search, function ($query, $search) {
                $query->where('descripcion', 'like', "%{$search}%")
                    ->orWhere('fecha', 'like', "%{$search}%");
            })
            ->orderBy('fecha', 'asc')
            ->paginate(6)
            ->withQueryString();

        return Inertia::render('DatosBasicos/Festivos/Index', [
            'festivos' => $festivos,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fecha' => 'required|date',
            'descripcion' => 'required|string|max:255',
        ]);

       $diafestivo = DiaFestivo::updateOrCreate(['id' => $request->id], $data);
        $message = $diafestivo->wasRecentlyCreated
            ? 'Fecha agregada con éxito'
            : 'Fecha actualizada con éxito';
        return back()->with('success', $message);
    }

    public function storeFestivo(Request $request)
    {
        $request->validate([
            'fechas' => 'required|array',
            'fechas.*' => 'date',
            'descripcion' => 'nullable|string'
        ]);

        $fechas = $request->input('fechas');
        $descripcion = $request->input('descripcion', 'Día Festivo / No Laborable');

        foreach ($fechas as $fecha) {
            // Asegurar formato Y-m-d
            $fechaFormateada = Carbon::parse($fecha)->format('Y-m-d');

            DiaFestivo::firstOrCreate(
                ['fecha' => $fechaFormateada],
                ['descripcion' => $descripcion]
            );
        }

        return back()->with('success', 'Días marcados como festivos correctamente.');
    }

    public function destroy(int $id)
    {
        DiaFestivo::destroy($id);
        return back()->with('info', 'Fecha eliminada');
    }
}
