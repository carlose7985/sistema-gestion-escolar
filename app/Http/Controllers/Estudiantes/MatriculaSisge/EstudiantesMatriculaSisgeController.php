<?php

namespace App\Http\Controllers\Estudiantes\MatriculaSisge;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstudiantesMatriculaSisgeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $periodoActivo = PeriodoHelper::getActivo();

        if (!$periodoActivo) {
            return redirect()->back()->with('error', 'No hay un período activo.');
        }

        $query = DB::table('estudiante_periodos')
            ->join('estudiantes', 'estudiante_periodos.estudiante_id', '=', 'estudiantes.id')
            ->join('grados', 'estudiante_periodos.grado_id', '=', 'grados.id')
            ->leftJoin('responsables as padre', 'estudiantes.padre_id', '=', 'padre.id')
            ->leftJoin('responsables as representante', 'estudiantes.representante_id', '=', 'representante.id')
            ->where('estudiante_periodos.periodo_id', $periodoActivo->id)
            ->where('estudiante_periodos.matricula_sisge', 'No')
            ->select(
                DB::raw("CONCAT(estudiante_periodos.estudiante_id, '-', estudiante_periodos.periodo_id, '-', estudiante_periodos.grado_id) as ep_uid"),
                'estudiante_periodos.estudiante_id',
                'estudiante_periodos.periodo_id',
                'estudiante_periodos.grado_id',
                'estudiante_periodos.direccion as direccion_periodo',
                'estudiante_periodos.status_sisge',
                'estudiante_periodos.matricula_sisge',
                'grados.nombre_del_grado',
                'grados.seccion',
                'estudiantes.name',
                'estudiantes.apellido',
                'estudiantes.cedula',
                'estudiantes.sexo',
                'estudiantes.fecha_de_nacimiento',
                'estudiantes.lugar_de_nacimiento',
                'padre.name_r as p_nom',
                'padre.cedula_r as p_ced',
                'padre.telefono_r as p_tel',
                'padre.direccion_r as p_dir',
                'representante.name_r as r_nom',
                'representante.cedula_r as r_ced',
                'representante.telefono_r as r_tel',
                'representante.direccion_r as r_dir'
            );

        // Aplicar búsqueda
        if ($search) {
            $query->where(function ($sub) use ($search) {
                $sub->where('estudiantes.cedula', 'like', "%$search%")
                    ->orWhere('estudiantes.name', 'like', "%$search%")
                    ->orWhere('estudiantes.apellido', 'like', "%$search%");
            });
        }

        // 🔥 APLICAR ORDENAMIENTO PERSONALIZADO
        $this->applySisgeOrdering($query);

        $datos = $query->paginate(15)->withQueryString();

        // Transformación de la colección (Se mantiene igual...)
        $datos->getCollection()->transform(function ($item) {
            return (object) [
                'ep_uid' => $item->ep_uid,
                'estudiante_id' => $item->estudiante_id,
                'periodo_id' => $item->periodo_id,
                'grado_id' => $item->grado_id,
                'name' => $item->name,
                'apellido' => $item->apellido,
                'cedula' => $item->cedula,
                'sexo' => $item->sexo,
                'fecha_de_nacimiento' => $item->fecha_de_nacimiento,
                'lugar_de_nacimiento' => $item->lugar_de_nacimiento,
                'direccion' => $item->direccion_periodo,
                'age' => \Carbon\Carbon::parse($item->fecha_de_nacimiento)->age,
                'status_sisge' => $item->status_sisge ?: 'Activo',
                'matricula_sisge' => $item->matricula_sisge,
                'nombre_del_grado' => $item->nombre_del_grado,
                'seccion' => $item->seccion,
                'padre' => $item->p_nom ? [
                    'name_r' => $item->p_nom,
                    'cedula_r' => $item->p_ced,
                    'telefono_r' => $item->p_tel,
                    'direccion_r' => $item->p_dir
                ] : null,
                'representante' => $item->r_nom ? [
                    'name_r' => $item->r_nom,
                    'cedula_r' => $item->r_ced,
                    'telefono_r' => $item->r_tel,
                    'direccion_r' => $item->r_dir
                ] : null,
            ];
        });

        return Inertia::render('Estudiantes/MatriculaSisge/Index', [
            'datos' => $datos,
            'filters' => ['search' => $search],
            'periodo_escolar' => $periodoActivo->nombre_periodo,
            'totals' => ['general' => $datos->total()]
        ]);
    }

    /**
     * 🔥 Función privada para organizar el orden de los registros
     */
    private function applySisgeOrdering($query)
    {
        return $query
            // 1. Status Activo Primero (Usamos CASE para dar prioridad 0 a 'Activo' y 1 a los demás)
            ->orderByRaw("CASE WHEN status_sisge = 'Activo' THEN 0 ELSE 1 END")
            // 2. Por Nombre del Grado
            ->orderBy('grados.nombre_del_grado', 'asc')
            // 3. Por Sección
            ->orderBy('grados.seccion', 'asc')
            // 4. Sexo Masculino (M) Primero
            ->orderByRaw("CASE WHEN sexo = 'M' THEN 0 ELSE 1 END")
            // 5. Por Nombre del estudiante
            ->orderBy('estudiantes.name', 'asc');
    }

    // 🔥 8. Actualizar estudiante (solo los 5 campos)
    public function update(Request $request, int $estudianteId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cedula' => 'required|string|max:11|unique:estudiantes,cedula,' . $estudianteId,
            'fecha_de_nacimiento' => 'required|date',
            'sexo' => 'required|in:M,F',
        ]);

        $estudiante = Estudiante::findOrFail($estudianteId);
        $estudiante->update($validated);

        return redirect()->back()->with('success', 'Datos actualizados correctamente.');
    }

    // 🔥 9. Marcar como procesado en SISGE
    public function updateMatriculaSisge(Request $request, int $estudianteId)
    {
        // 1. Obtener los datos de la clave compuesta desde el request
        // Estos vienen del objeto que enviamos en router.patch desde React
        $periodoId = $request->input('periodo_id');
        $gradoId = $request->input('grado_id');

        // 2. Si por alguna razón no vienen en el request, usamos el periodo activo como respaldo
        if (!$periodoId) {
            $periodoActivo = PeriodoHelper::getActivo();
            $periodoId = $periodoActivo ? $periodoActivo->id : null;
        }

        // 3. Realizar la actualización usando la clave compuesta
        // Usamos DB::table para asegurar que la consulta sea directa y rápida
        $actualizado = DB::table('estudiante_periodos')
            ->where('estudiante_id', $estudianteId)
            ->where('periodo_id', $periodoId)
            ->where('grado_id', $gradoId)
            ->update([
                'matricula_sisge' => 'Si',
                'status_sisge'    => 'No Aplica' // Estado solicitado
            ]);

        // 4. Respuesta
        if ($actualizado) {
            return redirect()->back()->with('success', 'Estudiante procesado en SISGE correctamente.');
        }

        return redirect()->back()->with('error', 'No se pudo encontrar el registro específico para actualizar.');
    }


}
