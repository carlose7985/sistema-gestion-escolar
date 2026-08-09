<?php

namespace App\View\Composers;

use Illuminate\View\View;
use App\Models\EmpleadoActivo;

class DirectorComposer
{
    public function compose(View $view)
    {
        //esta funcion lleva todos los datos del empleado en cuestion
        $director = EmpleadoActivo::where('funcion_en_el_plantel', 'Director')->first();

        // Si se encuentra un director, le añadimos el prefijo "Profa y unificamos los nombres."
        if ($director) {
            $nombreCompleto = "Profa. " . $director->nombres . " " . $director->apellidos;
            $director->setAttribute('nombre_completo', $nombreCompleto);
            //usamos el setAttr para donde llamos la funcion
        }
          // Si se encuentra un director, le añadimos el prefijo "Profa y unificamos primer  nombres y primer apellido"
         if ($director) {
            $primerNombre = explode(' ', $director->nombres)[0];
            $primerApellido = explode(' ', $director->apellidos)[0];
            $nombreCompleto = "Profa. " . $director->grado_de_intruccion.  " " . $primerNombre . " " . $primerApellido;
            
            $director->setAttribute('nombre_y_apellido', $nombreCompleto);
        }

        $view->with('director', $director);
    }
}
