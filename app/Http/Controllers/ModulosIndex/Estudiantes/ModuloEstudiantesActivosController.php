<?php

namespace App\Http\Controllers\ModulosIndex\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuloEstudiantesActivosController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Modulos/Estudiantes/EstudiantesActivosIndex');
    }
}
