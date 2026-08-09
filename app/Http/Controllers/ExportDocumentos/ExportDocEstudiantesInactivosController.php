<?php

namespace App\Http\Controllers\ExportDocumentos;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\Grado;
use App\Models\Institucion;
use App\Models\Logo;
use App\Models\PeriodoEscolar;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExportDocEstudiantesInactivosController extends Controller
{
    public function exportDocumentosEstudianteInactivo(Request $request)
    {
      //dd($request->all());
        $type = $request->query('type');
        $studentId = $request->query('studentId');
        $periodoId = $request->query('periodo_id');
        $status = $request->query('status');

        switch ($type) {

            case 'constancia-de-retiro':
                return $this->ConstanciaDeRetiro($request);

            case 'reporte-sisge':
                return $this->exportMatriculasisge($request);

            default:
                abort(404, 'Tipo de documento no válido');
        }
    }

    public function ConstanciaDeRetiro(Request $request)
    {
        $estudianteId = $request->input('estudiante_id') ?? $request->input('studentId');
        $periodoId    = $request->input('periodo_id') ?? PeriodoHelper::getActivoId();
        $gradoId      = $request->input('grado_id');

        if (!$estudianteId) {
            return redirect()->back()->with('error', 'El ID del estudiante es obligatorio.');
        }

        // 1. Configuración de idioma e información institucional
        Carbon::setLocale('es');

        $logo = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 2. Buscar el registro de retiro en estudiante_periodos
        $query = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('status', 'Retirado');

        if ($periodoId) {
            $query->where('periodo_id', $periodoId);
        }

        if ($gradoId) {
            $query->where('grado_id', $gradoId);
        }

        $registro = $query->first();

        // Fallback: Si no encuentra con el período/grado especificado, buscar el retiro más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
                ->where('status', 'Retirado')
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            return redirect()->back()->with('error', 'No se encontró un registro de retiro para este estudiante.');
        }

        // 3. Obtener modelos relacionados
        $estudiante = Estudiante::find($estudianteId);
        if (!$estudiante) {
            return redirect()->back()->with('error', 'Estudiante no encontrado.');
        }

        $grado = Grado::find($registro->grado_id);
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 4. Preparar la estructura de datos para la plantilla PDF
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado?->nombre_del_grado ?? 'N/A',
                'seccion'         => $grado?->seccion ?? 'N/A',
                'docente'         => $grado?->docente ?? '',
                'status_escolar'  => $registro->status_escolar,
                'apreciacion'     => $registro->apreciacion,
                'periodo_escolar' => $periodo?->periodo_actual ?? $periodo?->nombre_periodo ?? 'N/A',
            ]
        );

        $now = Carbon::now();
        $dia   = $now->format('d');
        $mes   = $now->translatedFormat('F');
        $aho   = $now->format('Y');
        $title = 'Constancia de Retiro';

        // 5. Generar y entregar el PDF
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-retiro', compact(
            'title',
            'logoDocumento',
            'estudianteData',
            'institucion',
            'dia',
            'mes',
            'aho'
        ));

        $pdf->setPaper('Letter', 'portrait');

        $nombreLimpio = Str::slug("{$estudiante->name} {$estudiante->apellido}", '_');
        $nombreArchivo = "C-D-R_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
    }

    public function exportMatriculasisge(Request $request)
    {
        // 1. Datos base e Institución
        $institucion = Institucion::all();
        $logo = Logo::first();
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo para generar el reporte.');
        }

        $periodoId = $periodoActivo->id;

        // 2. Manejo de Logos
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        // 3. CONSULTA BASE (Pivot: estudiante_periodos)
        // Definimos una base para no repetir joins y wheres
        $queryBase = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados as g', 'estudiante_periodos.grado_id', '=', 'g.id')
            ->where('estudiante_periodos.periodo_id', $periodoId);

        // --- TOTALES GENERALES (sm) ---
        $sm = (clone $queryBase)
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as totalm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as totalf")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatri")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'M' then 1 end) as totalmatriM")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'F' then 1 end) as totalmatriF")
            ->get();

        // --- TOTALES POR GRADO (sfg) ---
        $sfg = (clone $queryBase)
            ->select('g.nombre_del_grado as grado')
            ->selectRaw('count(*) as totalmf')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as sexom")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as sexof")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatrig")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'M' then 1 end) as totalmatriMg")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'F' then 1 end) as totalmatriFg")
            ->groupBy('grado')
            ->orderBy('grado')
            ->get();

        // --- TOTALES POR GRADO Y SECCIÓN (smg) ---
        $smg = (clone $queryBase)
            ->select('g.nombre_del_grado as grado', 'g.seccion as seccion')
            ->selectRaw('count(*) as totals')
            ->selectRaw("count(case when estudiantes.sexo = 'M' then 1 end) as sexosm")
            ->selectRaw("count(case when estudiantes.sexo = 'F' then 1 end) as sexosf")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' then 1 end) as totalmatrigs")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'M' then 1 end) as totalmatriMgs")
            ->selectRaw("count(case when estudiante_periodos.matricula_sisge = 'Si' AND estudiantes.sexo = 'F' then 1 end) as totalmatriFgs")
            ->groupBy('grado', 'seccion')
            ->orderBy('grado')
            ->orderBy('seccion')
            ->get();

        // 4. Generación del PDF
        $pdf = Pdf::loadView('pdfs.estudiantesPDF.matriculas.matricula-sisge', compact(
            'sm',
            'smg',
            'sfg',
            'institucion',
            'logoDocumento',
            'logoInstitucion',
            'periodoActivo'
        ));

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Matriculación General Sisge - ' . $periodoActivo->nombre_periodo . '.pdf');
    }
}
