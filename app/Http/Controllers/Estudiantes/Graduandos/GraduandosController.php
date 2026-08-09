<?php

namespace App\Http\Controllers\Estudiantes\Graduandos;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\PDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GraduandosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Obtener estudiantes de 6to grado que tengan asiste = 'Si' en zonificacion
        $seleccionados = DB::table('zonificacions')
            ->join('estudiantes', 'zonificacions.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'zonificacions.grado_id', '=', 'grados.id')
            ->where('zonificacions.periodo_id', $periodoId)
            ->where('zonificacions.asiste', 'Si')
            ->where('grados.nombre_del_grado', 'like', '%6to%')
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'grados.nombre_del_grado',
                'grados.seccion'
            )
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('estudiantes.name', 'like', "%{$search}%")
                        ->orWhere('estudiantes.apellido', 'like', "%{$search}%")
                        ->orWhere('estudiantes.cedula', 'like', "%{$search}%");
                });
            })
            ->orderBy('estudiantes.name', 'asc')
            ->paginate(6);

        return Inertia::render('Estudiantes/Graduandos/Index', [
            'seleccionados' => $seleccionados,
            'filters' => $request->only(['search'])
        ]);
    }

    public function update(int $id)
    {
        try {
            $periodoActivo = PeriodoHelper::getActivo();

            if (!$periodoActivo) {
                return redirect()->back()->with('error', 'No hay un período activo.');
            }

            $periodoId = $periodoActivo->id;

            // Cambiar asiste a "No" en zonificacions
            $updated = DB::table('zonificacions')
                ->where('estudiante_id', $id)
                ->where('periodo_id', $periodoId)
                ->update(['asiste' => 'No']);

            if ($updated) {
                return redirect()->back()->with('success', 'Estudiante marcado como NO ASISTIRÁ.');
            }

            return redirect()->back()->with('error', 'No se encontró el estudiante.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function imprimir(Request $request)
    {
        $chunk = $request->input('chunk', 6);

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Obtener estudiantes de 6to grado con asiste = "Si" desde zonificacions
        $estudiantes = DB::table('zonificacions')
            ->join('estudiantes', 'zonificacions.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'zonificacions.grado_id', '=', 'grados.id')
            ->where('zonificacions.periodo_id', $periodoId)
            ->where('zonificacions.asiste', 'Si')
            ->where('grados.nombre_del_grado', 'like', '%6to%')
            ->select(
                'estudiantes.id',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'grados.nombre_del_grado',
                'grados.seccion'
            )
            ->orderBy('estudiantes.name', 'asc')
            ->get();

        // 3. Dividir en chunks para el PDF
        $estudiantes = $estudiantes->chunk($chunk);

        $pdf = PDF::loadView('pdfs.estudiantesPDF.listado-graduandos', compact('estudiantes'));
        return $pdf->stream('ceremonia.pdf');
    }
}
