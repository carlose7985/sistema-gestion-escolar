<?php

namespace App\Http\Controllers\Estudiantes;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReporteEspecialWhatsAppController extends Controller
{
    public function getReportData(Request $request)
    {
        try {
            $tipo = $request->query('tipo');
            $search = $request->query('search', '');

            if (!$tipo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tipo de reporte no especificado'
                ], 422);
            }

            $data = $this->fetchSpecialData($tipo, $search);

            return response()->json([
                'success' => true,
                'data' => $data,
                'total' => count($data)
            ]);
        } catch (\Exception $e) {
            Log::error("Error obteniendo datos del reporte especial: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener los datos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getEmpleados(Request $request)
    {
        try {
            $search = $request->query('search', '');

            $query = EmpleadoActivo::select('id', 'nombres', 'apellidos', 'telefono', 'funcion_en_el_plantel')
                ->whereNotNull('telefono')
                ->where('telefono', '!=', '');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombres', 'LIKE', "%{$search}%")
                        ->orWhere('apellidos', 'LIKE', "%{$search}%")
                        ->orWhere('telefono', 'LIKE', "%{$search}%")
                        ->orWhere('funcion_en_el_plantel', 'LIKE', "%{$search}%");
                });
            }

            $empleados = $query->limit(20)->get();

            return response()->json([
                'success' => true,
                'data' => $empleados
            ]);
        } catch (\Exception $e) {
            Log::error("Error obteniendo empleados: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener empleados'
            ], 500);
        }
    }

    public function sendReport(Request $request)
    {
        try {
            $tipo = $request->input('tipo');
            $empleadoId = $request->input('empleado_id');
            $search = $request->input('search', '');
            $individual = $request->input('individual', false);
            $estudianteId = $request->input('estudiante_id', null);

            if (!$tipo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tipo de reporte no especificado'
                ], 422);
            }

            $empleado = EmpleadoActivo::find($empleadoId);
            if (!$empleado || !$empleado->telefono) {
                return response()->json([
                    'success' => false,
                    'error' => 'Empleado no encontrado o sin número de teléfono'
                ], 422);
            }

            $data = $this->fetchSpecialData($tipo, $search);

            if (empty($data)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No hay datos para generar el reporte'
                ], 422);
            }

            if ($individual && $estudianteId) {
                $data = array_filter($data, function ($item) use ($estudianteId) {
                    return $item['id'] == $estudianteId;
                });
                $data = array_values($data);
            }

            if (empty($data)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Estudiante no encontrado en este reporte'
                ], 422);
            }

            $message = $this->generateReportMessage($tipo, $data);
            $numeroLimpio = $this->formatPhoneNumber($empleado->telefono);
            $whatsappUrl = "whatsapp://send?phone={$numeroLimpio}&text=" . rawurlencode($message);
         

            return response()->json([
                'success' => true,
                'message' => 'Reporte generado correctamente',
                'whatsapp_url' => $whatsappUrl,
                'empleado' => $empleado->nombres . ' ' . $empleado->apellidos,
                'numero_destino' => $numeroLimpio,
                'total_registros' => count($data),
                'tipo_reporte' => $tipo,
                'mensaje_preview' => $message
            ]);
        } catch (\Exception $e) {
            Log::error("Error enviando reporte especial: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    }

    private function fetchSpecialData($tipo, $search = '')
    {
        $edadQuery = "TIMESTAMPDIFF(YEAR, e.fecha_de_nacimiento, CURDATE())";

        $periodoActivo = DB::table('periodo_escolars')
            ->where('status', 'Activo')
            ->first();

        if (!$periodoActivo) {
            $periodoActivo = DB::table('periodo_escolars')
                ->orderBy('id', 'desc')
                ->first();
        }

        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        $query = DB::table('estudiantes as e')
            ->join('estudiante_periodos as ep', 'e.id', '=', 'ep.estudiante_id')
            ->leftJoin('grados as g', 'ep.grado_id', '=', 'g.id')
            ->select(
                'e.id',
                'e.name',
                'e.apellido',
                'e.cedula',
                'e.fecha_de_nacimiento',
                DB::raw("{$edadQuery} as edad"),
                'e.sexo',
                'g.nombre_del_grado as grado',
                'g.seccion as seccion',
                DB::raw("CONCAT(g.nombre_del_grado, ' - ', g.seccion) as grado_seccion"),
                'ep.status as status_estudiante'
            )
            ->where('ep.status', 'Activo')
            ->distinct();

        if ($periodoId) {
            $query->where('ep.periodo_id', $periodoId);
        }

        switch ($tipo) {
            case 'etnia':
                $query->whereNotNull('e.etnia')
                    ->where('e.etnia', '!=', '')
                    ->where('e.etnia', '!=', 'Ninguna');
                break;
            case 'repitientes':
                $query->where('ep.condicion', 'Repitiente');
                break;
            case 'condicion_especial':
                $query->whereNotNull('e.condicion_especial')
                    ->where('e.condicion_especial', '!=', '')
                    ->where('e.condicion_especial', '!=', 'Ninguna');
                break;
            case 'no_escolarizado':
                $query->where('ep.status_escolar', 'No escolarizado');
                break;
            case 'vuelta_patria':
                $query->where('ep.status_escolar', 'Otros');
                break;
            default:
                return [];
        }
       
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('e.name', 'LIKE', "%{$search}%")
                    ->orWhere('e.apellido', 'LIKE', "%{$search}%")
                    ->orWhere('e.cedula', 'LIKE', "%{$search}%");
            });
        }

        $query->orderBy('e.name', 'asc');

        $results = $query->get();

        return $results->map(function ($item) {
            return (array) $item;
        })->toArray();
    }

    private function generateReportMessage($tipo, $data)
    {
        $titulo = $this->getTituloReporte($tipo);
        $fecha = Carbon::now()->format('d/m/Y');
        $hora = Carbon::now()->format('g:i A');
        $total = count($data);

        $message = "📋 *REPORTE ESPECIAL*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📊 *TIPO:* {$titulo}\n";
        $message .= "📅 *FECHA:* {$fecha}\n";
        $message .= "⏰ *HORA:* {$hora}\n";
        $message .= "👥 *TOTAL:* {$total} estudiantes\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        if ($total > 50) {
            $message .= "📌 *RESUMEN DE ESTUDIANTES*\n\n";
            $message .= "Total: {$total}\n";

            $sexos = collect($data)->groupBy('sexo');
            $message .= "👨 Masculino: " . ($sexos->get('M', collect([]))->count()) . "\n";
            $message .= "👩 Femenino: " . ($sexos->get('F', collect([]))->count()) . "\n\n";

            $message .= "📎 *Los detalles completos están disponibles en el sistema.*\n";
            $message .= "🗂️ Para ver el listado completo, consulte el módulo de reportes.\n";
        } else {
            foreach ($data as $index => $item) {
                $num = $index + 1;
                $message .= "Nombres y Apellidos: {$item['name']} {$item['apellido']}\n";
                $message .= "   🪪 C.I: {$item['cedula']}\n";
                $message .= "   📚 Grado: {$item['grado']} - {$item['seccion']}\n";
                if (!empty($item['edad']) && $item['edad'] > 0) {
                    $message .= "   🎂 Edad: {$item['edad']} años\n";
                }
                $message .= "   ───────────────────\n";
            }
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📩 *Reporte generado automáticamente*\n";
        $message .= "🏫 Sistema de Gestión Escolar\n";
       

        return $message;
    }

    private function getTituloReporte($tipo)
    {
        $tipos = [
            'etnia' => 'Estudiantes de Etnias',
            'repitientes' => 'Estudiantes Repitientes',
            'condicion_especial' => 'Estudiantes con Condición Especial',
            'no_escolarizado' => 'Estudiantes No Escolarizados',
            'vuelta_patria' => 'Estudiantes Vuelta a la Patria'
        ];

        return $tipos[$tipo] ?? $tipo;
    }

    private function formatPhoneNumber($phone)
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($clean, '0')) {
            $clean = '58' . substr($clean, 1);
        }

        if (!str_starts_with($clean, '58') && strlen($clean) <= 10) {
            $clean = '58' . $clean;
        }

        return $clean;
    }
}
