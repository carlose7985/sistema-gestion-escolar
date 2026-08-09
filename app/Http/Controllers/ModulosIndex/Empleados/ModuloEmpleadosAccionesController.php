<?php

namespace App\Http\Controllers\ModulosIndex\Empleados;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuloEmpleadosAccionesController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Modulos/Empleados/EmpleadosAccionesIndex');
    }
}
