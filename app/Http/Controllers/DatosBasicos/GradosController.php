<?php

namespace App\Http\Controllers\DatosBasicos;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\Grado;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $secciones = Grado::query()
            ->when($search, function ($query, $search) {
                // En MySQL, esto suele ignorar tildes por defecto con la colación adecuada
                $query->where('nombre_del_grado', 'like', "%{$search}%")
                    ->orWhere('docente', 'like', "%{$search}%");
            })
            ->orderBy('nombre_del_grado', 'asc')
            ->paginate(6)
            ->withQueryString();

        $docentes = EmpleadoActivo::where('tipo_de_personal', 'Docente')
            ->select('id', 'nombres', 'apellidos')
            ->get()
            ->map(fn($d) => "{$d->nombres} {$d->apellidos}");

        return Inertia::render('DatosBasicos/Grados/Index', [
            'secciones' => $secciones,
            'gradosDisponibles' => Nivel::where('activo', true)->pluck('nombre'),
            'docentes' => $docentes,
            'filters' => [
                'search' => $search // 👈 ESTO ES LO QUE FALTA
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre_del_grado' => 'required',
            'seccion' => 'required|max:2',
            'docente' => 'required',
            'limite_de_estudiantes' => 'required|integer|min:1',
        ]);

       
        // Generamos un contenido para el QR (Ej: Grado + Sección + ID)
        $data['code_qr'] = "GRADO: {$request->nombre_del_grado} | SECCIÓN: {$request->seccion} | DOCENTE: {$request->docente}";

        $data['status'] = 'Activo';

        $grados = Grado::updateOrCreate(['id' => $request->id], $data);

        $message = $grados->wasRecentlyCreated
            ? 'Grado creado con éxito'
            : 'Grado actualizado con éxito';

        return back()->with('success', $message);
    }

    public function toggle(int $id)
    {
        $seccion = Grado::findOrFail($id);

        // Cambiamos al estado opuesto
        $nuevoStatus = ($seccion->status === 'Activo') ? 'Inactivo' : 'Activo';

        $seccion->update([
            'status' => $nuevoStatus
        ]);

        return back()->with('success', "Estado cambiado a {$nuevoStatus}");
    }
}
