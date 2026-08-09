<?php

namespace App\Http\Controllers\ReportesAsistencia;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppMessage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WhatsAppController extends Controller
{
    /**
     * Vista principal del reporte WhatsApp
     */
    public function index()
    {
        try {
            $sentMessages = WhatsAppMessage::latest()
                ->take(10)
                ->get();

            return Inertia::render('Reportes/ReporteDiario/Index', [
                'sentMessages' => $sentMessages
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar la página de WhatsApp');
        }
    }

    /**
     * Genera el enlace de WhatsApp con el mensaje pre-cargado
     */
    public function sendMessage(Request $request)
    {
        try {
            $fecha = $request->input('fecha');
            $reportData = $this->getReportData($fecha);

            // 1. Validar si hay datos para el reporte
            if (is_string($reportData) || !$reportData) {
                return response()->json([
                    'success' => false,
                    'error' => is_string($reportData) ? $reportData : 'No existen datos para esta fecha.'
                ], 422);
            }

            // 2. BUSCAR AL DIRECTOR EN LA BASE DE DATOS
            $director = \App\Models\EmpleadoActivo::where('funcion_en_el_plantel', 'Director')->first();

            if (!$director || !$director->telefono) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se encontró un Director registrado o no tiene número de teléfono.'
                ], 422);
            }

            // 3. GENERAR EL MENSAJE ESTILIZADO
            $message = $this->generateReportMessage($reportData, $fecha);

            // 4. FORMATEAR EL NÚMERO (0412-1234567 -> 584121234567)
            $numeroLimpio = $this->formatPhoneNumber($director->telefono);

            // 5. CONSTRUIR URL DE WHATSAPP CON NÚMERO Y MENSAJE
    
            $whatsappUrl = "whatsapp://send?phone={$numeroLimpio}&text=" . rawurlencode($message);
            // 6. GUARDAR REGISTRO DEL MENSAJE
            WhatsAppMessage::create([
                'message' => $message,
                'status' => 'pending',
                'sent_at' => null,
                'via' => 'whatsapp_web',
                'fecha_reporte' => $fecha
            ]);

            // 7. RETORNAR LA URL PARA EL FRONTEND
            return response()->json([
                'success' => true,
                'message' => 'Reporte generado correctamente.',
                'whatsapp_url' => $whatsappUrl,
                'director' => $director->nombres,
                'numero_destino' => $numeroLimpio,
                'mensaje_preview' => $message,
                'fecha_reporte' => $fecha
            ]);
        } catch (\Exception $e) {
            Log::error("Error generando reporte: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vista previa del mensaje
     */
    public function previewMessage(Request $request)
    {
        try {
            $fecha = $request->query('fecha');
            $reportData = $this->getReportData($fecha);

            // Si no hay datos
            if (is_string($reportData) || !$reportData) {
                return response()->json([
                    'success' => false,
                    'message' => is_string($reportData) ? $reportData : 'No existen datos para esta fecha.',
                    'no_data' => true
                ]);
            }

            // Buscar director para mostrar en la vista previa
            $director = \App\Models\EmpleadoActivo::where('funcion_en_el_plantel', 'Director')->first();

            // Generar mensaje
            $message = $this->generateReportMessage($reportData, $fecha);
            $fechaMostrar = $fecha ? Carbon::parse($fecha)->format('d-m-Y') : Carbon::today()->format('d-m-Y');

            return response()->json([
                'success' => true,
                'preview' => $message,
                'data_date' => $fechaMostrar,
                'director' => $director ? [
                    'nombres' => $director->nombres,
                    'telefono' => $director->telefono
                ] : null
            ]);
        } catch (\Exception $e) {
            Log::error("Error en preview: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error procesando la solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera el mensaje formateado para WhatsApp
     */
    private function generateReportMessage($data, $fechaSeleccionada = null)
    {
        $fecha = $fechaSeleccionada
            ? Carbon::parse($fechaSeleccionada)->format('d-m-Y')
            : now()->format('d-m-Y');

        $hora = now()->format('g:i a');

        return <<<MSG
🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪🇻🇪
CDCE ESTADO DELTA AMACURO
DIRECTOR
MSc. EDGAR FIGUEROA

REPORTE-LINEA ESTRATEGICA INCLUSION 100% ESCOLARIDAD Y RESPETO AL TIEMPO ESCOLAR - SEGUIMIENTO DE LA MATRICULA ESCOLAR DE LAS ACTIVIDADES ESCOLARES 2025/2026

1ER REPORTE
SE AMERITA A LAS 9:00AM SIN FALTA

2DO Reporte
2:00pm

3er Reporte
5:00pm

FECHA: {$fecha}
HORA: {$hora}
LUGAR: Raúl Leoni I

📎ESTADO: Delta Amacuro          
📎MUNICIPIO: Tucupita
📎CIRCUITO: 06
📎INSTITUCIÓN EDUCATIVA: Escuela Carlos Rafael Contreras

📚 DEPENDENCIA DE LA INSTITUCIÓN
NACIONAL: Si
ESTADAL:
PRIVADA:
SUBVENCIONADA:
AUTÓNOMA:
MUNICIPAL:
TOTAL:

📚 TOTAL GENERAL DE LA MATRÍCULA ESCOLAR 
INSCRITA: {$data['total_estudiantes']['total_existentes']}
FEMENINO: {$data['total_estudiantes']['hembras_existentes']}
MASCULINO: {$data['total_estudiantes']['varones_existentes']}
TOTAL: {$data['total_estudiantes']['total_existentes']}

MATRÍCULA QUE ASISTE EL DIA DE HOY 

🇻🇪 MATERNAL:
FEMENINA:
MASCULINO:
TOTAL:
DOCENTES: F:  M:  T:  

🇻🇪 PREESCOLAR 
FEMENINA:
MASCULINO:
TOTAL:
DOCENTES: F:  M:  T:  

🇻🇪 PRIMARIA 
FEMENINA: {$data['primaria']['hembras_asistentes']}
MASCULINO: {$data['primaria']['varones_asistentes']}
TOTAL: {$data['primaria']['total_asistentes']}
DOCENTES: F: {$data['docentes']['hembras_asistentes']}   M: {$data['docentes']['varones_asistentes']}  T: {$data['docentes']['total_asistentes']}

🇻🇪 MEDIA GENERAL 
FEMENINA:
MASCULINO:
TOTAL:
DOCENTES: F:  M:  T:  

🇻🇪 MEDIA TÉCNICA 
FEMENINA:
MASCULINO:
TOTAL:
DOCENTES: F:  M:  T:  

🇻🇪 MODALIDAD ESPECIAL 
FEMENINA:
MASCULINO:
TOTAL:

🇻🇪 MODALIDAD JÓVENES ADULTAS Y ADULTOS 
FEMENINA:
MASCULINO:
TOTAL:

🇻🇪 MODALIDAD INTERCULTURAL BILINGÜE 
FEMENINA:
MASCULINO:
TOTAL:

📚 PERSONAL QUE ASISTIO EL DIA DE HOY 

DOCENTES:
M: {$data['docentes']['varones_asistentes']}
F: {$data['docentes']['hembras_asistentes']}         
T: {$data['docentes']['total_asistentes']}

OBREROS:
M: {$data['obreros']['varones_asistentes']}
F: {$data['obreros']['hembras_asistentes']}         
T: {$data['obreros']['total_asistentes']}

ADMINISTRATIVOS:
M: {$data['administrativos']['varones_asistentes']}
F: {$data['administrativos']['hembras_asistentes']}
T: {$data['administrativos']['total_asistentes']}

COCINERAS:
M: {$data['cocineros']['varones_asistentes']}
F: {$data['cocineros']['hembras_asistentes']}        
T: {$data['cocineros']['total_asistentes']}

VIGILANTES:
M: {$data['vigilantes']['varones_asistentes']}
F: {$data['vigilantes']['hembras_asistentes']}         
T: {$data['vigilantes']['total_asistentes']}

📚 ACTIVIDADES DESARROLLADAS:
MSG;
    }

    /**
     * Obtiene los datos del reporte para una fecha específica
     */
    private function getReportData($fecha = null)
    {
        $fechaConsultar = $fecha ? Carbon::parse($fecha) : Carbon::today();

        // 1. Validar existencia de datos de estudiantes
        $existenDatosEstudiantes = DB::table('total_estudiantes')
            ->whereDate('fecha_registro', $fechaConsultar)
            ->exists();

        if (!$existenDatosEstudiantes) {
            return 'Faltan registros de asistencias de estudiantes para esta fecha.';
        }

        // 2. Validar existencia de datos de empleados
        $existenDatosEmpleados = DB::table('total_empleados')
            ->whereDate('fecha_registro', $fechaConsultar)
            ->exists();

        if (!$existenDatosEmpleados) {
            return 'Faltan registros de asistencias de empleados para esta fecha.';
        }

        try {
            // Obtener datos de estudiantes
            $totalEstudiantes = DB::table('total_estudiantes')
                ->whereDate('fecha_registro', $fechaConsultar)
                ->first();

            // Obtener datos de empleados por categoría
            $tiposPersonal = ['Docente', 'Administrativo', 'Obrero', 'Cenae', 'Vigilante'];
            $empleados = [];

            foreach ($tiposPersonal as $tipo) {
                $key = ($tipo === 'Cenae') ? 'cocineros' : strtolower($tipo) . 's';

                $query = DB::table('total_empleados')
                    ->where('tipo_de_personal', $tipo)
                    ->whereDate('fecha_registro', $fechaConsultar)
                    ->first();

                $empleados[$key] = [
                    'hembras_asistentes' => $query->hembras_asistentes ?? 0,
                    'varones_asistentes' => $query->varones_asistentes ?? 0,
                    'total_asistentes' => $query->total_asistentes ?? 0,
                ];
            }

            return [
                'total_estudiantes' => [
                    'hembras_existentes' => $totalEstudiantes->hembras_existentes ?? 0,
                    'varones_existentes' => $totalEstudiantes->varones_existentes ?? 0,
                    'total_existentes' => $totalEstudiantes->total_existentes ?? 0,
                ],
                'primaria' => [
                    'hembras_asistentes' => $totalEstudiantes->hembras_asistentes ?? 0,
                    'varones_asistentes' => $totalEstudiantes->varones_asistentes ?? 0,
                    'total_asistentes' => $totalEstudiantes->total_asistentes ?? 0,
                ],
                'docentes' => $empleados['docentes'],
                'administrativos' => $empleados['administrativos'],
                'obreros' => $empleados['obreros'],
                'cocineros' => $empleados['cocineros'],
                'vigilantes' => $empleados['vigilantes'],
            ];
        } catch (\Exception $e) {
            Log::error("Error en getReportData: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Formatea el número de teléfono para WhatsApp
     */
    private function formatPhoneNumber($phone)
    {
        // Eliminar todos los caracteres no numéricos
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Si empieza con 0, reemplazar por 58 (código de Venezuela)
        if (str_starts_with($clean, '0')) {
            $clean = '58' . substr($clean, 1);
        }

        // Si no tiene código de país, agregar 58
        if (!str_starts_with($clean, '58') && strlen($clean) <= 10) {
            $clean = '58' . $clean;
        }

        return $clean;
    }
}
