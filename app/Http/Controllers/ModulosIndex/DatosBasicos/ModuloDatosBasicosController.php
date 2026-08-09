<?php

namespace App\Http\Controllers\ModulosIndex\DatosBasicos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuloDatosBasicosController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Modulos/DatosBasicos/Index', [
            'status' => session('status'),
        ]);
    }
}
