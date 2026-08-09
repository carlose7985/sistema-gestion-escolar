<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInstitucionRequest;
use App\Models\Institucion;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class InstitucionController extends Controller
{
    public function index()
    {
        return Inertia::render('DatosBasicos/Institucion/Index', [
            'institucion' => Institucion::first()
        ]);
    }

    public function store(UpdateInstitucionRequest $request)
    {
        // Validamos y guardamos siempre en el ID 1 para que sea registro único
        Institucion::updateOrCreate(['id' => 1], $request->all());
        $institucion = Institucion::updateOrCreate(
            ['id' => 1],
            $request->validated()
        );
        return back()->with('success', 'Datos institucionales actualizados correctamente');
    }

    public function imprimir()
    {
        $institucion = Institucion::first();
        if (!$institucion) {
            return redirect()->back()->with('error', 'No hay datos cargados.');
        }

        // Calculamos antigüedad
        $fundacion = Carbon::parse($institucion->fecha_de_fundada);
        $antiguedad = number_format($fundacion->diffInYears(Carbon::now()), 0);

        $pdf = Pdf::loadView('pdfs.institucion.ficha_institucional', compact('institucion', 'antiguedad'));

        // Configuración de papel
        $pdf->setPaper('letter', 'portrait');

        return $pdf->stream("Ficha_{$institucion->rif}.pdf");
    }
   
}
