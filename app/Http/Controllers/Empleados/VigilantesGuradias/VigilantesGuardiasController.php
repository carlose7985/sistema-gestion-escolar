<?php

namespace App\Http\Controllers\Empleados\VigilantesGuradias;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\VigilanteGuardia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class VigilantesGuardiasController extends Controller
{
    public function index(Request $request)
    {
        $diaFilter = $request->input('dia', 'lunes');
        $search = $request->input('search');

        $query = VigilanteGuardia::with('empleado');

        if ($search) {
            $query->whereHas('empleado', function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%");
            });
        } else {
            $query->whereJsonContains('dias_guardia', $diaFilter);
        }

        // LISTA PARA EL MODAL DE CREACIÓN (Empleados que no son vigilantes aún)
        $empleadosAsignadosIds = VigilanteGuardia::pluck('empleado_id')->toArray();
        $empleadosDisponibles = EmpleadoActivo::where('tipo_de_personal', '!=', 'Docente')
            ->whereNotIn('id', $empleadosAsignadosIds)
            ->get(['id', 'nombres', 'apellidos', 'cedula', 'tipo_de_personal']);

        return Inertia::render('Empleados/VigilantesGuardias/Index', [
            'vigilantes' => $query->get(),
            'empleadosDisponibles' => $empleadosDisponibles, // Nueva prop
            'filters' => [
                'dia' => $diaFilter,
                'search' => $search
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id',
            'tipo_de_personal' => 'required|string',
            'dias_guardia' => 'required|array',
        ]);
        // Verificar si ya existe un registro para este empleado
        $existe = VigilanteGuardia::where('empleado_id', $request->empleado_id)->first();

        if ($existe) {
            // Si existe, actualizar los días de guardia
            $existe->update([
                'dias_guardia' => $request->dias_guardia
            ]);

            return redirect()->back()->with('success', 'Días de guardia actualizados exitosamente');
        } else {
            // Si no existe, crear nuevo registro
            VigilanteGuardia::create([
                'empleado_id' => $request->empleado_id,
                'tipo_de_personal' => $request->tipo_de_personal,
                'dias_guardia' => $request->dias_guardia,
            ]);

            return redirect()->back()->with('success', 'Vigilante guardado exitosamente');
        }
    }

    public function update(Request $request, VigilanteGuardia $id)
    {
        $request->validate([
            'dias_guardia' => 'required|array|min:1',
        ]);

        $id->update([
            'dias_guardia' => $request->dias_guardia
        ]);

        return redirect()->back()->with('success', 'Días de guardia actualizados correctamente');
    }
    
    public function destroy(VigilanteGuardia $id)
    {
        $id->delete();

        return redirect()->back()->with('info', 'Vigilante eliminado exitosamente');
    }

    public function generarPdf()
    {
        $vigilantes = VigilanteGuardia::with('empleado')->get();
        $diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

        // Agrupamos manualmente: Creamos un array donde cada llave es un día
        $reportePorDia = [];
        foreach ($diasSemana as $dia) {
            $reportePorDia[$dia] = $vigilantes->filter(function ($v) use ($dia) {
                return in_array($dia, $v->dias_guardia);
            });
        }

        $pdf = Pdf::loadView('reportes.reporte-guardias', compact('reportePorDia'))
            ->setPaper('a4', 'portrait'); // Vertical es mejor para listas largas

        return $pdf->stream('Reporte_Guardias_Seguridad.pdf');
    }
}
