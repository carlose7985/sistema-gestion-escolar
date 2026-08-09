<?php

namespace App\Http\Controllers\ExportDocumentos;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\EstudianteGraduado;
use App\Models\EstudiantePeriodo;
use App\Models\FechaEntregaDocumento;
use App\Models\Grado;
use App\Models\Institucion;
use App\Models\Logo;
use App\Models\PeriodoEscolar;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExportDocEstudiantesCalificadosController extends Controller
{

    public function exportDocumentosEstudianteCalificado(Request $request)
    {
        //dd('Estoy aqui, exportDocumentosEstudiante', $request->all());

        $type = $request->query('type');
        $status = $request->query('status');
        $studentId = $request->query('studentId');
        $section = $request->query('section');

        switch ($type) {

            case 'listado-aprobados':
                return $this->ListadoAprobados($request);

            case 'listado-aprobados-con-a':
                return $this->ListadoAprobadosLiteralA($request);

            case 'estadistica-aprobados':
                return $this->EstadisticaAprobados($request);

            case 'constancias-prosecucion':

                return $this->ConstanciaAprobados($request);

            case 'constancias-prosecucion-masiva':
                return $this->ConstanciaMasivaAprobados($request);

            case 'constancia-de-aprobado-graduado-especial':
                return $this->ConstanciaAprobadosGraduadosEspecial($studentId, $status, $section);

            case 'constancia-de-no-promovido':
                return $this->ConstanciaReprobados($request);

            case 'listado-reprobados':
                return $this->ListadoReprobados($request);

            case 'estadistica-reprobados':
                return $this->EstadisticaReprobados($request);

            case 'constancia-de-retiro':
                return $this->ConstanciaDeRetiro($request);

            default:
                abort(404, 'Tipo de documento no válido');
        }
    }


    public function ListadoAprobados(Request $request)
    {
        // Obtener el período solicitado o fallback al activo
        $periodo = $request->periodo_id
            ? PeriodoEscolar::find($request->periodo_id)
            : PeriodoHelper::getActivo();

        $periodoId       = $periodo ? $periodo->id : null;
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        $logo            = Logo::first();
        $logoDocumento   = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion     = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Consulta de estudiantes aprobados agrupados por Grado y Sección
        $estudiantesPorGradoSeccion = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Graduado'])
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->select(
                'estudiantes.*',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.contador_impresiones as actualizado',
                'grados.nombre_del_grado as grado',
                'grados.seccion',
                'grados.docente'
            )
            ->orderBy('grado')
            ->orderBy('seccion')
            ->get()
            ->groupBy(function ($item) {
                return $item->grado . ' - ' . $item->seccion;
            });

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.listado-aprobados', compact(
            'estudiantesPorGradoSeccion',
            'periodo_escolar',
            'institucion',
            'logoDocumento',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Estudiantes_Aprobados_' . str_replace('/', '-', $periodo_escolar) . '.pdf');
    }

    public function ListadoAprobadosLiteralA(Request $request)
    {
        // Obtener el período solicitado o fallback al activo
        $periodo = $request->periodo_id
            ? PeriodoEscolar::find($request->periodo_id)
            : PeriodoHelper::getActivo();

        $periodoId       = $periodo ? $periodo->id : null;
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        $logo            = Logo::first();
        $logoDocumento   = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion     = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Consulta de estudiantes aprobados con apreciación 'A'
        $estudiantesPorGradoSeccion = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Graduado'])
            ->whereIn('estudiante_periodos.apreciacion', ['A'])
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->select(
                'estudiantes.*',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.contador_impresiones as actualizado',
                'grados.nombre_del_grado as grado',
                'grados.seccion',
                'grados.docente'
            )
            ->orderBy('grado')
            ->orderBy('seccion')
            ->get()
            ->groupBy(function ($item) {
                return $item->grado . ' - ' . $item->seccion;
            });

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.listado-aprobados-con-a', compact(
            'estudiantesPorGradoSeccion',
            'periodo_escolar',
            'institucion',
            'logoDocumento',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Estudiantes_Aprobados_Literal_A_' . str_replace('/', '-', $periodo_escolar) . '.pdf');
    }

    public function EstadisticaAprobados(Request $request)
    {
        // Obtener el período solicitado o fallback al activo
        $periodo = $request->periodo_id
            ? PeriodoEscolar::find($request->periodo_id)
            : PeriodoHelper::getActivo();

        $periodoId       = $periodo ? $periodo->id : null;
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        $logo            = Logo::first();
        $logoDocumento   = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion     = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Estadísticas Agrupadas por Grado y Sección
        $totalporgrado = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->whereIn('estudiante_periodos.status', ['Aprobado', 'Graduado'])
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->select(
                'grados.nombre_del_grado as grado',
                'grados.seccion',
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'M' THEN 1 END) as sexom"),
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'F' THEN 1 END) as sexof"),
                DB::raw("COUNT(*) as total")
            )
            ->groupBy('grados.nombre_del_grado', 'grados.seccion')
            ->orderBy('grados.nombre_del_grado')
            ->get();

        // Totales Generales Estandarizados
        $totalesQuery = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Aprobado')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->select(
                DB::raw("COUNT(*) as total"),
                DB::raw("SUM(CASE WHEN estudiantes.sexo = 'M' THEN 1 ELSE 0 END) as sexotm"),
                DB::raw("SUM(CASE WHEN estudiantes.sexo = 'F' THEN 1 ELSE 0 END) as sexotf")
            )
            ->first();

        // Estructura segura para la vista
        $totales = (object) [
            'total'  => (int) ($totalesQuery->total ?? 0),
            'sexotm' => (int) ($totalesQuery->sexotm ?? 0),
            'sexotf' => (int) ($totalesQuery->sexotf ?? 0),
        ];

        // Renderizado del PDF
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.estadistica-aprobados', compact(
            'totalporgrado',
            'periodo_escolar',
            'logoDocumento',
            'logoInstitucion',
            'totales',
            'institucion'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Estadistica_Aprobados_' . str_replace('/', '-', $periodo_escolar) . '.pdf');
    }

    public function ConstanciaAprobados(Request $request)
    {
        // Captura de datos básicos
        $estudianteId = $request->estudiante_id;
        $periodoId    = $request->periodo_id;
        $gradoId      = $request->grado_id;

        // CAPTURA CORRECTA DE BOOLEANOS
        $mostrarConstancia    = $request->boolean('constancia');
        $mostrarDescriptivo   = $request->boolean('descriptivo');
        $mostrarCertificado   = $request->boolean('certificado');
        $mostrarBuenaConducta = $request->boolean('buenaConducta');

        Carbon::setLocale('es');

        $logo        = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Buscar el registro en la tabla pivote
        $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->whereIn('status', ['Aprobado', 'Graduado'])
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'Registro no encontrado.');
        }

        $estudiante = Estudiante::find($estudianteId);
        $grado      = Grado::find($gradoId);
        $periodo    = PeriodoEscolar::find($periodoId);

        $estudianteData = (object) array_merge($estudiante->toArray(), [
            'grado'           => $grado->nombre_del_grado,
            'seccion'         => $grado->seccion,
            'docente'         => $grado->docente ?? '',
            'apreciacion'     => $registro->apreciacion,
            'periodo_escolar' => $periodo ? $periodo->nombre_periodo : '',
        ]);

        // Incrementar contador de impresiones
        EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->update([
                'contador_impresiones' => ($registro->contador_impresiones ?? 0) + 1
            ]);

        // Inicializar títulos
        $title   = 'Documentos de Aprobación';
        $title_1 = '';
        $title_2 = '';
        $title_3 = '';

        $esSexto = strpos($grado->nombre_del_grado, '6to') !== false;

        if ($esSexto) {
            $view    = 'PDFS.estudiantesPDF.constancia-de-promovido';
            $title_1 = 'Certificado de educación primaria';
            $title_2 = 'Carta de buena conducta';
            $title_3 = 'Descriptivo final';
        } else {
            $view    = 'PDFS.estudiantesPDF.constancia-de-prosecucion';
            $title_1 = 'Constancia de prosecución';
            $title_2 = 'en el nivel de educación primaria';
            $title_3 = 'Descriptivo final';
        }

        // 🔥 CORRECCIÓN: Determinación de la Fecha basada en el status_periodo del registro
        $data_fecha = FechaEntregaDocumento::first();

        // Obtener el período del registro
        $periodoRegistro = PeriodoEscolar::find($periodoId);

        // 🔥 Si el período está Finalizado, usar fecha actual SIEMPRE
        if ($periodoRegistro && $periodoRegistro->status_periodo === 'Culminado') {
            $carbonFecha = Carbon::now();
        }
        // Si el período está Abierto, usar fecha de entrega (si existe)
        elseif ($periodoRegistro && $periodoRegistro->status_periodo === 'Cerrado' && $data_fecha) {
            $carbonFecha = Carbon::parse($data_fecha->fecha);
        }
        // Para cualquier otro caso (Cerrado, etc.) usar fecha actual
        else {
            $carbonFecha = Carbon::now();
        }

        $dia = $carbonFecha->format('d');
        $mes = $carbonFecha->translatedFormat('F');
        $aho = $carbonFecha->format('Y');

        // Renderizar PDF
        $pdf = Pdf::loadView($view, compact(
            'logoDocumento',
            'estudianteData',
            'institucion',
            'dia',
            'mes',
            'aho',
            'title',
            'title_1',
            'title_2',
            'title_3',
            'mostrarDescriptivo',
            'mostrarCertificado',
            'mostrarBuenaConducta',
            'mostrarConstancia'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Expediente_' . $estudiante->cedula . '.pdf');
    }

    public function ConstanciaMasivaAprobados(Request $request)
    {
        // 1. Obtener los IDs compuestos (ej: ["13-6-1", "61-6-3"])
        $idsCompuestos = $request->ids ? explode(',', $request->ids) : [$request->id_compuesto];
        $periodoId    = $request->periodo_id;
        Carbon::setLocale('es');
        $logo        = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // 2. BUSCAR LOS REGISTROS USANDO LA LLAVE COMPUESTA
        $query = EstudiantePeriodo::query();

        foreach ($idsCompuestos as $composite) {
            $parts = explode('-', $composite);

            if (count($parts) === 3) {
                $query->orWhere(function ($q) use ($parts) {
                    $q->where('estudiante_id', $parts[0])
                        ->where('periodo_id', $parts[1])
                        ->where('grado_id', $parts[2]);
                });
            }
        }

        $registros = $query->with(['estudiante', 'grado', 'periodo'])->get();

        if ($registros->isEmpty()) {
            return redirect()->back()->with('error', 'No se encontraron los registros seleccionados.');
        }

        // 3. PROCESAR DATOS
        $listaEstudiantes = [];
        foreach ($registros as $reg) {
            $listaEstudiantes[] = (object) array_merge($reg->estudiante->toArray(), [
                'grado'           => $reg->grado->nombre_del_grado,
                'seccion'         => $reg->grado->seccion,
                'docente'         => $reg->grado->docente ?? '',
                'apreciacion'     => $reg->apreciacion,
                'periodo_escolar' => $reg->periodo ? $reg->periodo->nombre_periodo : '', // 🔥 Actualizado a nombre_periodo
                'age'             => Carbon::parse($reg->estudiante->fecha_de_nacimiento)->age
            ]);
        }

        // Incremento eficiente de impresiones sin bucle N+1
        foreach ($idsCompuestos as $composite) {
            $parts = explode('-', $composite);
            if (count($parts) === 3) {
                EstudiantePeriodo::where('estudiante_id', $parts[0])
                    ->where('periodo_id', $parts[1])
                    ->where('grado_id', $parts[2])
                    ->increment('contador_impresiones');
            }
        }

        // 4. DETERMINAR VISTA Y VARIABLES
        $esSexto = strpos($registros->first()->grado->nombre_del_grado, '6to') !== false;
        $view    = $esSexto
            ? 'PDFS.estudiantesPDF.constancia-de-promovido-masivo'
            : 'PDFS.estudiantesPDF.constancia-de-prosecucion-masiva';

        $mostrarConstancia    = $request->boolean('constancia');
        $mostrarDescriptivo   = $request->boolean('descriptivo');
        $mostrarCertificado   = $request->boolean('certificado');
        $mostrarBuenaConducta = $request->boolean('buenaConducta');

        $title   = 'Documentos Escolares';
        $title_1 = $esSexto ? 'Certificado de educación primaria' : 'Constancia de prosecución';
        $title_2 = $esSexto ? 'Carta de buena conducta' : 'en el nivel de educación primaria';
        $title_3 = 'Descriptivo final';

       
        // 🔥 CORRECCIÓN: Determinación de la Fecha basada en el status_periodo del registro
        $data_fecha = FechaEntregaDocumento::first();

        // Obtener el período del registro
        $periodoRegistro = PeriodoEscolar::find($periodoId);

        // 🔥 Si el período está Finalizado, usar fecha actual SIEMPRE
        if ($periodoRegistro && $periodoRegistro->status_periodo === 'Culminado') {
            $carbonFecha = Carbon::now();
        }
        // Si el período está Abierto, usar fecha de entrega (si existe)
        elseif ($periodoRegistro && $periodoRegistro->status_periodo === 'Cerrado' && $data_fecha) {
            $carbonFecha = Carbon::parse($data_fecha->fecha);
        }
        // Para cualquier otro caso (Cerrado, etc.) usar fecha actual
        else {
            $carbonFecha = Carbon::now();
        }

        $dia = $carbonFecha->format('d');
        $mes = $carbonFecha->translatedFormat('F');
        $aho = $carbonFecha->format('Y');

        // Renderizar PDF
        $pdf = Pdf::loadView($view, compact(
            'logoDocumento',
            'listaEstudiantes',
            'institucion',
            'dia',
            'mes',
            'aho',
            'title',
            'title_1',
            'title_2',
            'title_3',
            'mostrarDescriptivo',
            'mostrarCertificado',
            'mostrarBuenaConducta',
            'mostrarConstancia'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Expediente_Masivo.pdf');
    }

    //falta este 
    public function ConstanciaAprobadosGraduadosEspecial(int $studentId, $status, $section)
    {
        Carbon::setLocale('es');
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');

        $title = 'Constancias';
        $title_1 = 'Certificado de educación primaria';
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->find(1);

        // 1. Buscamos el estudiante en la tabla de graduados
        $estudiantes = EstudianteGraduado::find($studentId);

        // Si no existe el estudiante, podemos retornar un error o redirigir
        if (!$estudiantes) {
            return back()->with('error', 'Estudiante no encontrado');
        }

        // 2. Definimos la fecha actual (Para graduados suele ser la fecha de impresión)
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');

        // 3. Generamos el PDF con la vista específica que mencionaste
        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-promovido-graduado', compact(
            'logoDocumento',
            'estudiantes',
            'institucion',
            'dia',
            'title',
            'title_1',
            'section',
            'mes',
            'aho'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Certificado_' . $estudiantes->name . '_' . $estudiantes->apellido . '.pdf');
    }

    public function ConstanciaReprobados(Request $request)
    {
        $estudianteId = $request->estudiante_id;
        $periodoId    = $request->periodo_id;
        $gradoId      = $request->grado_id;

        Carbon::setLocale('es');

        $logo            = Logo::first();
        $periodo         = PeriodoEscolar::find($periodoId);
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $title       = 'Certificado de no promovido';
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Buscar el registro
        $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'Registro no encontrado.');
        }

        $estudiante = Estudiante::find($estudianteId);
        $grado      = Grado::find($gradoId);

        // Actualizar contador de impresiones con la clave compuesta
        EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->update([
                'contador_impresiones' => ($registro->contador_impresiones ?? 0) + 1
            ]);

        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'                => $grado->nombre_del_grado,
                'seccion'              => $grado->seccion,
                'docente'              => $grado->docente ?? '',
                'apreciacion'          => $registro->apreciacion,
                'contador_impresiones' => $registro->contador_impresiones ?? 0,
            ]
        );

        // 🔥 CORRECCIÓN: Determinación de la Fecha basada en el status_periodo del registro
        $data_fecha = FechaEntregaDocumento::first();

        // Obtener el período del registro
        $periodoRegistro = PeriodoEscolar::find($periodoId);

        // 🔥 Si el período está Finalizado, usar fecha actual SIEMPRE
        if ($periodoRegistro && $periodoRegistro->status_periodo === 'Culminado') {
            $carbonFecha = Carbon::now();
        }
        // Si el período está Abierto, usar fecha de entrega (si existe)
        elseif ($periodoRegistro && $periodoRegistro->status_periodo === 'Cerrado' && $data_fecha) {
            $carbonFecha = Carbon::parse($data_fecha->fecha);
        }
        // Para cualquier otro caso (Cerrado, etc.) usar fecha actual
        else {
            $carbonFecha = Carbon::now();
        }

        $dia = $carbonFecha->format('d');
        $mes = $carbonFecha->translatedFormat('F');
        $aho = $carbonFecha->format('Y');

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-no-promovido', compact(
            'logoDocumento',
            'estudianteData',
            'institucion',
            'dia',
            'title',
            'mes',
            'aho',
            'periodo_escolar',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");
        $nombreArchivo = 'C-D-N-P_' . ($estudiante->name . '_' . $estudiante->apellido) . '.pdf';

        return $pdf->stream($nombreArchivo);
    }

    public function ListadoReprobados(Request $request)
    {
        $periodoId = $request->periodo_id;

        $logo = Logo::first();
        $periodo = PeriodoEscolar::find($periodoId);
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        // Logos
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Obtener estudiantes reprobados del período seleccionado
        $estudiantes = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Reprobado')
            ->where('estudiante_periodos.status_escolar', '!=', 'Grado Asignado')
            ->where('estudiante_periodos.status_escolar', '!=', 'Retirado del Sistema')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->select(
                'estudiantes.*',
                'estudiante_periodos.apreciacion',
                'estudiante_periodos.actualizado',
                'grados.nombre_del_grado as grado',
                'grados.seccion',
                'grados.docente'
            )
            ->orderBy('grados.nombre_del_grado')
            ->get();

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.listado-reprobados', compact(
            'estudiantes',
            'institucion',
            'periodo_escolar',
            'logoDocumento',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Estudiantes_Reprobados_' . $periodo_escolar . '.pdf');
    }

    public function EstadisticaReprobados(Request $request)
    {
        $periodoId = $request->periodo_id;

        $logo = Logo::first();
        $periodo = PeriodoEscolar::find($periodoId);
        $periodo_escolar = $periodo ? $periodo->nombre_periodo : ''; // 🔥 Actualizado a nombre_periodo

        // Logos
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        // Estadísticas por grado
        $totalporgrado = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Reprobado')
           
            // ->where('estudiante_periodos.status_escolar', '!=', 'Grado Asignado')
            // ->where('estudiante_periodos.status_escolar', '!=', 'Retirado del Sistema')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->select(
                'grados.nombre_del_grado as grado',
                'grados.seccion',
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'M' THEN 1 END) as sexom"),
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'F' THEN 1 END) as sexof"),
                DB::raw("COUNT(*) as total")
            )
            ->groupBy('grados.nombre_del_grado', 'grados.seccion')
            ->orderBy('grados.nombre_del_grado')
            ->get();

        // Totales generales
        $totales = EstudiantePeriodo::where('estudiante_periodos.periodo_id', $periodoId)
            ->where('estudiante_periodos.status', 'Reprobado')
            // ->where('estudiante_periodos.status_escolar', '!=', 'Grado Asignado')
            // ->where('estudiante_periodos.status_escolar', '!=', 'Retirado del Sistema')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->select(
                DB::raw("COUNT(*) as total"),
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'M' THEN 1 END) as sexotm"),
                DB::raw("COUNT(CASE WHEN estudiantes.sexo = 'F' THEN 1 END) as sexotf")
            )
            ->first();

        // Si no hay resultados, crear un objeto con valores en cero
        if (!$totales) {
            $totales = (object) [
                'total'  => 0,
                'sexotm' => 0,
                'sexotf' => 0
            ];
        }

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.estadistica-reprobados', compact(
            'totalporgrado',
            'totales',
            'institucion',
            'periodo_escolar',
            'logoDocumento',
            'logoInstitucion'
        ));

        $pdf->setPaper("Letter", "portrait");

        return $pdf->stream('Estadistica_Reprobados_' . $periodo_escolar . '.pdf');
    }

    public function ConstanciaDeRetiro(Request $request)
    {
        $estudianteId = $request->estudiante_id;
        $periodoId    = $request->periodo_id;
        $gradoId      = $request->grado_id;

        Carbon::setLocale('es');

        $logo        = Logo::first();
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Buscar el registro en estudiante_periodos con status 'Retirado'
        $registro = EstudiantePeriodo::where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->where('status', 'Retirado')
            ->first();

        if (!$registro) {
            return redirect()->back()->with('error', 'Registro de retiro no encontrado.');
        }

        // Obtener datos del estudiante
        $estudiante = Estudiante::find($estudianteId);
        $grado      = Grado::find($gradoId);
        $periodo    = PeriodoEscolar::find($periodoId);

        // Combinar datos para la vista PDF
        $estudianteData = (object) array_merge(
            $estudiante->toArray(),
            [
                'grado'           => $grado->nombre_del_grado,
                'seccion'         => $grado->seccion,
                'docente'         => $grado->docente ?? '',
                'status_escolar'  => $registro->status_escolar,
                'apreciacion'     => $registro->apreciacion,
                'periodo_escolar' => $periodo ? $periodo->nombre_periodo : '', // 🔥 Actualizado a nombre_periodo
            ]
        );

        $dia   = Carbon::now()->format('d');
        $mes   = Carbon::now()->translatedFormat('F');
        $aho   = Carbon::now()->format('Y');
        $title = 'Constancia de retiro';

        $pdf = Pdf::loadView('PDFS.estudiantesPDF.constancia-de-retiro', compact(
            'title',
            'logoDocumento',
            'estudianteData',
            'institucion',
            'dia',
            'mes',
            'aho'
        ));

        $pdf->setPaper("Letter", "portrait");
        $nombreArchivo = 'C-D-R_' . ($estudiante->name . '_' . $estudiante->apellido) . '.pdf';

        return $pdf->stream($nombreArchivo);
    }
}
