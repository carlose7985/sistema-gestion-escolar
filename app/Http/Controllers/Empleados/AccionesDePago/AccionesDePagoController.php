<?php

namespace App\Http\Controllers\Empleados\AccionesDePago;

use App\Http\Controllers\Controller;
use App\Models\AccionPago;
use App\Models\AccionTipo;
use App\Models\EmpleadoActivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AccionesDePagoController extends Controller
{
    public function index(Request $request)
    {
        $tipoId = $request->tipo_id;
        $fecha = $request->fecha ?? now()->format('Y-m-d');

        $query = EmpleadoActivo::with(['pagos' => function ($q) use ($tipoId) {
            if ($tipoId) $q->where('accion_tipo_id', $tipoId)->orderBy('id', 'asc');
        }])
            ->when($request->search, function ($q, $s) {
                $q->where(function ($query) use ($s) {
                    $query->where('nombres', 'like', "%$s%")
                        ->orWhere('apellidos', 'like', "%$s%")
                        ->orWhere('cedula', 'like', "%$s%")
                        ->orWhereHas('pagos', function ($q) use ($s) {
                            $q->where('ref_item', 'like', "%$s%");
                        });
                });
            });

        $empleados = $query->orderBy('id', 'asc')->paginate(100)->appends($request->all());

        $stats = [
            'total_recaudado' => 0,
            'pagados' => 0,
            'total_empleados' => EmpleadoActivo::count()
        ];

        if ($tipoId) {
            $todosLosPagos = AccionPago::where('accion_tipo_id', $tipoId)->get();
            $stats['total_recaudado'] = $todosLosPagos->sum('monto_item');
            $stats['pagados'] = $todosLosPagos->pluck('empleado_id')->unique()->count();
        }

        return Inertia::render('Empleados/AccionesDePago/Index', [
            'empleados' => $empleados,
            'tiposAccion' => AccionTipo::where('status', '>=', 0)->orderBy('created_at', 'desc')->get(),
            'metodos' => ['Transferencia', 'Pago Móvil', 'Efectivo', 'Divisa'],
            'filters' => $request->only(['search', 'fecha', 'tipo_id']),
            'stats' => $stats
        ]);
    }

    public function storePago(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id',
            'accion_tipo_id' => 'required|exists:accion_tipos,id',
            'fecha_pago' => 'required|date',
            'pagos' => 'required|array|min:1',
            'pagos.*.metodo' => 'required|string',
            'pagos.*.monto' => 'required|numeric|min:0.01',
            'pagos.*.ref' => 'nullable|string|max:50',
        ]);

        DB::transaction(function () use ($request) {
            $tipo = AccionTipo::findOrFail($request->accion_tipo_id);
            $totalRequerido = $tipo->costo_base + ($tipo->costo_adicional ?? 0);
            $totalPagado = AccionPago::where('empleado_id', $request->empleado_id)
                ->where('accion_tipo_id', $request->accion_tipo_id)
                ->sum('monto_item');

            if ($totalPagado >= $totalRequerido) {
                throw new \Exception('Este empleado ya ha completado el pago total requerido.');
            }

            foreach ($request->pagos as $pagoData) {
                $refFinal = $pagoData['ref'] ?? null;

                if ($refFinal) {
                    // Si la referencia termina con '-', es una solicitud de serie
                    $quiereSerie = str_ends_with($refFinal, '-');
                    $refBase = rtrim($refFinal, '-');
                    // Si tiene múltiples guiones, tomar solo la base principal
                    $refBase = explode('-', $refBase)[0];

                    // Verificar si existe la referencia base o alguna variante de serie
                    $existe = AccionPago::where('accion_tipo_id', $request->accion_tipo_id)
                        ->where(function ($q) use ($refBase) {
                            $q->where('ref_item', $refBase)
                                ->orWhere('ref_item', 'like', $refBase . '-%');
                        })->exists();

                    if ($existe && $quiereSerie) {
                        // Si existe y quiere serie, normalizar (renombrar el existente y crear nuevo)
                        $refFinal = $this->normalizarSerieRef($refBase, $request->accion_tipo_id);
                    } else if ($existe && !$quiereSerie) {
                        // Si existe y no quiere serie, buscar el siguiente número disponible
                        $siguiente = $this->getSiguienteNumeroSerie($refBase, $request->accion_tipo_id);
                        if ($siguiente === 1) {
                            $refFinal = $refBase;
                        } else {
                            $refFinal = $refBase . '-' . $siguiente;
                        }
                    } else {
                        // Si no existe, usar la base sin guion
                        $refFinal = $refBase;
                    }
                }

                AccionPago::create([
                    'empleado_id' => $request->empleado_id,
                    'accion_tipo_id' => $request->accion_tipo_id,
                    'fecha_pago' => $request->fecha_pago,
                    'metodo_item' => $pagoData['metodo'],
                    'monto_item' => $pagoData['monto'],
                    'ref_item' => $refFinal,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pagos registrados exitosamente.');
    }

    private function getSiguienteNumeroSerie($refBase, $accionTipoId)
    {
        $items = AccionPago::where('accion_tipo_id', $accionTipoId)
            ->where(function ($q) use ($refBase) {
                $q->where('ref_item', $refBase)
                    ->orWhere('ref_item', 'like', $refBase . '-%');
            })
            ->get();

        $numeros = [];
        foreach ($items as $item) {
            if ($item->ref_item === $refBase) {
                $numeros[] = 0;
            } else {
                $partes = explode('-', $item->ref_item);
                $num = end($partes);
                if (is_numeric($num)) {
                    $numeros[] = (int)$num;
                }
            }
        }

        sort($numeros);
        $siguiente = 1;
        foreach ($numeros as $num) {
            if ($num === $siguiente) {
                $siguiente++;
            } elseif ($num > $siguiente) {
                break;
            }
        }

        return $siguiente;
    }

    public function validarReferencia(Request $request)
    {
        $request->validate([
            'ref' => 'required|string',
            'accion_tipo_id' => 'required|exists:accion_tipos,id',
        ]);

        $ref = $request->ref;
        $accionTipoId = $request->accion_tipo_id;

        // Si termina con guion, siempre está disponible (crea serie)
        if (str_ends_with($ref, '-')) {
            return response()->json(['disponible' => true]);
        }

        // Buscar si existe la referencia o alguna variante de serie
        $refBase = explode('-', $ref)[0];
        $existe = AccionPago::where('accion_tipo_id', $accionTipoId)
            ->where(function ($q) use ($refBase) {
                $q->where('ref_item', $refBase)
                    ->orWhere('ref_item', 'like', $refBase . '-%');
            })->exists();

        return response()->json(['disponible' => !$existe]);
    }
    private function normalizarSerieRef($refBase, $accionTipoId)
    {
        // 1. Buscar TODOS los registros que pertenecen a esta serie
        $items = AccionPago::where('accion_tipo_id', $accionTipoId)
            ->where(function ($q) use ($refBase) {
                $q->where('ref_item', $refBase)
                    ->orWhere('ref_item', 'like', $refBase . '-%');
            })
            ->orderBy('id', 'asc')
            ->get();

        // 2. Si no existe ningún registro, retornar la base
        if ($items->count() === 0) {
            return $refBase;
        }

        // 3. Verificar si existe el registro base (sin guion)
        $baseExistente = $items->firstWhere('ref_item', $refBase);

        if ($baseExistente) {
            // Renombrar el existente a -1
            $baseExistente->update(['ref_item' => $refBase . '-1']);
        }

        // 4. Re-consultar todos los registros actualizados
        $itemsActualizados = AccionPago::where('accion_tipo_id', $accionTipoId)
            ->where(function ($q) use ($refBase) {
                $q->where('ref_item', $refBase)
                    ->orWhere('ref_item', 'like', $refBase . '-%');
            })
            ->orderBy('id', 'asc')
            ->get();

        // 5. Obtener todos los números existentes en la serie
        $numerosExistentes = [];
        foreach ($itemsActualizados as $item) {
            if ($item->ref_item === $refBase) {
                $numerosExistentes[] = 0;
            } else {
                $partes = explode('-', $item->ref_item);
                $numero = end($partes);
                if (is_numeric($numero)) {
                    $numerosExistentes[] = (int)$numero;
                }
            }
        }

        // 6. Ordenar y encontrar el primer número faltante
        sort($numerosExistentes);
        $siguienteNumero = 1;
        foreach ($numerosExistentes as $num) {
            if ($num === $siguienteNumero) {
                $siguienteNumero++;
            } elseif ($num > $siguienteNumero) {
                break;
            }
        }

        // 7. Retornar el nuevo número
        if ($siguienteNumero === 1) {
            return $refBase;
        }

        return $refBase . '-' . $siguienteNumero;
    }
  
    public function limpiarPagos(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id',
            'accion_id' => 'required|exists:accion_tipos,id',
        ]);

        $deleted = AccionPago::where('empleado_id', $request->empleado_id)
            ->where('accion_tipo_id', $request->accion_id)
            ->delete();

        if ($deleted === 0) {
            return redirect()->back()->withErrors(['error' => 'No se encontraron pagos para revertir.']);
        }

        return redirect()->back()->with('success', 'Pagos revertidos exitosamente.');
    }

    public function updateTipo(Request $request, int $id)
    {
        $tipo = AccionTipo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'costo_base' => 'required|numeric|min:0',
            'costo_adicional' => 'nullable|numeric|min:0',
        ]);

        $tipo->update($validated);
        return redirect()->back()->with('success', 'Concepto actualizado correctamente.');
    }

    public function storeTipo(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'costo_base' => 'required|numeric|min:0',
            'costo_adicional' => 'nullable|numeric|min:0',
        ]);

        AccionTipo::create($data);
        return redirect()->back()->with('success', 'Actividad registrada correctamente.');
    }

    public function updatePago(Request $request, int $id)
    {
        $pago = AccionPago::findOrFail($id);

        $validated = $request->validate([
            'ref_item' => 'nullable|string|max:50',
            'monto_item' => 'required|numeric|min:0.01',
            'metodo_item' => 'required|string',
            'fecha_pago' => 'required|date',
        ]);

        if ($request->ref_item && $request->ref_item !== $pago->ref_item) {
            $refOriginal = $request->ref_item;
            $quiereSerie = str_ends_with($refOriginal, '-');
            $refBase = rtrim($refOriginal, '-');
            $refBase = explode('-', $refBase)[0];

            $existeEnOtros = AccionPago::where('accion_tipo_id', $pago->accion_tipo_id)
                ->where('id', '!=', $id)
                ->where(function ($q) use ($refBase) {
                    $q->where('ref_item', $refBase)
                        ->orWhere('ref_item', 'like', $refBase . '-%');
                })->exists();

            if ($existeEnOtros) {
                if (!$quiereSerie) {
                    return redirect()->back()->withErrors([
                        'ref_item' => 'La referencia "' . $refBase . '" ya está en uso. Agregue un guion al final para crear una serie: "' . $refBase . '-"'
                    ])->withInput();
                } else {
                    $nuevaRef = $this->normalizarSerieRef($refBase, $pago->accion_tipo_id);
                    $validated['ref_item'] = $nuevaRef;
                }
            } else {
                $validated['ref_item'] = $refBase;
            }
        } else {
            $validated['ref_item'] = $pago->ref_item;
        }

        $pago->update($validated);
        return redirect()->back()->with('success', 'Pago actualizado correctamente.');
    }

   

    public function destroyPago(int $id)
    {
        $pago = AccionPago::findOrFail($id);
        $pago->delete();

        return redirect()->back()->with('success', 'Pago eliminado correctamente');
    }

    public function eliminarActividad(int $id)
    {
        $tipo = AccionTipo::findOrFail($id);

        AccionPago::where('accion_tipo_id', $id)->delete();
        $tipo->status = -1;
        $tipo->save();

        return redirect()->back()->with('success', 'Actividad y registros eliminados por completo.');
    }

    public function storePagoEspecial(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id',
            'accion_tipo_id' => 'required|exists:accion_tipos,id',
            'fecha_pago' => 'required|date',
            'pagos' => 'required|array|min:1',
            'pagos.*.metodo' => 'required|string',
            'pagos.*.monto' => 'required|numeric|min:0',
            'pagos.*.ref' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $tipo = AccionTipo::findOrFail($request->accion_tipo_id);

            // Verificar que el empleado no tenga ya un pago registrado
            $existe = AccionPago::where('empleado_id', $request->empleado_id)
                ->where('accion_tipo_id', $request->accion_tipo_id)
                ->exists();

            if ($existe) {
                throw new \Exception('Este empleado ya tiene un pago registrado para esta actividad.');
            }

            foreach ($request->pagos as $pagoData) {
                AccionPago::create([
                    'empleado_id' => $request->empleado_id,
                    'accion_tipo_id' => $request->accion_tipo_id,
                    'fecha_pago' => $request->fecha_pago,
                    'metodo_item' => 'Ninguno',
                    'monto_item' =>  0,
                    'ref_item' => $pagoData['ref'] ?? null,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pago especial registrado exitosamente.');
    }
}
