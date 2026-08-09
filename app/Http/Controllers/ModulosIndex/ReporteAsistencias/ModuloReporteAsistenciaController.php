<?php

namespace App\Http\Controllers\ModulosIndex\ReporteAsistencias;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuloReporteAsistenciaController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Modulos/Recursos/Index', [
            'status' => session('status'),
        ]);
    }
}
