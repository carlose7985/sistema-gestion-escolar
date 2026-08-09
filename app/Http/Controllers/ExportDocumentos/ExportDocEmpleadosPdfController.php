<?php

namespace App\Http\Controllers\ExportDocumentos;

use App\Exports\EmpleadosMultiSheetExport;
use App\Http\Controllers\Controller;
use App\Models\AsistenciaEmpleado;
use App\Models\Cargo;
use App\Models\CartaAceptacion;
use App\Models\DestinoEmpleado;
use App\Models\DiaFestivo;
use App\Models\EmpleadoActivo;
use App\Models\HistorialAsistencia;
use App\Models\Institucion;
use App\Models\Logo;
use App\Models\VigilanteGuardia;
use App\Models\WifiAfiliado;
use Barryvdh\DomPDF\Facade\PDF;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExportDocEmpleadosPdfController extends Controller
{
    public function exportDocumentosEmpleado(Request $request)
    {

        $type = $request->query('type'); // Obtén el parámetro 'type'       
        $cargoName = $request->query('cargoName'); // Obtén el parámetro 'cargoName'
        $cargoId = $request->query('cargoId'); // Obtén el parámetro 'cargoId'
        $empleadoId = $request->query('empleadoId');
        $year = $request->query('year');
        $month = $request->query('month');
        $cedula = $request->query('cedula');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');
        $filter = $request->query('filter');
        $tipoPermiso = $request->tipoPermiso;
       // dd($request->query());
        switch ($type) {
            case 'nomina-general-excell':
                return Excel::download(new EmpleadosMultiSheetExport(''), 'Listado General Empleados.xlsx');

            case 'nomina-general-pdf':

                return $this->nominaGeneral();

            case 'nomina-por-cargo-pdf':

                return $this->nominaporCargo($cargoName);

            case 'clasificacion-por-cargo':

                return $this->clasificacionporCargo();

            case 'clasificacion-por-profesion':

                return $this->clasificacionporProfesion();

            case 'listado-de-firmas':

                return $this->listadodeFirmas();

            case 'listado-de-cumpleaneros':

                return $this->listadodeCumpleaneros();

            case 'ficha-del-empleado':

                return $this->fichadelEmpleado($empleadoId);

            case 'carta-de-fiel-cumplimiento':

                return $this->cartadefielCumplimiento($empleadoId);

            case 'solicitud-vacaciones':

                return $this->solicitudVacaciones($empleadoId);

            case 'carta-de-aceptacion':

                return $this->cartadeAceptacion($empleadoId);

            case 'constancia-de-liberacion':

                return $this->cartadeLiberacion($empleadoId);

            case 'reporte-de-asistencias':

                return $this->reportedeasistenciaEmpleadosPdf($cargoId, $month, $year);

            case 'listado-de-asistencias':

                if ($cargoId === 'todos' || $cargoId === null || $cargoId === '') {
                    return $this->listadodeAsistenciasTodos();
                }
                return $this->listadodeAsistencias($cargoId);

            case 'notificaciones':

                return $this->notificacionPdf($empleadoId, $month, $year);





            case 'historial-de-permisos-generales':
                return $this->reporteGeneralPermisosPdf(
                    $tipoPermiso,
                    $request->desde,
                    $request->hasta,
                    $request->filter
                );

            case 'historial-de-permisos':
                return $this->historialIndividualPermisosPdf(
                    $request->empleadoId,
                    $tipoPermiso,
                    $request->desde,
                    $request->hasta,
                    $request->filter
                );






            case 'historial-asistencia-retirados':

                return $this->historialAsistenciaRetirados($cedula, $month, $year);

            case 'historial-asistencia-activos':

                return $this->historialAsistenciaActivos($empleadoId, $month, $year);

            case 'morosos-wifi':

                return $this->morososWifi($month, $year);
        }
    }

    public function morososWifi($month, $year)
    {
        $fechaCorte = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');
        $afiliadosConDeuda = WifiAfiliado::whereHas('pagos', function ($q) use ($fechaCorte) {
            $q->where('estado', 'Pendiente')
                ->where('periodo_pagado', '<=', $fechaCorte);
        })->with(['empleados', 'pagos' => function ($q) use ($fechaCorte) {
            $q->where('estado', 'Pendiente')
                ->where('periodo_pagado', '<=', $fechaCorte)
                ->orderBy('periodo_pagado', 'asc');
        }])->get();
        $pdf = PDF::loadView(
            'pdfs.empleados.morosos-wifi-pdf',
            compact(
                'afiliadosConDeuda',
                'month',
                'year',
                'institucion',
                'logoDocumento',
                'logoInstitucion'
            )
        );
        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream('Morosos WiFi.pdf');
    }
    public function nominaGeneral()
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $empleados = EmpleadoActivo::orderByRaw("FIELD(funcion_en_el_plantel,'Director', 'Subdirector','Coordinador','Docente de aula',
            'Docente Especialista', 'Secretaria(o)','Aseador(a)','Cocinera(o)','Vigilante') ASC")
            ->orderBy('id', 'asc')
            ->get();

        $datosAgrupados = EmpleadoActivo::query()
            ->select('tipo_de_personal', 'sexo', DB::raw('count(*) as total'))
            ->groupBy('tipo_de_personal', 'sexo')
            ->orderBy('sexo')
            ->get();
        // Estructurar los datos para la vista
        $reporte = [];
        $totalesPorFuncion = [];
        $totalesGenerales = ['M' => 0, 'F' => 0, 'Total' => 0];

        foreach ($datosAgrupados as $item) {
            $funcion = $item->tipo_de_personal;
            $sexo = $item->sexo;
            $total = $item->total;
            // Inicializar si no existen
            if (! isset($reporte[$funcion])) {
                $reporte[$funcion] = [
                    'M' => 0,
                    'F' => 0,
                    'Total' => 0,
                ];
            }

            if (! isset($totalesPorFuncion[$funcion])) {
                $totalesPorFuncion[$funcion] = 0;
            }

            $reporte[$funcion][$sexo] += $total;
            $reporte[$funcion]['Total'] += $total;
            $totalesPorFuncion[$funcion] += $total;
            // Totales generales
            $totalesGenerales[$sexo] += $total;
            $totalesGenerales['Total'] += $total;
        }
        $contar_las_funciones = count($reporte);

        $pdf = PDF::loadView('pdfs.empleados.nomina-general-pdf', compact(
            'reporte',
            'totalesPorFuncion',
            'totalesGenerales',
            'empleados',            
            'contar_las_funciones',
            'institucion',
            'logoDocumento',
            'logoInstitucion'
        ));
        $pdf->setPaper('Letter', 'landscape'); // carta vertical

        return $pdf->stream('Nómina general empleados.pdf');  // visualizar
    }

    public function nominaporCargo(string $tipo_de_personal)
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $empleados = EmpleadoActivo::orderByRaw("FIELD(funcion_en_el_plantel,'Director', 'Subdirector','Coordinador','Docente de aula',
         'Docente Especialista', 'Secretaria(o)','Aseador(a)','Cocinera(o)','Vigilante') ASC")
            ->where('tipo_de_personal', $tipo_de_personal)
            ->get();

        $total_empleados = EmpleadoActivo::where('tipo_de_personal', $tipo_de_personal)
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when sexo = 'M' then 1 end) as total_masculino")
            ->selectRaw("count(case when sexo = 'F' then 1 end) as total_femenino")
            ->get();

        $pdf = PDF::loadView('pdfs.empleados.nomina-por-cargo-pdf', compact(
            'empleados',
            'total_empleados',
            'institucion',
            'logoDocumento',
            'logoInstitucion',
            'tipo_de_personal'
        ));
        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream('Nómina general.pdf');  // visualizar

    }

    public function clasificacionporCargo()
    {

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        // Agrupar por funcion_en_el_plantel y sexo

        // AQUI AGRUPA POR FUNCION Y GENERO
        $datosAgrupados = EmpleadoActivo::query()
            ->select('funcion_en_el_plantel', 'sexo', DB::raw('count(*) as total'))
            ->groupBy('funcion_en_el_plantel', 'sexo')
            ->orderBy('sexo')
            ->get();
        // Estructurar los datos para la vista
        $reporte = [];
        $totalesPorFuncion = [];
        $totalesGenerales = ['M' => 0, 'F' => 0, 'Total' => 0];

        foreach ($datosAgrupados as $item) {
            $funcion = $item->funcion_en_el_plantel;
            $sexo = $item->sexo;
            $total = $item->total;
            // Inicializar si no existen
            if (! isset($reporte[$funcion])) {
                $reporte[$funcion] = [
                    'M' => 0,
                    'F' => 0,
                    'Total' => 0,
                ];
            }

            if (! isset($totalesPorFuncion[$funcion])) {
                $totalesPorFuncion[$funcion] = 0;
            }

            $reporte[$funcion][$sexo] += $total;
            $reporte[$funcion]['Total'] += $total;
            $totalesPorFuncion[$funcion] += $total;
            // Totales generales
            $totalesGenerales[$sexo] += $total;
            $totalesGenerales['Total'] += $total;
        }
        $contar_las_funciones = count($reporte);
        // AQUI TERMINA AGRUPAR POR FUNCION Y GENERO

        // AQUI AGRUPA POR CARGO Y GENERO
        $datosAgrupadoscargo = EmpleadoActivo::query()
            ->select('tipo_de_personal', 'sexo', DB::raw('count(*) as total'))
            ->groupBy('tipo_de_personal', 'sexo')
            ->orderBy('sexo')
            ->get();
        // Estructurar los datos para la vista
        $reportes = [];
        $totalesporcargo = [];
        $totalesGeneralesporcargo = ['M' => 0, 'F' => 0, 'Total' => 0];

        foreach ($datosAgrupadoscargo as $item) {
            $funcion = $item->tipo_de_personal;
            $sexo = $item->sexo;
            $total = $item->total;
            // Inicializar si no existen
            if (! isset($reportes[$funcion])) {
                $reportes[$funcion] = [
                    'M' => 0,
                    'F' => 0,
                    'Total' => 0,
                ];
            }

            if (! isset($totalesporcargo[$funcion])) {
                $totalesporcargo[$funcion] = 0;
            }

            $reportes[$funcion][$sexo] += $total;
            $reportes[$funcion]['Total'] += $total;
            $totalesporcargo[$funcion] += $total;
            // Totales generales
            $totalesGeneralesporcargo[$sexo] += $total;
            $totalesGeneralesporcargo['Total'] += $total;
        }
        $contar_los_cargos = count($reportes);
        // AQUI TERMINA AGRUPAR POR CARGO Y GENERO

        // AQUI SE AGRUPA POR CARGO , DEPENDENCIA Y GENERO

        $rawGroupedData = EmpleadoActivo::select(
            'status_del_cargo',
            'tipo_de_personal',
            'sexo',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('status_del_cargo', 'tipo_de_personal', 'sexo')
            ->get();
        // Define the fixed headers/categories for your table
        // $cargos = ['Docente', 'Administrativo', 'Obrero', 'Cenae', 'Vigilante'];
        $tipo_de_cargo = Cargo::all();

        $cargos = $tipo_de_cargo->pluck('nombre_del_cargo');

        $dependencias =  [
            'Nacional',
            'Estadal',
            'Regional',

        ];

        // Initialize the final structured table data
        $structuredData = [];
        // Initialize with zeros for all combinations to ensure all rows/columns appear
        foreach ($dependencias as $grado) {
            $row = ['status_del_cargo' => $grado];
            foreach ($cargos as $cargo) {
                $row["{$cargo}_M"] = 0;
                $row["{$cargo}_F"] = 0;
                $row["{$cargo}_T"] = 0;
            }
            $structuredData[$grado] = $row; // Use status_del_cargo as key for easy access
        }
        // Populate the structured data with counts from the raw grouped data
        foreach ($rawGroupedData as $item) {
            $grado = $item->status_del_cargo;
            $cargo = $item->tipo_de_personal;
            $sexo = $item->sexo;
            $count = $item->count;
            // Ensure the status_del_cargo exists in our predefined list
            if (isset($structuredData[$grado])) {
                // Assign V or H count
                if ($sexo === 'M') {
                    $structuredData[$grado]["{$cargo}_M"] += $count;
                } elseif ($sexo === 'F') {
                    $structuredData[$grado]["{$cargo}_F"] += $count;
                }
                // Always add to the total count for the current cargo
                $structuredData[$grado]["{$cargo}_T"] += $count;
            }
        }
        // Calculate Totals Row
        $totalsRow = ['status_del_cargo' => 'Totales'];
        foreach ($cargos as $cargo) {
            $totalsRow["{$cargo}_M"] = 0;
            $totalsRow["{$cargo}_F"] = 0;
            $totalsRow["{$cargo}_T"] = 0;
        }
        foreach ($structuredData as $row) {
            foreach ($cargos as $cargo) {
                $totalsRow["{$cargo}_M"] += $row["{$cargo}_M"];
                $totalsRow["{$cargo}_F"] += $row["{$cargo}_F"];
                $totalsRow["{$cargo}_T"] += $row["{$cargo}_T"];
            }
        }
        $structuredData['Totales'] = $totalsRow; // Add totals row to the structured data
        // Convert the associative array to a simple indexed array for easy iteration in Blade
        $finalTableData = array_values($structuredData);

        // AQUI TERMINA AGRUPAR POR CARGO, DEPENDENCIA Y GENERO

        $pdf = PDF::loadView('pdfs.empleados.clasificacion-por-cargo-pdf', compact(
            'reporte',
            'reportes',
            'totalesPorFuncion',
            'totalesporcargo',
            'totalesGenerales',
            'totalesGeneralesporcargo',
            'institucion',
            'contar_los_cargos',
            'contar_las_funciones',
            'logoDocumento',
            'logoInstitucion',
            'finalTableData',
            'cargos',
            'rawGroupedData'

        ));
        $pdf->setPaper('Letter', 'landscape'); // carta vertical

        return $pdf->stream('Clasificacón por cargo.pdf');  // visualizar

    }

    public function clasificacionporProfesion()
    {
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $empleado = EmpleadoActivo::orderBy('nombres', 'asc')->get();

        $rawGroupedData = EmpleadoActivo::select(
            'grado_de_intruccion',
            'tipo_de_personal',
            'sexo',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('grado_de_intruccion', 'tipo_de_personal', 'sexo')
            ->get();
        // Define the fixed headers/categories for your table
        // $cargos = ['Docente', 'Administrativo', 'Obrero', 'Cenae', 'Vigilante'];
        $tipo_de_cargo = Cargo::all();

        $cargos = $tipo_de_cargo->pluck('nombre_del_cargo');

        //    dd($cargos);
        $grados_instruccion = [
            'Primaria',
            'Diversificada',
            'Bachiller',
            'Tsu',
            'Profa.',
            'Licda.',
            'Profe.',
            'Licdo.',
            'Especialista',
            'MSc.',
            'Doctor',
            'Doctora',
            'Otras',
        ];
        // Initialize the final structured table data
        $structuredData = [];
        // Initialize with zeros for all combinations to ensure all rows/columns appear
        foreach ($grados_instruccion as $grado) {
            $row = ['grado_de_intruccion' => $grado];
            foreach ($cargos as $cargo) {
                $row["{$cargo}_M"] = 0;
                $row["{$cargo}_F"] = 0;
                $row["{$cargo}_T"] = 0;
            }
            $structuredData[$grado] = $row; // Use grado_de_intruccion as key for easy access
        }
        // Populate the structured data with counts from the raw grouped data
        foreach ($rawGroupedData as $item) {
            $grado = $item->grado_de_intruccion;
            $cargo = $item->tipo_de_personal;
            $sexo = $item->sexo;
            $count = $item->count;
            // Ensure the grado_de_intruccion exists in our predefined list
            if (isset($structuredData[$grado])) {
                // Assign V or H count
                if ($sexo === 'M') {
                    $structuredData[$grado]["{$cargo}_M"] += $count;
                } elseif ($sexo === 'F') {
                    $structuredData[$grado]["{$cargo}_F"] += $count;
                }
                // Always add to the total count for the current cargo
                $structuredData[$grado]["{$cargo}_T"] += $count;
            }
        }
        // Calculate Totals Row
        $totalsRow = ['grado_de_intruccion' => 'Totales'];
        foreach ($cargos as $cargo) {
            $totalsRow["{$cargo}_M"] = 0;
            $totalsRow["{$cargo}_F"] = 0;
            $totalsRow["{$cargo}_T"] = 0;
        }
        foreach ($structuredData as $row) {
            foreach ($cargos as $cargo) {
                $totalsRow["{$cargo}_M"] += $row["{$cargo}_M"];
                $totalsRow["{$cargo}_F"] += $row["{$cargo}_F"];
                $totalsRow["{$cargo}_T"] += $row["{$cargo}_T"];
            }
        }
        $structuredData['Totales'] = $totalsRow; // Add totals row to the structured data
        // Convert the associative array to a simple indexed array for easy iteration in Blade
        $finalTableData = array_values($structuredData);

        $pdf = PDF::loadView('pdfs.empleados.clasificacion-por-grado-de-intruccion-pdf', compact(

            'institucion',
            'empleado',
            'logoDocumento',
            'logoInstitucion',
            'finalTableData',
            'cargos',
            'grados_instruccion'

        ));
        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream('Clasificación por grado de intrucción.pdf');  // visualizar

    }

    public function listadodeFirmas()
    {
        Carbon::setLocale('es');
        $suma = 1;
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');


        $empleado = EmpleadoActivo::orderByRaw("FIELD(funcion_en_el_plantel, 'Director', 'Subdirector','Coordinador','Docente de aula',
              'Docente Especialista', 'Secretaria(o)','Aseador(a)','Cocinera(o)','Vigilante') ASC")->get();
        $meses = Carbon::now()->format('m');
        $mes = Carbon::now()->translatedFormat('F');

        $pdf = PDF::loadView('pdfs.empleados.listado-de-firmas-pdf', compact('empleado', 'suma', 'mes', 'logoDocumento', 'logoInstitucion'));
        $pdf->setPaper('Letter', 'portrait');

        return $pdf->stream('Listado de firmas' . '.pdf');  // visualizar

    }

    public function listadodeCumpleaneros()
    {
        $employees = EmpleadoActivo::all();
        // Agrupar y ordenar los empleados
        $groupedEmployees = $employees->groupBy(function ($employee) {
            return \Carbon\Carbon::parse($employee->fecha_de_nacimiento)->format('m'); // Agrupar por mes (número)
        })->sortKeys() // Ordenar por mes de nacimiento (clave del grupo)
            ->map(function ($employeesInMonth) {
                return $employeesInMonth->sortBy(function ($employee) {
                    return \Carbon\Carbon::parse($employee->fecha_de_nacimiento)->format('d'); // Ordenar por día dentro de cada mes
                });
            });
        // Si necesitas los meses con nombres para la vista
        $mess = [
            '01' => 'Enero',
            '02' => 'Febrero',
            '03' => 'Marzo',
            '04' => 'Abril',
            '05' => 'Mayo',
            '06' => 'Junio',
            '07' => 'Julio',
            '08' => 'Agosto',
            '09' => 'Septiembre',
            '10' => 'Octubre',
            '11' => 'Noviembre',
            '12' => 'Diciembre',
        ];

        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');

        $pdf = PDF::loadView('pdfs.empleados.listado-cumpleaneros-pdf', compact(
            'groupedEmployees',
            'mess',
            'logoDocumento'
        ));
        $pdf->setPaper('Letter', 'portrait');

        return $pdf->stream('Cumpleañeros por mes.pdf');  // visualizar

    }

    public function fichadelEmpleado(int $empleadoId)
    {

        $empleado = EmpleadoActivo::find($empleadoId);

        $pdf = PDF::loadView('pdfs.empleados.ficha-del-empleado-pdf', compact('empleado'));
        $pdf->setPaper('Letter', 'portrait'); // Configurar orientación apaisada

        return $pdf->stream('Ficha' . ' ' . $empleado->nombres . '.pdf');  // visualizar
    }

    public function cartadefielCumplimiento(int $empleadoId)
    {
        Carbon::setLocale('es');
        $institucion = Institucion::find(1);
        $empleado = EmpleadoActivo::find($empleadoId);
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        $title = 'Constancia de cabal y fiel cumplimiento';
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');

        $pdf = PDF::loadView('pdfs.empleados.carta-de-fiel-cumplimiento-pdf', compact('title', 'empleado', 'institucion', 'dia', 'mes', 'aho', 'logoDocumento'));
        $pdf->setPaper('Letter', 'portrait'); // Configurar orientación apaisada

        return $pdf->stream('Carta de fiel cumplimiento' . ' ' . $empleado->nombres . '.pdf');  // visualizar
    }


    public function solicitudVacaciones(int $empleadoId)
    {
        Carbon::setLocale('es');
        $institucion = Institucion::find(1);
        $empleado = EmpleadoActivo::find($empleadoId);
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        $title = 'Solicitud de Vacaciones';
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');

        $pdf = PDF::loadView('pdfs.empleados.solicitud-vacaciones-pdf', compact('title', 'empleado', 'institucion', 'dia', 'mes', 'aho', 'logoDocumento'));
        $pdf->setPaper('Letter', 'portrait'); // Configurar orientación apaisada

        return $pdf->stream('Solicitud de Vacaciones' . ' ' . $empleado->nombres . '.pdf');  // visualizar
    }



    public function cartadeAceptacion(int $empleadoId)
    {
        Carbon::setLocale('es');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->find(1);
        $logo = Logo::first();
        $cartadeaceptacion = CartaAceptacion::find($empleadoId);
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');
        $title = 'Carta de aceptación';
        $pdf = PDF::loadView('pdfs.empleados.carta-de-aceptacion-pdf', compact('title', 'cartadeaceptacion', 'institucion', 'logoDocumento', 'dia', 'mes', 'aho'));
        $pdf->setPaper('Letter', 'portrait');
        return $pdf->stream('carta-de-aceptacion-report.pdf');
    }

    public function cartadeLiberacion(int $empleadoId)
    {
        Carbon::setLocale('es');
        $institucion = Institucion::find(1);
        $empleado = EmpleadoActivo::find($empleadoId);

        // --- NUEVA LÓGICA: Buscar el destino ---
        $registroDestino = DestinoEmpleado::where('empleado_id', $empleadoId)->first();
        // Si no existe, enviamos una línea punteada o un texto por defecto
        $destino = $registroDestino ? $registroDestino->destino : '__________________________';

        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('img/noImgdoc.jpeg');

        $title = 'Constancia de liberación';
        $dia = Carbon::now()->format('d');
        $mes = Carbon::now()->translatedFormat('F');
        $aho = Carbon::now()->format('Y');
        $mesexacto = Carbon::now()->format('d-m-Y');

        // Añadimos 'destino' al compact
        $pdf = PDF::loadView('pdfs.empleados.carta-de-liberacion-pdf', compact(
            'title',
            'empleado',
            'institucion',
            'dia',
            'mes',
            'mesexacto',
            'aho',
            'logoDocumento',
            'destino' // <--- Pasamos la variable a la vista
        ));

        $pdf->setPaper('Letter', 'portrait');

        return $pdf->stream('Carta de liberacion' . ' ' . $empleado->nombres . '.pdf');
    }

    public function historialAsistenciaActivos(int $empleadoId, string $month, int $year)
    {
        Carbon::setLocale('es');
        $fecha_actual = Carbon::now()->format('d-m-Y');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');
        // 1. Array de meses
        $mesesIds = array_map('intval', explode(',', $month));

        // ---------------------------------------------------------
        // 2. Datos del Empleado
        // ---------------------------------------------------------
        $empleado = EmpleadoActivo::find($empleadoId);

        if (!$empleado) {
            return back()->with('error', 'No se encontró el empleado activo.');
        }

        $nombreCompleto = $empleado->nombres . ' ' . $empleado->apellidos;
        $cedula = $empleado->cedula;

        // ---------------------------------------------------------
        // 3. Obtener Datos (Asistencias y Festivos)
        // ---------------------------------------------------------

        // A) ASISTENCIAS
        $consultaAsis = AsistenciaEmpleado::where('empleado_id', $empleadoId)
            ->whereYear('fecha', $year)
            ->whereIn(DB::raw('MONTH(fecha)'), $mesesIds)
            ->get();

        // Mapeo: ['2025-10-20' => 'Asistio']
        $asistenciasMap = $consultaAsis->mapWithKeys(function ($item) {
            return [Carbon::parse($item->fecha)->format('Y-m-d') => $item->status];
        });

        // B) FESTIVOS (Nueva Lógica)
        // Asumimos que el modelo se llama 'Festivos' y el campo 'fecha'
        $consultaFestivos = DiaFestivo::whereYear('fecha', $year)
            ->whereIn(DB::raw('MONTH(fecha)'), $mesesIds)
            ->get();

        // Creamos un array simple con las fechas festivas: ['2025-10-12', '2025-12-25']
        $festivosArray = $consultaFestivos->map(function ($item) {
            return Carbon::parse($item->fecha)->format('Y-m-d');
        })->toArray();

        // ---------------------------------------------------------
        // 4. Construir estructura
        // ---------------------------------------------------------
        $reporteData = [];

        foreach ($mesesIds as $mes) {
            $fechaInicio = Carbon::createFromDate($year, $mes, 1);

            $periodo = CarbonPeriod::create(
                $fechaInicio->copy()->startOfMonth(),
                $fechaInicio->copy()->endOfMonth()
            );

            $diasDelMes = [];

            // Agregamos 'DF' a los totales
            $totales = [
                'A' => 0,
                'F' => 0,
                'P' => 0,
                'N' => 0,
                'DF' => 0 // Nuevo total para Días Festivos
            ];

            foreach ($periodo as $date) {
                // Excluir fines de semana
                if ($date->isWeekend()) {
                    continue;
                }

                $fechaStr = $date->format('Y-m-d');

                // 1. Buscamos Asistencia
                $statusDB = $asistenciasMap[$fechaStr] ?? null;

                $letra = '-';
                $clase = ''; // Clase por defecto (vacío o asteriscos)

                if ($statusDB) {
                    // --- CASO 1: EXISTE REGISTRO DE ASISTENCIA ---
                    $status = trim(strtolower($statusDB));

                    if ($status == 'asistio') {
                        $letra = 'A';
                        $clase = 'badge-green';
                        $totales['A']++;
                    } elseif ($status == 'falto') {
                        $letra = 'F';
                        $clase = 'badge-red';
                        $totales['F']++;
                    } elseif ($status == 'permiso') {
                        $letra = 'P';
                        $clase = 'badge-yellow';
                        $totales['P']++;
                    } elseif ($status == 'nuevo ingreso') {
                        $letra = 'N';
                        $clase = 'badge-gray';
                        $totales['N']++;
                    }
                } else {
                    // --- CASO 2: NO HAY ASISTENCIA, VERIFICAR SI ES FESTIVO ---
                    // in_array verifica si $fechaStr existe dentro de $festivosArray
                    if (in_array($fechaStr, $festivosArray)) {
                        $letra = 'DF';
                        $clase = 'badge-purple'; // Asigna un color distintivo
                        $totales['DF']++;
                    }
                }

                $diasDelMes[] = [
                    'num_dia'     => $date->format('d'),
                    'nombre_dia'  => ucfirst($date->locale('es')->minDayName),
                    'letra'       => $letra,
                    'clase'       => $clase
                ];
            }

            $reporteData[] = [
                'nombre_mes' => ucfirst($fechaInicio->locale('es')->monthName),
                'dias'       => $diasDelMes,
                'totales'    => $totales
            ];
        }

        // ---------------------------------------------------------
        // 5. Generar PDF
        // ---------------------------------------------------------
        $pdf = PDF::loadView('pdfs.empleados.historial-de-asistencias', compact(
            'reporteData',
            'nombreCompleto',
            'institucion',
            'logoInstitucion',
            'logoDocumento',
            'cedula',
            'year',
            'fecha_actual'
        ));

        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream("Reporte_Matricial_{$cedula}.pdf");
    }

    public function historialAsistenciaRetirados(int $cedula, string $month, int $year)
    {
        Carbon::setLocale('es');
        $fecha_actual = Carbon::now()->format('m-d-Y');
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        // 1. Convertimos la string "1,2,3" a un array [1, 2, 3]
        $mesesIds = array_map('intval', explode(',', $month));

        // 2. Datos del Empleado (Encabezado)
        $empleado = HistorialAsistencia::where('cedula', $cedula)->first();

        if (!$empleado) {
            return response()->json(['message' => 'El empleado con esa cédula no tiene historial de asistencias registradas.'], 404);
        }

        $nombreCompleto = $empleado->nombres . ' ' . $empleado->apellidos;

        // ---------------------------------------------------------
        // 3. Obtener registros de la BD
        // ---------------------------------------------------------

        // A) ASISTENCIAS (Tu lógica original intacta)
        $registrosDB = HistorialAsistencia::where('cedula', $cedula)
            ->whereYear('fecha_de_asistencia', $year)
            ->whereIn(DB::raw('MONTH(fecha_de_asistencia)'), $mesesIds)
            ->get()
            ->groupBy(function ($d) {
                return Carbon::parse($d->fecha_de_asistencia)->format('m');
            });

        // B) FESTIVOS (Agregado nuevo)
        // Recuperamos los días festivos para comparar después
        $festivosArray = DiaFestivo::whereYear('fecha', $year)
            ->whereIn(DB::raw('MONTH(fecha)'), $mesesIds)
            ->get()
            ->map(function ($item) {
                return Carbon::parse($item->fecha)->format('Y-m-d');
            })->toArray();

        // ---------------------------------------------------------
        // 4. Construir estructura
        // ---------------------------------------------------------
        $reporteData = [];

        foreach ($mesesIds as $mes) {
            $fechaInicio = Carbon::createFromDate($year, $mes, 1);

            $periodo = CarbonPeriod::create(
                $fechaInicio->copy()->startOfMonth(),
                $fechaInicio->copy()->endOfMonth()
            );

            $diasDelMes = [];

            // AGREGA 'DF' AL ARRAY DE TOTALES
            $totales = [
                'A' => 0, // Asistio
                'F' => 0, // Falto
                'P' => 0, // Permiso
                'N' => 0, // Nuevo Ingreso
                'DF' => 0  // <--- Nuevo contador Festivos
            ];

            foreach ($periodo as $date) {
                // Excluir fines de semana
                if ($date->isWeekend()) {
                    continue;
                }

                $fechaStr = $date->format('Y-m-d');
                $mesKey = str_pad($mes, 2, '0', STR_PAD_LEFT);

                // Búsqueda original manteniendo tu estructura
                // NOTA: Asegúrate que 'fecha_de_asistencia' en BD no tenga horas, 
                // o firstWhere podría fallar al comparar con 'Y-m-d'.
                $registroDia = isset($registrosDB[$mesKey])
                    ? $registrosDB[$mesKey]->firstWhere('fecha_de_asistencia', $fechaStr)
                    : null;

                $letra = '-';
                $clase = '';

                if ($registroDia) {
                    // --- HAY REGISTRO EN HISTORIAL ---
                    $status = trim(strtolower($registroDia->status_de_asistencia));

                    if ($status == 'asistio') {
                        $letra = 'A';
                        $clase = 'badge-green';
                        $totales['A']++;
                    } elseif ($status == 'falto') {
                        $letra = 'F';
                        $clase = 'badge-red';
                        $totales['F']++;
                    } elseif ($status == 'permiso') {
                        $letra = 'P';
                        $clase = 'badge-yellow';
                        $totales['P']++;
                    }
                    // Si en esta tabla manejas 'nuevo ingreso', agrégalo aquí
                } else {
                    // --- NO HAY REGISTRO: VERIFICAR SI ES FESTIVO ---
                    if (in_array($fechaStr, $festivosArray)) {
                        $letra = 'DF';
                        $clase = 'badge-purple'; // Asegúrate de tener este estilo CSS
                        $totales['DF']++;
                    }
                }

                $diasDelMes[] = [
                    'num_dia'     => $date->format('d'),
                    'nombre_dia'  => ucfirst($date->locale('es')->minDayName),
                    'letra'       => $letra,
                    'clase'       => $clase
                ];
            }

            $reporteData[] = [
                'nombre_mes' => ucfirst($fechaInicio->locale('es')->monthName),
                'dias'       => $diasDelMes,
                'totales'    => $totales
            ];
        }

        // 5. Generar PDF
        $pdf = PDF::loadView('pdfs.empleados.historial-de-asistencias', compact(
            'reporteData',
            'nombreCompleto',
            'cedula',
            'year',
            'institucion',
            'logoDocumento',
            'logoInstitucion',
            'fecha_actual'
        ));

        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream("Reporte_Matricial_{$cedula}.pdf");
    }

    public function reportedeasistenciaEmpleadosPdf(int $cargoId, string $month, int $year)
    {
        $year = (int)$year;
        $cargo = Cargo::findOrFail($cargoId);
        $nombre_del_cargo = $cargo->nombre_del_cargo;

        // Esta variable se usa en la vista para el título
        $tipo_de_personal = $nombre_del_cargo;

        // Validaciones generales de existencia de datos
        $asistencia_existe = AsistenciaEmpleado::where('tipo_de_cargo', $nombre_del_cargo)->exists();

        $fecha_existe = AsistenciaEmpleado::where('tipo_de_cargo', $nombre_del_cargo)
            ->whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->exists();

        // Validar mes
        if (!is_numeric($month) || $month < 1 || $month > 12) {
            $month = Carbon::now()->month;
        }

        // Obtener todas las fechas con asistencia del mes
        $dates = AsistenciaEmpleado::whereMonth('fecha', $month)
            ->whereYear('fecha', $year)
            ->distinct()
            ->orderBy('fecha', 'asc')
            ->pluck('fecha')
            ->map(function ($date) {
                return Carbon::parse($date);
            });

        // ---------------------------------------------------------
        // 1. LOGICA DE FILTRADO DE EMPLEADOS
        // ---------------------------------------------------------

        $query = EmpleadoActivo::query();

        // Verificamos si es un reporte de "Vigilante"
        if (stripos($nombre_del_cargo, 'Vigilante') !== false) {

            // CASO VIGILANTES:
            // Buscamos a todos los que FUNCIONAN como vigilantes (sin importar si son obreros o administrativos)
            $query->where('funcion_en_el_plantel', 'Vigilante')
                ->orderBy('nombres', 'asc');
        } else {

            // CASO OTROS CARGOS (Docente, Obrero, etc.):
            // Filtramos por tipo de personal, pero EXCLUIMOS a los que trabajan de vigilantes.
            $query->where('tipo_de_personal', $nombre_del_cargo)
                ->where('funcion_en_el_plantel', '!=', 'Vigilante')
                ->orderByRaw("FIELD(funcion_en_el_plantel, 'Director', 'Subdirector','Coordinador',
                 'Docente Especialista','Docente de aula','Secretaria(o)','Aseador(a)','Cocinera(o)' ) ASC");
        }

        $empleados = $query->get();

        // ---------------------------------------------------------
        // 2. PREPARACIÓN DE DATOS
        // ---------------------------------------------------------

        $attendanceData = [];
        foreach ($empleados as $empleado) {

            // --- Lógica para la Inicial (Ej: Juan Perez (O) ) ---
            $inicial_cargo = '';
            // Solo si es reporte de Vigilantes, sacamos la inicial de su tipo real de personal
            if (stripos($nombre_del_cargo, 'Vigilante') !== false) {
                $inicial_cargo = strtoupper(substr($empleado->tipo_de_personal, 0, 1));
            }
            // ----------------------------------------------------

            $employeeAttendance = [];
            $totalAsistencias = 0;
            $totalFaltas = 0;
            $totalPermisos = 0;

            // Obtener asistencias del empleado en el mes
            $employeeMonthlyAttendance = AsistenciaEmpleado::where('empleado_id', $empleado->id)
                ->whereMonth('fecha', $month)
                ->whereYear('fecha', $year)
                ->get()
                ->keyBy(function ($item) {
                    return Carbon::parse($item->fecha)->toDateString();
                });

            foreach ($dates as $date) {
                $status = $employeeMonthlyAttendance->get($date->toDateString());

                if ($status) {
                    $employeeAttendance[$date->toDateString()] = $status->status;

                    if ($status->status === 'Asistio') {
                        $totalAsistencias++;
                    } elseif ($status->status === 'Falto') {
                        $totalFaltas++;
                    } elseif ($status->status === 'Permiso') {
                        $totalPermisos++;
                    }
                } else {
                    $employeeAttendance[$date->toDateString()] = '';
                }
            }

            $attendanceData[] = [
                'empleado' => $empleado,
                'inicial_cargo' => $inicial_cargo, // <--- Enviamos la inicial a la vista
                'attendance' => $employeeAttendance,
                'totals' => [
                    'asistio' => $totalAsistencias,
                    'falto' => $totalFaltas,
                    'permiso' => $totalPermisos,
                ],
            ];
        }

        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        $logoDocumento = $logo ? Storage::disk('public')->path($logo->logo_documentos) : public_path('assets/img/noImgdoc.jpeg');

        // Convertir booleanos a enteros para la vista
        $asistencia_existe_int = $asistencia_existe ? 1 : 0;
        $fecha_existe_int = $fecha_existe ? 1 : 0;

        $pdf = PDF::loadView('pdfs.empleados.reporte-de-asistencias-empleados-pdf', compact(
            'dates',
            'attendanceData',
            'year',
            'month',
            'tipo_de_personal',
            'institucion',
            'logoDocumento',
            'asistencia_existe_int',
            'fecha_existe_int'
        ));

        $pdf->setPaper("Letter", "landscape");

        return $pdf->stream('Control de asistencia' . ' ' . $nombre_del_cargo . ' ' . $year . ' ' . $month . '.pdf');
    }

    public function listadodeAsistenciasTodos()
    {
        // Obtener todos los cargos que tienen empleados activos
        $cargos = EmpleadoActivo::select('tipo_de_personal')
            ->whereNotNull('tipo_de_personal')
            ->where('tipo_de_personal', '!=', '')
            ->distinct()
            ->orderBy('tipo_de_personal')
            ->pluck('tipo_de_personal');

        // Si no hay cargos, mostrar mensaje
        if ($cargos->isEmpty()) {
            return back()->with('error', 'No hay cargos registrados con empleados');
        }

        $dataPorCargo = [];

        foreach ($cargos as $cargoName) {
            // Determinar si es vigilante
            $esVigilante = stripos($cargoName, 'Vigilante') !== false;

            if ($esVigilante) {
                // Lógica para vigilantes
                $registros = VigilanteGuardia::with('empleado')->get();
                $data = $registros->groupBy('dias_guardia');
            } else {
                // Lógica para otros cargos
                $data = EmpleadoActivo::where('tipo_de_personal', $cargoName)
                    ->where('funcion_en_el_plantel', '!=', 'Vigilante')
                    ->orderByRaw("FIELD(funcion_en_el_plantel, 
                    'Director', 
                    'Subdirector', 
                    'Coordinador', 
                    'Docente Especialista', 
                    'Docente de aula', 
                    'Secretaria(o)', 
                    'Aseador(a)', 
                    'Cocinera(o)',
                    'Sin Asignacion') ASC")
                    ->orderBy('id', 'asc')
                    ->select('id', 'nombres', 'apellidos', 'situacion_laboral', 'cedula')
                    ->get();
            }

            // Solo agregar si hay datos
            if (($esVigilante && $data->isNotEmpty()) || (!$esVigilante && $data->count() > 0)) {
                $dataPorCargo[] = [
                    'cargoName' => $cargoName,
                    'data' => $data,
                    'esVigilante' => $esVigilante
                ];
            }
        }

        // Generar PDF con todos los cargos
        $pdf = PDF::loadView('pdfs.empleados.listado-de-asistencias-empleados-todos-pdf', compact('dataPorCargo'));
        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Listado_General_Asistencias_Todos_Cargos.pdf');
    }


    public function listadodeAsistencias(int $cargoId)
    {
        $cargo = Cargo::findOrFail($cargoId);
        $cargoName = $cargo->nombre_del_cargo;

        // Variables para la vista
        $esVigilante = false;
        $data = []; // Aquí guardaremos los empleados o los grupos

        // 1. LÓGICA PARA VIGILANTES
        if (stripos($cargoName, 'Vigilante') !== false) {
            $esVigilante = true;

            // Obtenemos los registros de la tabla de guardias cargando la relación con el empleado
            // Ordenamos primero para intentar mantener un orden lógico si es posible
            $registros = VigilanteGuardia::with('empleado') // Asumiendo relación 'empleado' en el modelo Vigilantesguardia
                ->get();

            // Agrupamos por la columna 'dias_guardia' (Ej: "Lunes", "Martes", "Fin de Semana")
            $data = $registros->groupBy('dias_guardia');

            // Opcional: Ordenar los días si es necesario (Lunes, Martes, etc.)
            // $data = $data->sortBy(...); 

        } else {
            // 2. LÓGICA PARA OTROS CARGOS (Docentes, Obreros, etc.)
            $esVigilante = false;

            $data = EmpleadoActivo::where('tipo_de_personal', $cargoName)
                ->where('funcion_en_el_plantel', '!=', 'Vigilante')
                ->orderByRaw("FIELD(funcion_en_el_plantel, 
            'Director', 
            'Subdirector', 
            'Coordinador', 
            'Docente Especialista', 
            'Docente de aula', 
            'Secretaria(o)', 
            'Aseador(a)', 
            'Cocinera(o)',
            'Sin Asignacion') ASC") // <--- COMILLA AGREGADA AQUÍ
                ->orderBy('id', 'asc')
                ->select('id', 'nombres', 'apellidos', 'situacion_laboral', 'cedula')
                ->get();
        }

        $pdf = PDF::loadView('pdfs.empleados.listado-de-asistencias-empleados-pdf', compact('data', 'cargoName', 'esVigilante'));

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream('Listado Guia ' . $cargoName . '.pdf');
    }

    public function notificacionPdf(int $id, string $mes_buscar_asistencias, int $year_buscar)
    {

        Carbon::setLocale('es');

        // Obtenemos todas las asistencias del mes y año de una sola vez
        $todasLasAsistencias = AsistenciaEmpleado::where('empleado_id', $id)
            ->whereMonth('fecha', $mes_buscar_asistencias)
            ->whereYear('fecha', $year_buscar)
            ->get();

        $asistencia_existe = $todasLasAsistencias->count();

        // Variables comunes (Institución y Logo)
        $institucion = Institucion::orderBy('nombre_de_la_institucion', 'asc')->get();
        $logo = Logo::first();
        // Lógica para Logo Documento (Header)
        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        // Lógica para Logo Institución (Ej. en otro lugar del PDF)
        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        if ($asistencia_existe == 0) {
            $pdf = PDF::loadView('pdfs.empleados.notificaciones-empleados-pdf', compact(
                'asistencia_existe',
                'institucion',
                'logoDocumento',
                'logoInstitucion'
            ));
        } else {
            // Filtramos en memoria para no volver a consultar la DB (Alta Velocidad)
            $fechasAsistencias = $todasLasAsistencias->where('status', 'Asistio')->unique('fecha')->values();
            $fechasFaltas = $todasLasAsistencias->where('status', 'Falto')->unique('fecha')->values();
            $fechasPermiso = $todasLasAsistencias->where('status', 'Permiso')->unique('fecha')->values();

            $asistencias = $fechasAsistencias->count();
            $faltas = $fechasFaltas->count();
            $permisos = $fechasPermiso->count();
            $totalAsistencias = $asistencia_existe;

            $empleado = EmpleadoActivo::select('id', 'nombres', 'apellidos', 'cedula', 'sexo')->findOrFail($id);

            // Datos para el PDF
            $fechaExacta = Carbon::now()->format('d-m-Y');
            $dia = Carbon::now()->format('d');
            $meses = Carbon::parse("$year_buscar-$mes_buscar_asistencias-01")->translatedFormat('F');
            $aho = $year_buscar; // Usamos el año buscado

            // Obtenemos una fecha de referencia para el mes (la primera que aparezca)
            $primerRegistro = $todasLasAsistencias->first();
            $mes = $primerRegistro ? $primerRegistro->fecha : Carbon::now();

            $pdf = PDF::loadView('pdfs.empleados.notificaciones-empleados-pdf', compact(
                'empleado',
                'faltas',
                'asistencias',
                'permisos',
                'fechaExacta',
                'dia',
                'mes',
                'meses',
                'aho',
                'totalAsistencias',
                'fechasFaltas',
                'fechasAsistencias',
                'logoInstitucion',
                'fechasPermiso',
                'institucion',
                'asistencia_existe',
                'logoDocumento'
            ));
        }

        $pdf->setPaper("Letter", "portrait");
        return $pdf->stream("Notificacion_{$id}.pdf");
    }



    // --- REPORTE GENERAL (Varios empleados) ---
    public function reporteGeneralPermisosPdf(string $tipo, string $desde, string $hasta, string $filter )
    {
        // 1. Iniciamos la consulta en la tabla unificada 'permisos'
        $query = \App\Models\Permiso::with('empleado')
            ->where('tipo', $tipo) // Filtramos por Eventual o Vacacion
            ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

        // 2. Aplicamos el filtro de estado si es 'Activo'
        if ($filter === 'Activo') {
            $query->where('status', 'Activo');
        }

        $permisosActivosConsolidados = $query->orderBy('fecha_de_inicio', 'asc')->get();
        $institucion = Institucion::first();

        // Reutilizamos la vista, pasando el $tipo para el título del PDF
        $pdf = PDF::loadView('pdfs.empleados.historial-general-permisos-activos-pdf', compact(
            'permisosActivosConsolidados',
            'institucion',
            'desde',
            'hasta',
            'tipo',
           
        ));

        $pdf->setPaper('Letter', 'landscape');

        return $pdf->stream("reporte-general-{$tipo}.pdf");
    }

    // --- HISTORIAL INDIVIDUAL (Un solo empleado) ---
    public function historialIndividualPermisosPdf(int $empleadoId, string $tipo, string $desde, string $hasta, string $filter)
    {
        $empleado = EmpleadoActivo::findOrFail($empleadoId);

        // 1. Buscamos en la tabla unificada filtrando por empleado y tipo
        $query = \App\Models\Permiso::where('empleado_id', $empleadoId)
            ->where('tipo', $tipo)
            ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

        if ($filter === 'Activo') {
            $query->where('status', 'Activo');
        }

        $permisos = $query->orderBy('fecha_de_inicio', 'desc')->get();
        $institucion = Institucion::first();

        $pdf = PDF::loadView('pdfs.empleados.historial-de-permisos-pdf', compact(
            'permisos',
            'institucion',
            'empleado',
            'desde',
            'hasta',
            'tipo',
           
        ));

        $pdf->setPaper('Letter', 'portrait');

        $filename = "Historial_{$tipo}_" . str_replace(' ', '_', $empleado->apellidos) . ".pdf";
        return $pdf->stream($filename);
    }






    // public function reporteGeneralpermisoseventualesActivosPdf(string $desde, string $hasta, string $filter)
    // {
    //     // Iniciamos la consulta base
    //     $query = PermisoEventual::with('empleados')
    //         ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

    //     // Aplicamos el filtro de estado si es 'Activo'
    //     if ($filter === 'Activo') {
    //         $query->where('status', 'Activo');
    //     }

    //     // Ejecutamos la consulta
    //     $permisosActivosConsolidados = $query->orderBy('fecha_de_inicio', 'asc')->get();

    //     $institucion = Institucion::first();

    //     $pdf = PDF::loadView('pdfs.empleados.historial-general-permisos-activos-pdf', compact(
    //         'permisosActivosConsolidados',
    //         'institucion',
    //         'desde',
    //         'hasta'
    //     ));

    //     $pdf->setPaper('Letter', 'landscape');

    //     return $pdf->stream('reporte-general-permisos-eventuales.pdf');
    // }

    // public function historialPermisos(int $empleadoId, string $desde, string $hasta, string $filter)
    // {
    //     $empleado = EmpleadoActivo::findOrFail($empleadoId);

    //     // Iniciamos la consulta
    //     $query = $empleado->permisosEventual()
    //         ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

    //     // Aplicamos el filtro de estado si es necesario
    //     if ($filter === 'Activo') {
    //         $query->where('status', 'Activo');
    //     }

    //     // Ejecutamos la consulta
    //     $permisos = $query->orderBy('fecha_de_inicio', 'desc')->get();

    //     $institucion = Institucion::first();

    //     $pdf = PDF::loadView('pdfs.empleados.historial-de-permisos-pdf', compact(
    //         'permisos',
    //         'institucion',
    //         'empleado',
    //         'desde',
    //         'hasta'
    //     ));

    //     $pdf->setPaper('Letter', 'portrait');

    //     $filename = "Historial_" . str_replace(' ', '_', $empleado->apellidos) . ".pdf";
    //     return $pdf->stream($filename);
    // }

    // public function historialVacaciones(int $empleadoId, string $desde, string $hasta, string $filter)
    // {
    //     $empleado = EmpleadoActivo::findOrFail($empleadoId);

    //     // Iniciamos la consulta base
    //     $query = $empleado->permisosVacacion()
    //         ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

    //     // Aplicamos el filtro si es 'Activo'
    //     if ($filter === 'Activo') {
    //         $query->where('status', 'Activo');
    //     }

    //     $permisos = $query->orderBy('fecha_de_inicio', 'desc')->get();

    //     $institucion = Institucion::first();

    //     $pdf = PDF::loadView('pdfs.empleados.historial-de-permisos-pdf', compact(
    //         'permisos',
    //         'institucion',
    //         'empleado',
    //         'desde',
    //         'hasta'
    //     ));

    //     $pdf->setPaper('Letter', 'portrait');

    //     $filename = "Historial_" . str_replace(' ', '_', $empleado->apellidos) . ".pdf";
    //     return $pdf->stream($filename);
    // }

    // public function reporteGeneralVacaciones(string $desde, string $hasta, string $filter)
    // {
    //     // Iniciamos la consulta base
    //     $query = PermisoVacacion::with('empleados')
    //         ->whereBetween('fecha_de_inicio', [$desde, $hasta]);

    //     // Aplicamos el filtro si es 'Activo'
    //     if ($filter === 'Activo') {
    //         $query->where('status', 'Activo');
    //     }

    //     $permisosActivosConsolidados = $query->orderBy('fecha_de_inicio', 'asc')->get();

    //     $institucion = Institucion::first();

    //     $pdf = PDF::loadView('pdfs.empleados.historial-general-permisos-activos-pdf', compact(
    //         'permisosActivosConsolidados',
    //         'institucion',
    //         'desde',
    //         'hasta'
    //     ));

    //     $pdf->setPaper('Letter', 'landscape');

    //     return $pdf->stream('reporte-general-vacaciones.pdf');
    // }
}
