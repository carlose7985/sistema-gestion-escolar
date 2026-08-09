<?php

namespace App\Http\Controllers\Estudiantes\EstudiantesCondicionales;

use App\Http\Controllers\Controller;
use App\Helpers\PeriodoHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportesEspecialesController extends Controller
{
    public function index()
    {
        return Inertia::render('Estudiantes/ReportesEspeciales/Index', [
            'filters' => [
                'tipo' => '',
                'search' => '',
            ]
        ]);
    }

    public function data(Request $request)
    {
        $tipo = $request->input('tipo');
        $search = $request->input('search');

        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return response()->json(['data' => []]);
        }

        $periodoId = $periodoActivo->id;

        $query = DB::table('estudiante_periodos as ep')
            ->join('estudiantes as e', 'ep.estudiante_id', '=', 'e.id')
            ->join('grados as g', 'ep.grado_id', '=', 'g.id')
            ->where('ep.periodo_id', $periodoId)
            ->where('ep.status', 'Activo')
            ->select(
                'e.id',
                'e.name',
                'e.apellido',
                'e.cedula',
                'e.sexo',
                'e.fecha_de_nacimiento',
                'g.nombre_del_grado as grado',
                'g.seccion',
                DB::raw("TIMESTAMPDIFF(YEAR, e.fecha_de_nacimiento, CURDATE()) as edad")
            );

        switch ($tipo) {
            case 'etnia':
                $query->whereNotNull('e.etnia')->where('e.etnia', '!=', 'Ninguna');
                break;
            case 'repitientes':
                $query->where('ep.condicion', 'Repitiente');
                break;
            case 'condicion_especial':
                $query->whereNotNull('e.condicion_especial')->where('e.condicion_especial', '!=', 'Ninguna');
                break;
            case 'no_escolarizado':
                $query->where('ep.status_escolar', 'No escolarizado');
                break;
            case 'vuelta_patria':
                $query->where('ep.status_escolar', 'Otros');
                break;
            default:
                return response()->json(['data' => []]);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('e.name', 'like', "%{$search}%")
                    ->orWhere('e.apellido', 'like', "%{$search}%")
                    ->orWhere('e.cedula', 'like', "%{$search}%");
            });
        }

        $data = $query->orderBy('e.apellido', 'asc')
            ->orderBy('e.name', 'asc')
            ->get();

        return response()->json(['data' => $data]);
    }
}
