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
        $historialCierres = DB::table('historial_cierres')
            ->orderBy('fecha_cierre', 'desc')
            ->get()
            ->map(function ($cierre) {
                // Formatear la fecha a día-mes-año
                $cierre->fecha_cierre_formateada = Carbon::parse($cierre->fecha_cierre)->format('d-m-Y');
                return $cierre;
            });

        return Inertia::render('DatosBasicos/Cenae/Index', [
            'insumos' => Insumo::orderBy('nombre', 'asc')->get(),
            'movimientos' => InventarioMovimiento::with('insumo')->orderBy('fecha', 'desc')->take(20)->get(),
            'historialCierres' => $historialCierres
        ]);
    }

    // CREAR NUEVO RUBRO
    public function storeInsumo(Request $request)
    {
        $request->validate(['nombre' => 'required|unique:insumos', 'unidad_medida' => 'required', 'peso_medida' => 'required']);
        Insumo::create($request->all());
        return back()->with('success', 'Insumo registrado exitosamente');
    }
    /**
     * Update the specified resource in storage.
     */
    public function updateInsumo(Request $request, int $id)
    {
        $insumo = Insumo::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:insumos,nombre,' . $id,
            'unidad_medida' => 'required|string|max:10',
            'peso_medida' => 'required|numeric|min:0',
        ]);

        $insumo->update([
            'nombre' => strtoupper($request->nombre),
            'unidad_medida' => $request->unidad_medida,
            'peso_medida' => $request->peso_medida,
        ]);

        return redirect()->back()->with('success', 'Insumo actualizado exitosamente');
    }

    // REGISTRAR MOVIMIENTO (ENTRADA O SALIDA)
    // public function registrarMovimiento(Request $request)
    // {
    //     $request->validate([
    //         'insumo_id' => 'required',
    //         'tipo' => 'required',
    //         'cantidad' => 'required|numeric',
    //         'fecha' => 'required|date',
    //     ]);

    //     DB::transaction(function () use ($request) {
    //         $insumo = Insumo::find($request->insumo_id);

    //         if ($request->tipo === 'entrada') {
    //             // --- NUEVA LÓGICA DE CONTROL ---
    //             $existeHistorialHoy = DB::table('historial_cierres')
    //                 ->where('fecha_cierre', $request->fecha)
    //                 ->exists();

    //             if (!$existeHistorialHoy) {
    //                 $stockActualParaHistorial = Insumo::pluck('stock_actual', 'nombre')->toArray();

    //                 DB::table('historial_cierres')->insert([
    //                     'fecha_cierre' => $request->fecha,
    //                     'detalle_stock' => json_encode($stockActualParaHistorial),
    //                     'motivo_cierre' => "Sobrantes al recibir despensa",
    //                     'created_at' => now()
    //                 ]);
    //             }

    //             $insumo->increment('stock_actual', $request->cantidad);
    //         } else {
    //             // Salida (Cocina)
    //             $insumo->decrement('stock_actual', $request->cantidad);

    //             // --- REGISTRO DE COMENSALES (SOLO PARA SALIDA) ---
    //             if ($request->filled('estudiantes') || $request->filled('cocineros') || $request->filled('personal')) {
    //                 // Verificar si ya existe registro para esta fecha
    //                 $asistenciaExistente = ComedorAsistencia::where('fecha', $request->fecha)->first();

    //                 if ($asistenciaExistente) {
    //                     // Actualizar existente
    //                     $asistenciaExistente->update([
    //                         'estudiantes' => $request->estudiantes ?? 0,
    //                         'cocineros' => $request->cocineros ?? 0,
    //                         'personal' => $request->personal ?? 0,
    //                     ]);
    //                 } else {
    //                     // Crear nuevo
    //                     ComedorAsistencia::create([
    //                         'fecha' => $request->fecha,
    //                         'estudiantes' => $request->estudiantes ?? 0,
    //                         'cocineros' => $request->cocineros ?? 0,
    //                         'personal' => $request->personal ?? 0,
    //                     ]);
    //                 }
    //             }
    //         }

    //         InventarioMovimiento::create($request->all());
    //     });

    //     return back()->with('success', 'Movimiento procesado exitosamente');
    // }
    public function registrarMovimiento(Request $request)
    {
        // Validamos que venga la fecha, tipo y un array de items
        $request->validate([
            'fecha' => 'required|date',
            'tipo' => 'required|in:entrada,salida',
            'items' => 'required|array|min:1',
            'items.*.insumo_id' => 'required|exists:insumos,id',
            'items.*.cantidad' => 'required|numeric|min:0.01',
            'descripcion' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $tipo = $request->tipo;
            $fecha = $request->fecha;

            // 1. LÓGICA DE CIERRE (Solo si hay una entrada y no se ha cerrado hoy)
            if ($tipo === 'entrada') {
                $existeHistorialHoy = DB::table('historial_cierres')
                    ->where('fecha_cierre', $fecha)
                    ->exists();

                if (!$existeHistorialHoy) {
                    $stockActual = Insumo::pluck('stock_actual', 'nombre')->toArray();
                    DB::table('historial_cierres')->insert([
                        'fecha_cierre' => $fecha,
                        'detalle_stock' => json_encode($stockActual),
                        'motivo_cierre' => "Sobrantes al recibir nueva despensa masiva",
                        'created_at' => now()
                    ]);
                }
            }

            // 2. PROCESAR CADA ITEM DEL ARRAY
            foreach ($request->items as $item) {
                $insumo = Insumo::find($item['insumo_id']);

                if ($tipo === 'entrada') {
                    $insumo->increment('stock_actual', $item['cantidad']);
                } else {
                    $insumo->decrement('stock_actual', $item['cantidad']);
                }

                // Crear el registro del movimiento individual
                InventarioMovimiento::create([
                    'insumo_id' => $item['insumo_id'],
                    'tipo' => $tipo,
                    'cantidad' => $item['cantidad'],
                    'fecha' => $fecha,
                    'descripcion' => $request->descripcion,
                ]);
            }

            // 3. REGISTRO DE COMENSALES (Solo para Salida)
            if ($tipo === 'salida' && ($request->filled('estudiantes') || $request->filled('cocineros'))) {
                // ComedorAsistencia::updateOrCreate(
                //     ['fecha' => $fecha],
                //     [
                //         'estudiantes' => $request->estudiantes ?? 0,
                //         'cocineros' => $request->cocineros ?? 0,
                //         'personal' => $request->personal ?? 0,
                //     ]
                // );
            }
        });

        return back()->with('success', 'Movimientos procesados en masa exitosamente');
    }
    
    public function salidasIndex(Request $request)
    {
        $fecha = $request->fecha ?? null;

        $query = InventarioMovimiento::with('insumo')
            ->where('tipo', 'salida')
            ->orderBy('fecha', 'desc');

        if ($fecha) {
            $query->whereDate('fecha', $fecha);
        }

        $salidas = $query->get();

        // Agrupar por fecha para obtener los comensales
        $fechas = $salidas->pluck('fecha')->unique()->values()->toArray();

        // Para cada salida, obtener los comensales de esa fecha
        $salidasConComensales = $salidas->map(function ($salida) {
            // $asistencia = ComedorAsistencia::where('fecha', $salida->fecha)->first();
            $salida->estudiantes = $asistencia?->estudiantes ?? 0;
            $salida->cocineros = $asistencia?->cocineros ?? 0;
            $salida->personal = $asistencia?->personal ?? 0;
            return $salida;
        });

        return Inertia::render('DatosBasicos/Cenae/Salidas', [
            'salidas' => $salidasConComensales,
            'insumos' => Insumo::orderBy('nombre', 'asc')->get(),
            'fechas' => $fechas,
        ]);
    }

    public function updateSalida(Request $request, int $id)
    {
        $request->validate([
            'cantidad' => 'required|numeric|min:0',
            'estudiantes' => 'nullable|integer|min:0',
            'cocineros' => 'nullable|integer|min:0',
            'personal' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $id) {
            // Actualizar el movimiento
            $movimiento = InventarioMovimiento::findOrFail($id);
            $diferencia = $request->cantidad - $movimiento->cantidad;

            // Actualizar stock del insumo
            $insumo = Insumo::findOrFail($movimiento->insumo_id);
            $insumo->stock_actual += $diferencia;
            $insumo->save();

            // Actualizar movimiento
            $movimiento->cantidad = $request->cantidad;
            $movimiento->save();

            // Actualizar o crear asistencia
            // $asistencia = ComedorAsistencia::where('fecha', $movimiento->fecha)->first();

            // if ($asistencia) {
            //     $asistencia->update([
            //         'estudiantes' => $request->estudiantes ?? 0,
            //         'cocineros' => $request->cocineros ?? 0,
            //         'personal' => $request->personal ?? 0,
            //     ]);
            // } else {
            //     // ComedorAsistencia::create([
            //     //     'fecha' => $movimiento->fecha,
            //     //     'estudiantes' => $request->estudiantes ?? 0,
            //     //     'cocineros' => $request->cocineros ?? 0,
            //     //     'personal' => $request->personal ?? 0,
            //     // ]);
            // }
        });

        return back()->with('success', 'Registro actualizado correctamente');
    }


    public function generarReporte(Request $request)
    {
        $request->validate(['periodo' => 'required']);
        $fecha = \Carbon\Carbon::parse($request->periodo . "-01");
        $mes = $fecha->month;
        $anio = $fecha->year;
        $diasDelMes = $fecha->daysInMonth;
        $insumos = Insumo::orderBy('nombre', 'asc')->get();

        // 1. Inventario Inicial (Sobrante al empezar el mes)
        $cierreInicial = DB::table('historial_cierres')
            ->where('fecha_cierre', '<', $fecha->startOfMonth()->toDateString())
            ->orderBy('fecha_cierre', 'desc')->first();
        $inventarioInicial = $cierreInicial ? json_decode($cierreInicial->detalle_stock, true) : [];

        // 2. Recepciones del mes (Agrupadas por fecha para las columnas Recepción I, II...)
        $recepciones = InventarioMovimiento::where('tipo', 'entrada')
            ->whereMonth('fecha', $mes)->whereYear('fecha', $anio)
            ->get()->groupBy('fecha');

        // 3. Consumos Diarios (Salidas)
        $consumos = InventarioMovimiento::where('tipo', 'salida')
            ->whereMonth('fecha', $mes)->whereYear('fecha', $anio)
            ->get();

        // 4. Asistencia (Comensales)
        $asistencia = DB::table('comedor_asistencias')
            ->whereMonth('fecha', $mes)->whereYear('fecha', $anio)
            ->get()->keyBy('fecha');

        $pdf = Pdf::loadView('reportes.comedor_mensual', [
            'insumos' => $insumos,
            'inventarioInicial' => $inventarioInicial,
            'recepciones' => $recepciones,
            'consumos' => $consumos,
            'asistencia' => $asistencia,
            'mes_nombre' => $fecha->translatedFormat('F'),
            'anio' => $anio,
            'diasDelMes' => $diasDelMes,
            'fecha_base' => $fecha->format('Y-m-'),
            'fecha_obj' => $fecha
        ])->setPaper('a4', 'landscape'); // HOJA HORIZONTAL

        return $pdf->stream();
    }
}