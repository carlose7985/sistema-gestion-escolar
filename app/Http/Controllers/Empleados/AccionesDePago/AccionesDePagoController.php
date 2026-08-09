<?php

namespace App\Http\Controllers\Empleados\AccionesDePago;

use App\Http\Controllers\Controller;
use App\Models\AccionPago;
use App\Models\AccionTipo;
use App\Models\EmpleadoActivo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccionesDePagoController extends Controller
{
    public function index(Request $request)
    {
        $fecha = $request->fecha ?? now()->format('Y-m-d');
        $tipoId = $request->tipo_id;

        // 1. Consulta para la LISTA (con búsqueda y paginación)
        $queryEmpleados = EmpleadoActivo::when($request->search, function ($q, $s) {
            $q->where(function ($query) use ($s) {
                $query->where('nombres', 'like', "%$s%")

                    ->orWhere('apellidos', 'like', "%$s%")
                    // Nueva condición: buscar en la relación accion_pagos
                    ->orWhereHas('pagos', function ($q) use ($s) {
                        $q->where('ref_item', 'like', "%$s%");
                    });
            });
        });

        $empleados = $queryEmpleados
            ->orderBy('id', 'asc')
            ->paginate(500)
            ->appends($request->all())
            ->through(function ($emp) use ($tipoId) {
                $emp->pago_registrado = $tipoId
                    ? AccionPago::where('empleado_id', $emp->id)
                    ->where('accion_tipo_id', $tipoId)
                    ->first()
                    : null;
                return $emp;
            });

        // 2. CALCULAR ESTADÍSTICAS
        $stats = [
            'total_empleados' => 0,
            'pagados'         => 0,
            'pendientes'      => 0,
            'total_recaudado' => 0,
        ];

        if ($tipoId) {
            $totalEmpleados = EmpleadoActivo::count();
            $pagos = AccionPago::where('accion_tipo_id', $tipoId)->get();

            $stats['total_empleados'] = $totalEmpleados;
            $stats['pagados']         = $pagos->count();
            $stats['pendientes']      = $totalEmpleados - $stats['pagados'];
            $stats['total_recaudado'] = $pagos->sum(fn($p) => $p->monto_item + $p->monto_transporte);
        }

        return Inertia::render('Empleados/AccionesDePago/Index', [
            'empleados'   => $empleados,
            'tiposAccion' => AccionTipo::where('status', '>=', 0)->orderBy('created_at', 'desc')->get(),
            'metodos'     => ['Pago Móvil', 'Transferencia', 'Efectivo', 'Divisa'],
            'filters'     => $request->only(['search', 'fecha', 'tipo_id']),
            'stats'       => $stats
        ]);
    }

    public function cerrarActividad(int $id)
    {
        $tipo = AccionTipo::findOrFail($id);
        $tipo->status = 0; // 0 = CERRADO
        $tipo->save();

        return redirect()->back()->with('success', 'Actividad cerrada. Ya no se pueden registrar más pagos.');
    }

    public function reabrirActividad(int $id)
    {
        $tipo = AccionTipo::findOrFail($id);
        $tipo->status = 1; // 1 = ABIERTO
        $tipo->save();

        // Usar back() para que Inertia refresque los props de la vista actual
        return redirect()->back()->with('success', 'Actividad reabierta. Ya se pueden registrar pagos nuevamente.');
    }

    public function updateTipo(Request $request, int $id)
    {
        $tipo = AccionTipo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'costo_base' => 'required|numeric|min:0',
        ]);

        $tipo->update($validated);
        return redirect()->back()->with('success', 'Concepto actualizado correctamente.');
    }

    public function storeTipo(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string',
            'costo_base' => 'required|numeric',
            'costo_transporte' => 'nullable|numeric',
        ]);

        AccionTipo::create($data);
        return redirect()->back()->with('success', 'Registrado correctamente.');
    }

    public function storePago(Request $request)
    {
        $validated = $request->validate([
            'empleado_id'    => 'required|exists:empleado_activos,id',
            'accion_tipo_id' => 'required|exists:accion_tipos,id',
            'ref_item'       => 'nullable|string|max:50',
            'fecha_pago'     => 'required|date',
        ]);

        // 1. Verificamos si el empleado ya pagó esta actividad (regla de negocio previa)
        $yaPagado = AccionPago::where('empleado_id', $request->empleado_id)
            ->where('accion_tipo_id', $request->accion_tipo_id)
            ->exists();

        if ($yaPagado) {
            return redirect()->back()->withErrors([
                'pago' => 'Este empleado ya tiene un pago registrado para esta actividad.'
            ])->withInput();
        }

        if ($request->ref_item) {
            $refOriginal = $request->ref_item;

            // Detectamos si el usuario terminó en guion (ej: "1234-")
            $quiereSerie = str_ends_with($refOriginal, '-');

            // Limpiamos el guion para obtener la base (ej: "1234")
            $refBase = rtrim($refOriginal, '-');

            // Buscamos si existe la base o cualquier hijo de la serie
            $existeRelacionado = AccionPago::where('accion_tipo_id', $request->accion_tipo_id)
                ->where(function ($q) use ($refBase) {
                    $q->where('ref_item', $refBase)
                        ->orWhere('ref_item', 'like', $refBase . '-%');
                })->exists();

            if ($existeRelacionado) {
                if (!$quiereSerie) {
                    // Si existe pero el usuario NO puso el guion, lanzamos error de validación
                    return redirect()->back()->withErrors([
                        'ref_item' => 'La referencia "' . $refBase . '" ya existe o pertenece a una serie. Para agregar una nueva secuencia, escriba "' . $refBase . '-" (con un guion al final).'
                    ])->withInput();
                } else {
                    // Si existe y puso el guion, ejecutamos la re-indexación y obtenemos el nuevo número
                    $nuevaRef = $this->normalizarSerieRef($refBase, $request->accion_tipo_id);
                    $request->merge(['ref_item' => $nuevaRef]);
                }
            } else {
                // Si no existe ninguna relación, guardamos el número limpio (sin el guion si lo puso)
                $request->merge(['ref_item' => $refBase]);
            }
        }

        try {
            AccionPago::create($request->all());
            return redirect()->back()->with('success', 'Pago registrado exitosamente. Referencia: ' . $request->ref_item);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['pago' => 'Error al guardar: ' . $e->getMessage()])->withInput();
        }
    }


    public function updatePago(Request $request, int $id)
    {
        $pago = AccionPago::findOrFail($id);

        $validated = $request->validate([
            'ref_item'    => 'nullable|string|max:50',
            'monto_item'  => 'required|numeric',
            'metodo_item' => 'required|string',
            'fecha_pago'  => 'required|date',
        ]);

        // 1. Verificamos si el usuario REALMENTE cambió la referencia.
        // Si la ref que viene en el input es igual a la que ya está en la BD, no validamos nada de series.
        if ($request->ref_item && $request->ref_item !== $pago->ref_item) {

            $refOriginal = $request->ref_item;
            $quiereSerie = str_ends_with($refOriginal, '-');
            $refBase = rtrim($refOriginal, '-');
            $refBase = explode('-', $refBase)[0];

            // 2. Buscamos si la nueva referencia que intenta poner ya existe en OTRAS personas
            $existeEnOtros = AccionPago::where('accion_tipo_id', $pago->accion_tipo_id)
                ->where('id', '!=', $id) // Excluimos el registro actual
                ->where(function ($q) use ($refBase) {
                    $q->where('ref_item', $refBase)
                        ->orWhere('ref_item', 'like', $refBase . '-%');
                })->exists();

            if ($existeEnOtros) {
                if (!$quiereSerie) {
                    // Bloqueamos porque el usuario intenta usar un número de OTRA persona sin usar guion
                    return redirect()->back()->withErrors([
                        'ref_item' => 'La referencia "' . $refBase . '" ya está en uso por otro registro. Si desea unirlo a esa serie, agregue un guion al final: "' . $refBase . '-".'
                    ])->withInput();
                } else {
                    // Actualización legítima de serie: normalizamos
                    $pago->update(['ref_item' => $refBase]);
                    $nuevaRef = $this->normalizarSerieRef($refBase, $pago->accion_tipo_id);
                    $validated['ref_item'] = $nuevaRef;
                }
            } else {
                // Es una referencia nueva que nadie más tiene, la guardamos limpia
                $validated['ref_item'] = $refBase;
            }
        } else {
            // Si el usuario NO cambió la referencia (o es nula), mantenemos la que ya tenía el registro
            $validated['ref_item'] = $pago->ref_item;
        }

        // Finalmente actualizamos todos los campos (monto, método, etc.)
        $pago->update($validated);

        return redirect()->back()->with('success', 'Pago actualizado correctamente.');
    }

    private function normalizarSerieRef($refBase, $accionTipoId)
    {
        // 1. Buscamos TODOS los registros (el original y los que tengan -X)
        // Usamos el patrón: igual a refBase O empieza por refBase + '-'
        $items = AccionPago::where('accion_tipo_id', $accionTipoId)
            ->where(function ($q) use ($refBase) {
                $q->where('ref_item', $refBase)
                    ->orWhere('ref_item', 'like', $refBase . '-%');
            })
            ->orderBy('id', 'asc') // Mantenemos el orden de creación
            ->get();

        // 2. Si ya existen, renumeramos todos del 1 al N
        // Si es el primerito, count será 0, así que el nuevo registro será 1
        $nuevoIndice = $items->count() + 1;

        foreach ($items as $index => $item) {
            $indiceActual = $index + 1;
            $nuevoValor = $refBase . '-' . $indiceActual;

            // Actualizamos cada uno con su nuevo índice (7925-1, 7925-2, etc.)
            $item->update(['ref_item' => $nuevoValor]);
        }

        return $refBase . '-' . $nuevoIndice;
    }

    public function destroyPago(int $id)
    {
        $pago = AccionPago::findOrFail($id);
        $pago->delete();

        return redirect()->back()->with('success', 'Pago revertido con éxito');
    }


    public function imprimirReporte(int $id)
    {
        $accion = AccionTipo::findOrFail($id);

        // Obtenemos los pagos con los datos del empleado
        $pagos = AccionPago::where('accion_tipo_id', $id)
            ->with('empleado:id,nombres,apellidos,cedula')
            ->get();

        return Inertia::render('Empleados/AccionesDePago/ReporteCaja', [
            'accion' => $accion,
            'pagos' => $pagos,
            'institucion' => \App\Models\Institucion::first(), // O el modelo donde guardes los datos del plantel
            'totalRecaudado' => $pagos->sum('monto_item'),
            'fechaReporte' => now()->format('Y-m-d H:i:s'),
        ]);
    }
    public function eliminarActividad(int $id)
    {
        $tipo = AccionTipo::findOrFail($id);

        if ($tipo->status == 1) {
            return redirect()->back()->withErrors(['pago' => 'No se puede eliminar una actividad que aún está abierta.']);
        }

        // Borramos los pagos vinculados
        AccionPago::where('accion_tipo_id', $id)->delete();

        // Marcamos la actividad como eliminada/archivada
        $tipo->status = -1;
        $tipo->save();

        return redirect()->back()->with('success', 'Actividad y registros eliminados por completo.');
    }
}
