<?php
namespace App\Services;

use App\Models\Institucion;
use App\Models\EmpleadoActivo;
use App\Models\Logo;

class ReportService
{
public static function getMetadata()
{
$institucion = Institucion::first();
$visual = Logo::find('1');
$director = EmpleadoActivo::where('funcion_en_el_plantel', 'Director')->first();

// Lógica del nombre del director (Idéntica a tu sistema anterior)
$nombreDirector = "__________________________";
$cedulaDirector = "__________";

        if ($director) {
            // 1. Obtenemos los primeros nombres y apellidos
            $primerNombre = explode(' ', $director->nombres)[0];
            $primerApellido = explode(' ', $director->apellidos)[0];

            // 2. Definimos el prefijo según el sexo
            $prefijo = $director->sexo === 'F' ? 'Profa.' : 'Prof.';

            // 3. Obtenemos el grado de instrucción (ej: MSc., Lcda, Dr.)
            $grado = $director->grado_de_intruccion ?? '';

            // 4. CONSTRUCCIÓN FINAL: Prefijo + Grado + Nombre + Apellido
            // Usamos trim() y un espacio para que si el grado está vacío no queden dos espacios juntos
            $nombreDirector = "{$prefijo} {$grado} {$primerNombre} {$primerApellido}";

            // Limpiamos espacios extras por si acaso
            $nombreDirector = preg_replace('/\s+/', ' ', trim($nombreDirector));

            $cedulaDirector = "{$director->documento}{$director->cedula}";
        }

// Lógica de fecha legal
$d = now();
$meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
$mesNombre = $meses[$d->month - 1];
$dia = $d->format('d');

$fechaTexto = ($dia == '01')
? "al primer ({$dia}) día del mes de {$mesNombre} del año {$d->year}"
: "a los ({$dia}) días del mes de {$mesNombre} del año {$d->year}";

return [
'institucion' => $institucion,
'director' => [
'nombre' => $nombreDirector,
'cedula' => $cedulaDirector
],
'fechaTexto' => $fechaTexto,
'logoUrl' => $visual?->logo_documentos_url // Usando el accesor que creamos antes
];
}
}