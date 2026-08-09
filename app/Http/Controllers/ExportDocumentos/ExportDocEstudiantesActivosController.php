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

class ExportDocEstudiantesActivosController extends Controller
{
    public function exportDocumentosEstudianteActivo(Request $request)
    {
      //dd($request->all());
        $type = $request->query('type');
        $studentId = $request->query('studentId');
        $periodoId = $request->query('periodo_id');
        $status = $request->query('status');

        switch ($type) {
            case 'ficha-de-inscripcion':
                return $this->FichaDeInscripcion($studentId, $periodoId);

            case 'constancia-de-inscripcion':
                return $this->ConstanciaDeInscripcion($studentId, $periodoId);

            case 'constancia-de-estudio':
                return $this->ConstanciaDeEstudio($studentId, $periodoId);

            case 'carta-de-buena-conducta':
                return $this->CartaBuenaConducta($studentId, $periodoId, $status);

            case 'constancia-de-notas':
                return $this->ConstanciaDeNotas($studentId, $periodoId);

            case 'constancia-de-retiro':
                return $this->ConstanciaDeRetiro($request);

            default:
                abort(404, 'Tipo de documento no válido');
        }
    }

    public function FichaDeInscripcion(int $studentId, ?int $periodoId = null)
    {
        Carbon::setLocale('es');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();
        $logo = Logo::first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 1. Buscar el estudiante e incluir la relación de la madre junto con padre y representante
        $estudiante = Estudiante::with(['padre', 'representante'])->findOrFail($studentId);

        // 2. Si no viene período, usar el activo mediante el Helper
        if (!$periodoId) {
            $periodoId = PeriodoHelper::getActivoId();
        }

        // 3. Buscar el registro en estudiante_periodos
        $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->first();

        // 4. Si no encuentra, buscar el más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            abort(404, 'No se encontró registro del estudiante en el período actual.');
        }

        // 5. Obtener el grado
        $grado = Grado::find($registro->grado_id);

        // 6. Obtener el período
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 7. Combinar datos para la vista
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'                    => $grado ? $grado->nombre_del_grado : null,
                'seccion'                  => $grado ? $grado->seccion : null,
                'docente'                  => $grado ? $grado->docente : null,
                'periodo_escolar'          => $periodo ? ($periodo->periodo_actual ?? $periodo->nombre_periodo) : null,
                'apreciacion'              => $registro->apreciacion,
                'direccion'                => $registro->direccion ?? $estudiante->direccion,
                'instituto_de_procedencia' => $registro->instituto_de_procedencia,
                'lateralidad'              => $registro->lateralidad,
                'talla_de_camisa'          => $registro->talla_de_camisa,
                'talla_de_pantalon'        => $registro->talla_de_pantalon,
                'talla_de_zapato'          => $registro->talla_de_zapato,
                'status_escolar'           => $registro->status_escolar,
                'condicion'                => $registro->condicion,
                'edad'                     => $estudiante->fecha_de_nacimiento ? Carbon::parse($estudiante->fecha_de_nacimiento)->age : null,
            ]
        );

        // 8. Calcular edades de responsables (padre, madre y representante)
        $edad_p = $estudiante->padre && $estudiante->padre->fecha_de_nacimiento_r
            ? Carbon::parse($estudiante->padre->fecha_de_nacimiento_r)->age
            : null;


        $edad_r = $estudiante->representante && $estudiante->representante->fecha_de_nacimiento_r
            ? Carbon::parse($estudiante->representante->fecha_de_nacimiento_r)->age
            : null;

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.ficha-de-incripcion', compact(
            'estudianteData',
            'estudiante',
            'edad_p',
            'edad_r',
            'institucion',
            'logoDocumento'
        ));

        $pdf->setPaper('Letter', 'portrait');

        $nombreLimpio = Str::slug("{$estudiante->name} {$estudiante->apellido}", '_');
        $nombreArchivo = "Ficha_de_Inscripcion_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
    }

    public function ConstanciaDeInscripcion(int $studentId, ?int $periodoId = null)
    {
        Carbon::setLocale('es');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();
        $logo = Logo::first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 1. Buscar el estudiante en la tabla estudiantes
        $estudiante = Estudiante::findOrFail($studentId);

        // 2. Si no viene período, usar el activo mediante el Helper
        if (!$periodoId) {
            $periodoId = PeriodoHelper::getActivoId();
        }

        // 3. Buscar el registro en estudiante_periodos
        $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->first();

        // 4. Si no encuentra, buscar el más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            abort(404, 'No se encontró registro del estudiante en el período actual.');
        }

        // 5. Obtener el grado
        $grado = Grado::find($registro->grado_id);

        // 6. Obtener el período
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 7. Combinar datos para la vista
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado ? $grado->nombre_del_grado : null,
                'seccion'         => $grado ? $grado->seccion : null,
                'docente'         => $grado ? $grado->docente : null,
                'periodo_escolar' => $periodo ? ($periodo->periodo_actual ?? $periodo->nombre_periodo) : null,
                'apreciacion'     => $registro->apreciacion,
                'status_escolar'  => $registro->status_escolar,
                'condicion'       => $registro->condicion,
            ]
        );

        $title = 'Constancia de inscripción';
        $now = Carbon::now();
        $dia = $now->format('d');
        $mes = $now->translatedFormat('F');
        $aho = $now->format('Y');

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-inscripcion', compact(
            'estudianteData',
            'institucion',
            'dia',
            'title',
            'mes',
            'aho',
            'logoDocumento'
        ));

        $pdf->setPaper('Letter', 'portrait');

        $nombreLimpio = Str::slug("{$estudiante->name} {$estudiante->apellido}", '_');
        $nombreArchivo = "C-D-I_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
    }
    public function ConstanciaDeEstudio(int $studentId, ?int $periodoId = null)
    {
        Carbon::setLocale('es');

        $logo = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 1. Buscar el estudiante en la tabla estudiantes
        $estudiante = Estudiante::findOrFail($studentId);

        // 2. Si no viene período, usar el activo mediante el Helper
        if (!$periodoId) {
            $periodoId = PeriodoHelper::getActivoId();
        }

        // 3. Buscar el registro en estudiante_periodos
        $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->first();

        // 4. Si no encuentra, buscar el más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            abort(404, 'No se encontró registro del estudiante en el período actual.');
        }

        // 5. Obtener el grado
        $grado = Grado::find($registro->grado_id);

        // 6. Obtener el período
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 7. Combinar datos para la vista
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado ? $grado->nombre_del_grado : null,
                'seccion'         => $grado ? $grado->seccion : null,
                'docente'         => $grado ? $grado->docente : null,
                'periodo_escolar' => $periodo ? ($periodo->periodo_actual ?? $periodo->nombre_periodo) : null,
                'apreciacion'     => $registro->apreciacion,
                'status_escolar'  => $registro->status_escolar,
                'condicion'       => $registro->condicion,
            ]
        );

        $title = 'Constancia de estudios';
        $now = Carbon::now();
        $dia = $now->format('d');
        $mes = $now->translatedFormat('F');
        $aho = $now->format('Y');

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-estudio', compact(
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
        $nombreArchivo = "C-D-E_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
    }

    public function CartaBuenaConducta(int $studentId, ?int $periodoId = null, ?string $status = null)
    {
        Carbon::setLocale('es');

        $logo = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 1. Buscar el estudiante en la tabla estudiantes
        $estudiante = Estudiante::findOrFail($studentId);

        // 2. Si no viene período, usar el activo
        if (!$periodoId) {
            $periodoId = PeriodoHelper::getActivoId();
        }

        // 3. Buscar el registro en estudiante_periodos
        $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->first();

        // 4. Si no encuentra, buscar el más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            abort(404, 'No se encontró registro del estudiante en el período actual.');
        }

        // 5. Obtener el grado
        $grado = Grado::find($registro->grado_id);

        // 6. Obtener el período
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 7. Combinar datos para la vista
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado ? $grado->nombre_del_grado : null,
                'seccion'         => $grado ? $grado->seccion : null,
                'docente'         => $grado ? $grado->docente : null,
                'periodo_escolar' => $periodo ? ($periodo->periodo_actual ?? $periodo->nombre_periodo) : null,
                'apreciacion'     => $registro->apreciacion,
                'status_escolar'  => $registro->status_escolar,
                'condicion'       => $registro->condicion,
                'status'          => $registro->status,
            ]
        );

        $title = 'Carta de buena conducta';
        $now = Carbon::now();
        $dia = $now->format('d');
        $mes = $now->translatedFormat('F');
        $aho = $now->format('Y');

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.carta-de-buena-conducta', compact(
            'status',
            'title',
            'estudianteData',
            'institucion',
            'dia',
            'logoDocumento',
            'mes',
            'aho'
        ));

        $pdf->setPaper('Letter', 'portrait');

        $nombreLimpio = Str::slug("{$estudiante->name} {$estudiante->apellido}", '_');
        $nombreArchivo = "C-D-B-C_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
    }
    public function ConstanciaDeNotas(int $studentId, ?int $periodoId = null)
    {
        Carbon::setLocale('es');

        // 1. Obtener imagen del logo e información de la institución
        $logo = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 2. Obtener el estudiante
        $estudiante = Estudiante::findOrFail($studentId);

        // 3. Si no viene período en los parámetros, obtener el activo mediante el Helper
        if (!$periodoId) {
            $periodoId = PeriodoHelper::getActivoId();
        }

        // 4. Buscar el registro en la tabla pivote estudiante_periodos
        $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->first();

        // Fallback: Si no se encuentra registro específico, buscar el registro más reciente
        if (!$registro) {
            $registro = EstudiantePeriodo::where('estudiante_id', $studentId)
                ->orderBy('periodo_id', 'desc')
                ->first();
        }

        if (!$registro) {
            abort(404, 'No se encontró registro del estudiante para el período solicitado.');
        }

        // 5. Incrementar el contador de impresiones y marcar como actualizado usando clave compuesta
        DB::table('estudiante_periodos')
            ->where('estudiante_id', $studentId)
            ->where('periodo_id', $registro->periodo_id)
            ->where('grado_id', $registro->grado_id)
            ->update([
                'actualizado'          => 'Si',
                'updated_at'           => now(),
            ]);

        // 6. Obtener modelos asociados al registro final
        $grado = Grado::find($registro->grado_id);
        $periodo = PeriodoEscolar::find($registro->periodo_id);

        // 7. Preparación del objeto de datos para la plantilla
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado?->nombre_del_grado ?? 'N/A',
                'seccion'         => $grado?->seccion ?? 'N/A',
                'docente'         => $grado?->docente ?? '',
                'periodo_escolar' => $periodo?->periodo_actual ?? $periodo?->nombre_periodo ?? 'N/A',
                'apreciacion'     => $registro->apreciacion,
                'status_escolar'  => $registro->status_escolar,
                'condicion'       => $registro->condicion,
            ]
        );

        $now = Carbon::now();
        $dia   = $now->format('d');
        $mes   = $now->translatedFormat('F');
        $aho   = $now->format('Y');
        $title = 'Constancia de Notas';

        // 8. Carga y renderizado del PDF
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-notas', compact(
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
        $nombreArchivo = "C-D-N_{$nombreLimpio}.pdf";

        return $pdf->stream($nombreArchivo);
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
}
