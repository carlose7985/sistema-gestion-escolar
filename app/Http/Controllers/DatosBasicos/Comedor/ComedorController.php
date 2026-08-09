<?php

namespace App\Http\Controllers\DatosBasicos\Comedor;

use App\Http\Controllers\Controller;
use App\Models\Insumo;
use App\Models\InventarioMovimiento;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ComedorController extends Controller
{
    public function index()
    {
        return Inertia::render('DatosBasicos/Cenae/Index', [
            'insumos' => Insumo::orderBy('nombre', 'asc')->get(),
            'movimientos' => InventarioMovimiento::latest('fecha')->paginate(15),
            'historialCierres' => DB::table('historial_cierres')->latest()->get()
        ]);
    }

    // REGISTRAR MOVIMIENTO FUCIONADO (ENTRADA O SALIDA)
    // public function registrarMovimiento(Request $request)
    // {
    //     $request->validate([
    //         'fecha' => 'required|date',
    //         'tipo' => 'required|in:entrada,salida',
    //         'items' => 'required|array|min:1',

    //     ]);

    //     return DB::transaction(function () use ($request) {
    //         $tipo = $request->tipo;
    //         $fechaNueva = \Carbon\Carbon::parse($request->fecha);
    //         $rubrosSnapshot = [];

    //         // --- 1. LÓGICA DE CIERRE INTELIGENTE (Solo para Entradas) ---
    //         if ($tipo === 'entrada') {
    //             // Buscamos la última entrada registrada
    //             $ultimaEntrada = InventarioMovimiento::where('tipo', 'entrada')
    //                 ->orderBy('fecha', 'desc')
    //                 ->first();

    //             if ($ultimaEntrada) {
    //                 $fechaUltima = \Carbon\Carbon::parse($ultimaEntrada->fecha);

    //                 // Si el mes/año de la nueva entrada es distinto al de la última...
    //                 if ($fechaUltima->format('Y-m') !== $fechaNueva->format('Y-m')) {

    //                     // Capturamos el stock actual (lo que sobró del mes anterior)
    //                     $stockActualParaHistorial = Insumo::pluck('stock_actual', 'nombre')->toArray();

    //                     // Calculamos la fecha de cierre: Último día del mes anterior a la nueva entrada
    //                     // Ejemplo: Si entro en 06-2026, el cierre se marca como 30-05-2026
    //                     $fechaCierreCalculada = $fechaNueva->copy()->subMonth()->endOfMonth()->toDateString();

    //                     DB::table('historial_cierres')->insert([
    //                         'fecha_cierre' => $fechaCierreCalculada,
    //                         'detalle_stock' => json_encode($stockActualParaHistorial),
    //                         'motivo_cierre' => "Cierre de inventario periodo: " . $fechaUltima->translatedFormat('F Y'),
    //                         'created_at' => now()
    //                     ]);
    //                 }
    //             }
    //         }

    //         // --- 2. PROCESAR RUBROS Y ACTUALIZAR STOCK EN TABLA INSUMOS ---
    //         foreach ($request->items as $item) {
    //             // lockForUpdate evita que otros procesos modifiquen estos insumos mientras operamos
    //             $insumo = Insumo::where('id', $item['insumo_id'])->lockForUpdate()->first();

    //             if ($insumo) {
    //                 // Nombre para el Snapshot JSON
    //                 $nombreKey = "{$insumo->nombre} {$insumo->peso_medida}{$insumo->unidad_medida}";
    //                 $rubrosSnapshot[$nombreKey] = $item['cantidad'];

    //                 // Cálculo manual del stock
    //                 if ($tipo === 'entrada') {
    //                     $insumo->stock_actual = (float)$insumo->stock_actual + (float)$item['cantidad'];
    //                 } else {
    //                     $insumo->stock_actual = (float)$insumo->stock_actual - (float)$item['cantidad'];
    //                 }

    //                 $insumo->save(); // Persistimos en la tabla Insumos
    //             }
    //         }

    //         // --- 3. GUARDAR EL MOVIMIENTO ÚNICO FUSIONADO ---
    //         InventarioMovimiento::create([
    //             'fecha'           => $request->fecha,
    //             'tipo'            => $tipo,
    //             'rubros_cantidad' => $rubrosSnapshot,
    //             'estudiantes'     => $tipo === 'salida' ? ($request->estudiantes ?? 0) : null,
    //             'cocineras'       => $tipo === 'salida' ? ($request->cocineras ?? 0) : null,
    //             'personal'        => $tipo === 'salida' ? ($request->personal ?? 0) : null,
    //             'descripcion'     => $request->descripcion,
    //         ]);

    //         return back()->with('success', 'Operación procesada. El stock ha sido actualizado.');
    //     });
    // }
    public function registrarMovimiento(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'tipo' => 'required|in:entrada,salida',
            'items' => 'required|array|min:1',
            'estudiantes' => 'nullable|numeric|min:0',
            'cocineras' => 'nullable|numeric|min:0',
            'personal' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request) {
            $tipo = $request->tipo;
            $fechaNueva = \Carbon\Carbon::parse($request->fecha);
            $rubrosSnapshot = [];

            // --- 0. VERIFICAR SI YA EXISTE UN MOVIMIENTO CON ESTA FECHA ---
            $movimientoExistente = InventarioMovimiento::where('fecha', $request->fecha)
                ->where('tipo', $tipo)
                ->first();

            // Si existe, guardamos los rubros del movimiento existente para revertir el stock
            if ($movimientoExistente) {
                // Revertir el stock antes de eliminar el movimiento
                $rubrosAnteriores = $movimientoExistente->rubros_cantidad;
                if (is_string($rubrosAnteriores)) {
                    $rubrosAnteriores = json_decode($rubrosAnteriores, true);
                }

                if ($rubrosAnteriores && is_array($rubrosAnteriores)) {
                    foreach ($rubrosAnteriores as $nombreKey => $cantidad) {
                        // Buscar el insumo por el nombre compuesto
                        $insumo = Insumo::whereRaw("CONCAT(nombre, ' ', peso_medida, unidad_medida) = ?", [$nombreKey])->first();
                        if ($insumo) {
                            // Revertir el stock según el tipo
                            if ($tipo === 'entrada') {
                                $insumo->stock_actual = (float)$insumo->stock_actual - (float)$cantidad;
                            } else {
                                $insumo->stock_actual = (float)$insumo->stock_actual + (float)$cantidad;
                            }
                            $insumo->save();
                        }
                    }
                }

                // Eliminar el movimiento existente
                $movimientoExistente->delete();
            }

            // --- 1. LÓGICA DE CIERRE INTELIGENTE (Solo para Entradas) ---
            if ($tipo === 'entrada') {
                // Buscamos la última entrada registrada (excluyendo la que acabamos de eliminar)
                $ultimaEntrada = InventarioMovimiento::where('tipo', 'entrada')
                    ->where('fecha', '!=', $request->fecha) // Excluir la fecha actual
                    ->orderBy('fecha', 'desc')
                    ->first();

                if ($ultimaEntrada) {
                    $fechaUltima = \Carbon\Carbon::parse($ultimaEntrada->fecha);

                    // Si el mes/año de la nueva entrada es distinto al de la última...
                    if ($fechaUltima->format('Y-m') !== $fechaNueva->format('Y-m')) {
                        // Capturamos el stock actual (lo que sobró del mes anterior)
                        $stockActualParaHistorial = Insumo::pluck('stock_actual', 'nombre')->toArray();

                        // Calculamos la fecha de cierre: Último día del mes anterior a la nueva entrada
                        $fechaCierreCalculada = $fechaNueva->copy()->subMonth()->endOfMonth()->toDateString();

                        // Verificar si ya existe un cierre para esta fecha
                        $cierreExistente = DB::table('historial_cierres')
                            ->where('fecha_cierre', $fechaCierreCalculada)
                            ->first();

                        if (!$cierreExistente) {
                            DB::table('historial_cierres')->insert([
                                'fecha_cierre' => $fechaCierreCalculada,
                                'detalle_stock' => json_encode($stockActualParaHistorial),
                                'motivo_cierre' => "Cierre de inventario periodo: " . $fechaUltima->translatedFormat('F Y'),
                                'created_at' => now()
                            ]);
                        }
                    }
                }
            }

            // --- 2. PROCESAR RUBROS Y ACTUALIZAR STOCK EN TABLA INSUMOS ---
            foreach ($request->items as $item) {
                // lockForUpdate evita que otros procesos modifiquen estos insumos mientras operamos
                $insumo = Insumo::where('id', $item['insumo_id'])->lockForUpdate()->first();

                if ($insumo) {
                    // Nombre para el Snapshot JSON
                    $nombreKey = "{$insumo->nombre} {$insumo->peso_medida}{$insumo->unidad_medida}";
                    $rubrosSnapshot[$nombreKey] = (float)$item['cantidad'];

                    // Cálculo manual del stock
                    if ($tipo === 'entrada') {
                        $insumo->stock_actual = (float)$insumo->stock_actual + (float)$item['cantidad'];
                    } else {
                        $insumo->stock_actual = (float)$insumo->stock_actual - (float)$item['cantidad'];

                        // Validar que el stock no sea negativo
                        if ($insumo->stock_actual < 0) {
                            throw new \Exception("Stock insuficiente para el insumo: {$insumo->nombre}");
                        }
                    }

                    $insumo->save(); // Persistimos en la tabla Insumos
                }
            }

            // --- 3. GUARDAR EL MOVIMIENTO ÚNICO FUSIONADO ---
            InventarioMovimiento::create([
                'fecha'           => $request->fecha,
                'tipo'            => $tipo,
                'rubros_cantidad' => $rubrosSnapshot,
                'estudiantes'     => $tipo === 'salida' ? ($request->estudiantes ?? 0) : null,
                'cocineras'       => $tipo === 'salida' ? ($request->cocineras ?? 0) : null,
                'personal'        => $tipo === 'salida' ? ($request->personal ?? 0) : null,
                'descripcion'     => $request->descripcion,
            ]);

            return back()->with('success', 'Operación procesada. El stock ha sido actualizado.');
        });
    }

    public function updateMovimiento(Request $request, int $id)
    {
        $request->validate([
            'fecha' => 'required|date',
            'tipo' => 'required|in:entrada,salida',
            'items' => 'required|array|min:1',
            'estudiantes' => 'nullable|numeric|min:0',
            'cocineras' => 'nullable|numeric|min:0',
            'personal' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request, $id) {
            // Obtener el movimiento a actualizar
            $movimiento = InventarioMovimiento::findOrFail($id);
            $tipoOriginal = $movimiento->tipo;
            $nuevoTipo = $request->tipo;
            $fechaOriginal = $movimiento->fecha;
            $nuevaFecha = $request->fecha;

            // --- 1. REVERTIR EL STOCK DEL MOVIMIENTO ORIGINAL ---
            $rubrosOriginales = $movimiento->rubros_cantidad;
            if (is_string($rubrosOriginales)) {
                $rubrosOriginales = json_decode($rubrosOriginales, true);
            }

            if ($rubrosOriginales && is_array($rubrosOriginales)) {
                foreach ($rubrosOriginales as $nombreKey => $cantidad) {
                    // Buscar el insumo por el nombre compuesto
                    $insumo = Insumo::whereRaw("CONCAT(nombre, ' ', peso_medida, unidad_medida) = ?", [$nombreKey])->first();
                    if ($insumo) {
                        // Revertir el stock según el tipo original
                        if ($tipoOriginal === 'entrada') {
                            $insumo->stock_actual = (float)$insumo->stock_actual - (float)$cantidad;
                        } else {
                            $insumo->stock_actual = (float)$insumo->stock_actual + (float)$cantidad;
                        }
                        $insumo->save();
                    }
                }
            }

            // --- 2. SI LA FECHA CAMBIÓ, VERIFICAR QUE NO EXISTA OTRO MOVIMIENTO CON ESA FECHA ---
            if ($fechaOriginal !== $nuevaFecha) {
                $movimientoExistente = InventarioMovimiento::where('fecha', $nuevaFecha)
                    ->where('tipo', $nuevoTipo)
                    ->where('id', '!=', $id)
                    ->first();

                if ($movimientoExistente) {
                    throw new \Exception("Ya existe un movimiento de tipo {$nuevoTipo} con la fecha {$nuevaFecha}");
                }
            }

            // --- 3. SI CAMBIA EL TIPO, VERIFICAR QUE NO EXISTA OTRO CON ESA FECHA Y TIPO ---
            if ($tipoOriginal !== $nuevoTipo) {
                $movimientoExistente = InventarioMovimiento::where('fecha', $nuevaFecha)
                    ->where('tipo', $nuevoTipo)
                    ->where('id', '!=', $id)
                    ->first();

                if ($movimientoExistente) {
                    throw new \Exception("Ya existe un movimiento de tipo {$nuevoTipo} con la fecha {$nuevaFecha}");
                }
            }

            // --- 4. PROCESAR LOS NUEVOS RUBROS Y ACTUALIZAR STOCK ---
            $rubrosNuevos = [];

            foreach ($request->items as $item) {
                $insumo = Insumo::where('id', $item['insumo_id'])->lockForUpdate()->first();

                if ($insumo) {
                    // Nombre para el Snapshot JSON
                    $nombreKey = "{$insumo->nombre} {$insumo->peso_medida}{$insumo->unidad_medida}";
                    $rubrosNuevos[$nombreKey] = (float)$item['cantidad'];

                    // Aplicar el nuevo stock según el tipo
                    if ($nuevoTipo === 'entrada') {
                        $insumo->stock_actual = (float)$insumo->stock_actual + (float)$item['cantidad'];
                    } else {
                        $insumo->stock_actual = (float)$insumo->stock_actual - (float)$item['cantidad'];

                        // Validar que el stock no sea negativo
                        if ($insumo->stock_actual < 0) {
                            throw new \Exception("Stock insuficiente para el insumo: {$insumo->nombre}");
                        }
                    }

                    $insumo->save();
                }
            }

            // --- 5. ACTUALIZAR EL MOVIMIENTO ---
            $movimiento->update([
                'fecha'           => $nuevaFecha,
                'tipo'            => $nuevoTipo,
                'rubros_cantidad' => $rubrosNuevos,
                'estudiantes'     => $nuevoTipo === 'salida' ? ($request->estudiantes ?? 0) : null,
                'cocineras'       => $nuevoTipo === 'salida' ? ($request->cocineras ?? 0) : null,
                'personal'        => $nuevoTipo === 'salida' ? ($request->personal ?? 0) : null,
                'descripcion'     => $request->descripcion,
            ]);

            // --- 6. ACTUALIZAR CIERRES SI ES NECESARIO (SOLO PARA ENTRADAS) ---
            if ($nuevoTipo === 'entrada') {
                $fechaNuevaCarbon = \Carbon\Carbon::parse($nuevaFecha);

                // Buscar la última entrada (excluyendo la actual)
                $ultimaEntrada = InventarioMovimiento::where('tipo', 'entrada')
                    ->where('id', '!=', $movimiento->id)
                    ->orderBy('fecha', 'desc')
                    ->first();

                if ($ultimaEntrada) {
                    $fechaUltima = \Carbon\Carbon::parse($ultimaEntrada->fecha);

                    // Si el mes/año de la nueva entrada es distinto al de la última...
                    if ($fechaUltima->format('Y-m') !== $fechaNuevaCarbon->format('Y-m')) {
                        $stockActualParaHistorial = Insumo::pluck('stock_actual', 'nombre')->toArray();
                        $fechaCierreCalculada = $fechaNuevaCarbon->copy()->subMonth()->endOfMonth()->toDateString();

                        // Verificar si ya existe un cierre para esta fecha
                        $cierreExistente = DB::table('historial_cierres')
                            ->where('fecha_cierre', $fechaCierreCalculada)
                            ->first();

                        if (!$cierreExistente) {
                            DB::table('historial_cierres')->insert([
                                'fecha_cierre' => $fechaCierreCalculada,
                                'detalle_stock' => json_encode($stockActualParaHistorial),
                                'motivo_cierre' => "Cierre de inventario periodo: " . $fechaUltima->translatedFormat('F Y'),
                                'created_at' => now()
                            ]);
                        }
                    }
                }
            }

            return back()->with('success', 'Operación procesada. El stock ha sido actualizado.');
        });
    }

    // CRUD DE RUBROS (Insumos)
    public function storeInsumo(Request $request)
    {
        $request->validate(['nombre' => 'required', 'unidad_medida' => 'required', 'peso_medida' => 'required']);
        Insumo::create($request->all());
        return back()->with('success', 'Insumo registrado');
    }

    public function updateInsumo(Request $request, $id)
    {
        $insumo = Insumo::findOrFail($id);
        $insumo->update($request->all());
        return back()->with('success', 'Insumo actualizado');
    }

    public function generarReporte(Request $request)
    {
        $request->validate(['periodo' => 'required']);
        $fechaReporte = \Carbon\Carbon::parse($request->periodo . "-01");
        $mes = $fechaReporte->month;
        $anio = $fechaReporte->year;

        // 1. EXISTENCIA ANTERIOR (Única para todo el reporte)
        // Buscamos el último cierre físico que se hizo ANTES de que empezara este mes
        $ultimoCierreMensual = DB::table('historial_cierres')
            ->where('fecha_cierre', '<', $fechaReporte->startOfMonth()->toDateString())
            ->orderBy('fecha_cierre', 'desc')
            ->first();

        $inventarioInicialSnapshot = $ultimoCierreMensual ? json_decode($ultimoCierreMensual->detalle_stock, true) : [];

        // 2. MOVIMIENTOS DEL MES ACTUAL (Recepciones y Consumos)
        $movimientosMes = InventarioMovimiento::whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->get();

        // RECEPCIONES (Entradas registradas en el mes actual)
        $recepciones = $movimientosMes->where('tipo', 'entrada')->groupBy(function ($item) {
            return $item->fecha->format('Y-m-d');
        });

        // CONSUMOS (Salidas registradas en el mes actual)
        $consumos = $movimientosMes->where('tipo', 'salida')->keyBy(function ($item) {
            return $item->fecha->format('Y-m-d');
        });

        $insumos = Insumo::orderBy('nombre', 'asc')->get();

        $pdf = Pdf::loadView('reportes.comedor_mensual', [
            'insumos' => $insumos,
            'inventarioInicial' => $inventarioInicialSnapshot, // Lo que quedó del mes pasado
            'recepciones' => $recepciones,
            'consumos' => $consumos,
            'mes_nombre' => $fechaReporte->translatedFormat('F'),
            'anio' => $anio,
            'diasDelMes' => $fechaReporte->daysInMonth,
            'fecha_base' => $fechaReporte->format('Y-m-'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream();
    }
}
