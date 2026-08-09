<?php

namespace App\Http\Controllers\Empleados\Notificaciones;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class NotificacionesController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $month = $request->input('month');
        $year = $request->input('year');

        $empleados = EmpleadoActivo::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombres', 'LIKE', "%{$search}%")
                        ->orWhere('apellidos', 'LIKE', "%{$search}%")
                        ->orWhere('cedula', 'LIKE', "%{$search}%");
                });
            })
            ->orderBy('id', 'asc')
            ->paginate(10) // Aumenté a 10 para mejor visualización
            ->withQueryString();

        return Inertia::render('Empleados/Notificaciones/Index', [
            'empleados' => $empleados,
            'filters' => $request->only(['search', 'month', 'year'])
        ]);
    }

   
}
