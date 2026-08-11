<?php

namespace App\Http\Controllers\Estudiantes\EstudiantesPorGrado;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Grado;
use App\Models\Institucion;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EstudiantesNoCeduladosController extends Controller
{
    public function index()
    {
        return Inertia::render('Estudiantes/NoCedulados/Index', [
            'filters' => [
                'search' => '',
                'grado' => '',
            ]
        ]);
    }

    public function data(Request $request)
    {
        $search = $request->input('search');
        $gradoId = $request->input('grado');

        // 🔥 PASO PREVIO: Limpieza automática de datos
        // Actualiza a "Si" todos los estudiantes que tengan una cédula de 8 dígitos 
        // pero que aún estén marcados como "No" cedulados.
        DB::table('estudiantes')
            ->where('cedulado', 'No')
            ->whereRaw('LENGTH(cedula) = 8')
            ->update(['cedulado' => 'Si']);

        // 1. Obtener período activo
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return response()->json(['data' => [], 'totals' => ['total' => 0, 'm' => 0, 'f' => 0]]);
        }

        $periodoId = $periodoActivo->id;

        // 2. Construir consulta (Ahora los recién actualizados ya no saldrán aquí)
        $query = DB::table('estudiante_periodos as ep')
            ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
            ->join('grados as g', 'ep.grado_id', '=', 'g.id')
            ->where('ep.periodo_id', $periodoId)
            ->where('ep.status', 'Activo')
            ->where('e.cedulado', 'No') 
            ->whereIn('g.nombre_del_grado', ['5to Grado', '6to Grado'])
            ->select(
                'e.id',
                'e.name',
                'e.apellido',
                'e.cedula',
                'e.sexo',
                'e.fecha_de_nacimiento',
                'e.documento',
                'e.lugar_de_nacimiento',
                'e.cedulado',
                'g.id as grado_id',
                'g.nombre_del_grado as grado',
                'g.seccion',
                DB::raw("TIMESTAMPDIFF(YEAR, e.fecha_de_nacimiento, CURDATE()) as edad")
            )
            ->orderBy('e.apellido', 'asc')
            ->orderBy('e.name', 'asc');

        // Aplicar filtro de búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('e.name', 'like', "%{$search}%")
                    ->orWhere('e.apellido', 'like', "%{$search}%")
                    ->orWhere('e.cedula', 'like', "%{$search}%")
                    ->orWhere('e.documento', 'like', "%{$search}%");
            });
        }

        // Aplicar filtro de grado
        if ($gradoId && $gradoId !== '') {
            $query->where('g.id', $gradoId);
        }

        $data = $query->get();

        // 3. Totales
        $totales = [
            'total' => $data->count(),
            'm' => $data->where('sexo', 'M')->count(),
            'f' => $data->where('sexo', 'F')->count(),
        ];

        // 4. Grados disponibles para el filtro (5to y 6to)
        $grados = Grado::whereIn('nombre_del_grado', ['5to Grado', '6to Grado'])
            ->orderBy('id', 'asc')
            ->get(['id', 'nombre_del_grado', 'seccion']);

        return response()->json([
            'data' => $data,
            'totals' => $totales,
            'grados' => $grados,
        ]);
    }

    /**
     * Actualizar estado de cedulado a "Si" para uno o varios estudiantes
     */
    public function updateCedulado(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:estudiantes,id',
        ]);

        $ids = $request->input('ids');

        $updated = DB::table('estudiantes')
            ->whereIn('id', $ids)
            ->update(['cedulado' => 'Si']);

        return response()->json([
            'success' => true,
            'message' => "{$updated} estudiante(s) actualizado(s) a CEDULADO",
            'updated' => $updated,
        ]);
    }


    public function exportPdf(Request $request)
    {
        $search = $request->input('search');
        $gradoId = $request->input('grado');
        $periodoActivo = \App\Helpers\PeriodoHelper::getActivo();

        // 1. Consulta con filtros aplicados
        $query = DB::table('estudiante_periodos as ep')
            ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
            ->join('grados as g', 'ep.grado_id', '=', 'g.id')
            ->where('ep.periodo_id', $periodoActivo->id)
            ->where('ep.status', 'Activo')
            ->where('e.cedulado', 'No')
            ->whereIn('g.nombre_del_grado', ['5to Grado', '6to Grado'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('e.name', 'like', "%{$search}%")
                        ->orWhere('e.apellido', 'like', "%{$search}%")
                        ->orWhere('e.cedula', 'like', "%{$search}%");
                });
            })
            ->when($gradoId, function ($q) use ($gradoId) {
                $q->where('g.id', $gradoId);
            })
            ->select('e.*', 'g.nombre_del_grado as grado', 'g.seccion')
            ->orderBy('e.apellido', 'asc');

        $estudiantes = $query->get();

        // 2. Datos institucionales
        $institucion = \App\Models\Institucion::first();
        $filtro_grado = $gradoId ? \App\Models\Grado::find($gradoId) : null;

        $totales = [
            'total' => $estudiantes->count(),
            'm' => $estudiantes->where('sexo', 'M')->count(),
            'f' => $estudiantes->where('sexo', 'F')->count(),
        ];

        // 3. Logo en Base64 para evitar problemas de carga
        $logoDocumento = null;
        $logo = \App\Models\Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');

        $fecha = now()->format('d/m/Y h:i A');
        $periodo = $periodoActivo->nombre_periodo;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.estudiantesPDF.reporte-no-cedulados', compact(
            'estudiantes',
            'institucion',
            'totales',
            'filtro_grado',
            'logoDocumento',
            'fecha',
            'periodo'
        ));

        return $pdf->setPaper('letter', 'portrait')->stream('Listado_No_Cedulados.pdf');
    }


}