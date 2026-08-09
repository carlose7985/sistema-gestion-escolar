<?php

namespace App\Http\Controllers\GlobalesSearchAndQuist;

use App\Http\Controllers\Controller;
use App\Models\PeriodoEscolar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->get('query');

            if (strlen($query) < 2) {
                return response()->json([]);
            }

            // Obtener período activo
            $periodoActivo = PeriodoEscolar::where('status', 'Activo')->first();
            $periodoActivoId = $periodoActivo ? $periodoActivo->id : null;

            // Buscar en estudiante_periodos
            $results = DB::table('estudiante_periodos')
                ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
                ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
                ->join('periodo_escolars', 'estudiante_periodos.periodo_id', '=', 'periodo_escolars.id')
                ->where(function ($q) use ($query) {
                    $q->where('estudiantes.name', 'LIKE', "%{$query}%")
                        ->orWhere('estudiantes.apellido', 'LIKE', "%{$query}%")
                        ->orWhere('estudiantes.cedula', 'LIKE', "%{$query}%");
                })
                ->select(
                    'estudiantes.id',
                    'estudiantes.name',
                    'estudiantes.apellido',
                    'estudiantes.cedula',
                    'estudiantes.documento',
                    'estudiantes.sexo',
                    'estudiante_periodos.status',
                    'estudiante_periodos.status_escolar',
                    'estudiante_periodos.periodo_id',
                    'estudiante_periodos.grado_id',
                    'grados.nombre_del_grado',
                    'grados.seccion',
                    'periodo_escolars.nombre_periodo',
                    'periodo_escolars.id as periodo_id'
                )
                ->orderBy('periodo_escolars.id', 'desc')
                ->limit(20)
                ->get()
                ->groupBy('id')
                ->map(function ($registros) use ($periodoActivoId) {
                    $estudiante = $registros->first();

                $periodos = $registros->map(function ($reg) use ($periodoActivoId) {
                        return [
                            'periodo' => $reg->nombre_periodo,
                            'status' => $reg->status,
                            'status_escolar' => $reg->status_escolar,
                            'grado' => $reg->nombre_del_grado . ' - ' . $reg->seccion,
                            'periodo_id' => $reg->periodo_id,
                            'grado_id' => $reg->grado_id,
                            'is_last' => $reg->periodo_id == $periodoActivoId,
                        ];
                    })->sortByDesc('periodo_id')->values();

                    $ultimo = $periodos->first();

                    $color = $this->getStatusColor($ultimo['status'] ?? '');
                    $colorText = $this->getStatusColorText($ultimo['status'] ?? '');

                    return [
                        'id' => $estudiante->id,
                        'full_name' => $estudiante->name . ' ' . $estudiante->apellido,
                        'cedula' => $estudiante->cedula,
                        'documento' => $estudiante->documento,
                        'sexo' => $estudiante->sexo,
                        'status' => $ultimo['status'] ?? 'N/A',
                        'status_escolar' => $ultimo['status_escolar'] ?? 'N/A',
                        'grado' => $ultimo['grado'] ?? 'N/A',
                        'grado_id' => $ultimo['grado_id'] ?? null,
                        'periodo' => $ultimo['periodo'] ?? 'N/A',
                        'periodo_id' => $ultimo['periodo_id'] ?? null,
                        'is_last' => $ultimo['is_last'] ?? false,
                        'color' => $color,
                        'color_text' => $colorText,
                        'periodos' => $periodos->toArray(),
                        'periodo_actual_id' => $periodoActivoId,
                    ];
                })
                ->values();

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error en búsqueda global: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getStatusColor($status)
    {
        return match ($status) {
            'Activo' => 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
            'Aprobado' => 'bg-blue-500/20 border-blue-500/50 text-blue-400',
            'Reprobado' => 'bg-rose-500/20 border-rose-500/50 text-rose-400',
            'Retirado' => 'bg-slate-500/20 border-slate-500/50 text-slate-400',
            'Graduado' => 'bg-purple-500/20 border-purple-500/50 text-purple-400',
            default => 'bg-slate-500/20 border-slate-500/50 text-slate-400',
        };
    }

    private function getStatusColorText($status)
    {
        return match ($status) {
            'Activo' => 'text-emerald-400',
            'Aprobado' => 'text-blue-400',
            'Reprobado' => 'text-rose-400',
            'Retirado' => 'text-slate-400',
            'Graduado' => 'text-purple-400',
            default => 'text-slate-400',
        };
    }
}
