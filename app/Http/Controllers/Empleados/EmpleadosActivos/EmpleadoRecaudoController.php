<?php

namespace App\Http\Controllers\Empleados\EmpleadosActivos;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use App\Models\EmpleadoActivo;
use App\Models\EmpleadoRecaudo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class EmpleadoRecaudoController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->input('search');
        $tab = $request->input('tab', 'pendientes');

        $query = EmpleadoActivo::query();

        if ($tab === 'pendientes') {
            $query->whereDoesntHave('recaudo');
        } else {
            $query->whereHas('recaudo');
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'LIKE', "%{$search}%")
                    ->orWhere('apellidos', 'LIKE', "%{$search}%")
                    ->orWhere('cedula', 'LIKE', "%{$search}%");
            });
        }

        $query->with('recaudo');

        $empleados = $query->paginate(200)
            ->withQueryString()
            ->through(fn($emp) => [
                'id' => $emp->id,
                'nombre_completo' => "{$emp->nombres} {$emp->apellidos}",
                'cedula' => $emp->cedula,
                // Ya no agrupamos cargos, mostramos el cargo real
                'cargo_actual' => $tab === 'pendientes'
                    ? ($emp->tipo_de_personal ?? '')
                    : ($emp->recaudo?->cargo_entrega ?? ''),
                'profesion' => $emp->recaudo?->profesion ?? '',
                'talla' => $emp->recaudo?->talla ?? '',
                'etiqueta' => $emp->recaudo?->etiqueta ?? '', // Añadimos etiqueta
            ]);

        // Lista de etiquetas para el select
        $etiquetas = [
            'Director',
            'Subdirector',
            'Coordinadora Pedagogica',
            'Coordinador Pedagogico',
            'Docente',
            'Apoyo Ambiental',
            'Administrativo',
            'Cociner@s de la Patria',
            'Vigilante'
        ];

        // Cargos disponibles (simplificados)
        $cargos = Cargo::all()->map(function ($cargo) {
            return [
                'id' => $cargo->id,
                'nombre_del_cargo' => $cargo->nombre_del_cargo
            ];
        });

        return Inertia::render('Empleados/Recaudos/Index', [
            'empleados' => $empleados,
            'filters' => $request->all(),
            'cargos' => $cargos,
            'etiquetas' => $etiquetas, // Enviamos etiquetas a la vista
            'currentTab' => $tab
        ]);
    }

    public function store(Request $request)
    {
        $registrados = 0;
        foreach ($request->recaudos as $item) {
            if (!empty($item['talla'])) {
                EmpleadoRecaudo::updateOrCreate(
                    ['empleado_id' => $item['id']],
                    [
                        'profesion'     => $item['profesion'] ?? '',
                        'talla'         => $item['talla'],
                        'cargo_entrega' => $item['cargo_actual'] ?? '',
                        'etiqueta'      => $item['etiqueta'] ?? '', // Guardamos etiqueta
                    ]
                );
                $registrados++;
            }
        }

        return redirect()->back();
    }
    public function destroy(int $id)
    {
        
        try {
            $recaudo = EmpleadoRecaudo::where('empleado_id', $id);
            $recaudo->delete();

            return redirect()->back()->with('success', 'Registro eliminado correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el registro');
        }
    }


    public function imprimir()
    {
        // Definir el orden personalizado de los cargos
        $ordenCargos = [
            'Docente',
            'Administrativo',
            'Obrero',
            'Cenae',
            'Vigilante'
        ];

        // Obtener todos los empleados con recaudo
        $empleados = EmpleadoActivo::whereHas('recaudo')
            ->with('recaudo')
            ->get()
            ->map(function ($emp) {
                $nombresArr = explode(' ', trim($emp->nombres));
                $primerNombre = $nombresArr[0];

                if (strtolower($primerNombre) === 'del' && isset($nombresArr[1])) {
                    $primerNombre .= ' ' . $nombresArr[1];
                }

                $apellidosArr = explode(' ', trim($emp->apellidos));
                $primerApellido = $apellidosArr[0];

                return [
                    'profesion' => $emp->recaudo->profesion ?? '',
                    'nombre_formateado' => "{$primerNombre} {$primerApellido}",
                    'cargo' => $emp->tipo_de_personal ?? 'SIN CARGO',
                    'talla' => $emp->recaudo->talla ?? 'N/A',
                    'etiqueta' => $emp->recaudo->etiqueta ?? 'SIN ETIQUETA',
                    'tipo_de_personal' => $emp->tipo_de_personal ?? 'SIN TIPO',
                    'id' => $emp->id
                ];
            });

        // Ordenar los empleados según el orden personalizado de cargos
        $empleadosOrdenados = $empleados->sortBy(function ($emp) use ($ordenCargos) {
            $posicion = array_search($emp['cargo'], $ordenCargos);
            return $posicion !== false ? $posicion : count($ordenCargos);
        })->values();

        $pdf = Pdf::loadView('pdfs.recaudos_cargo', compact('empleadosOrdenados'));

        return $pdf->setPaper('letter', 'portrait')
            ->stream("Listado_General_Recaudos.pdf");
    }
}
