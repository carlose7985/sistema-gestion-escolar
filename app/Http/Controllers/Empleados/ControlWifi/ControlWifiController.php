<?php

namespace App\Http\Controllers\Empleados\ControlWifi;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\WifiAfiliado;
use App\Models\WifiPago;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ControlWifiController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. GESTIÓN DE FECHAS SELECCIONADAS
        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);

        // 2. CÁLCULO DINÁMICO DE AÑOS PARA EL SELECTOR
        // Obtenemos el año del primer pago registrado en la DB
        $primerPago = WifiPago::min('periodo_pagado');
        $anioMinimoDB = $primerPago ? Carbon::parse($primerPago)->year : now()->year;

        // El requisito: Mostrar desde el más antiguo pero siempre incluir los últimos 2 atrás del actual
        $anioHaceDos = now()->subYears(2)->year;

        // El año de inicio será el menor entre el registro más antiguo y hace 2 años
        $startYear = min($anioMinimoDB, $anioHaceDos);

        // El año final será el mayor entre el actual y el que el usuario tenga seleccionado
        $endYear = max(now()->year, $year);

        // Generamos el array: [2024, 2025, 2026...]
        $availableYears = range($startYear, $endYear);

        // 3. LÓGICA DE BÚSQUEDA Y PAGINACIÓN
        $periodoBusqueda = Carbon::createFromDate($year, $month, 1)->format('Y-m-d');

        // Verificamos si ya existe algún pago generado para este mes/año globalmente
        $periodoGeneradoGlobal = WifiPago::where('periodo_pagado', $periodoBusqueda)->exists();

        $afiliados = WifiAfiliado::query()
            ->with(['empleados', 'pagos'])
            ->when($search, function ($query, $search) {
                $query->whereHas('empleados', function ($q) use ($search) {
                    $q->where('nombres', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%");
                })->orWhere('identificador_dispositivo', 'like', "%{$search}%");
            })
            ->orderBy('id', 'asc')
            ->paginate(8) // Ajustado a 10, puedes dejarlo en 5 si prefieres
            ->withQueryString()
            ->through(function ($af) use ($periodoBusqueda) {

                // Buscamos el pago específico de este afiliado para el mes seleccionado
                $pago = $af->pagos->first(function ($p) use ($periodoBusqueda) {
                    return Carbon::parse($p->periodo_pagado)->format('Y-m-d') === $periodoBusqueda;
                });

                return [
                    'id' => $af->id,
                    'empleado' => $af->empleados->nombres . ' ' . $af->empleados->apellidos,
                    'cedula' => $af->empleados->cedula,
                    'identificador' => $af->identificador_dispositivo,
                    'pago_id' => $pago ? $pago->id : null,
                    'estado_pago' => $pago ? $pago->estado : 'Periodo no Generado',
                    'fecha_pago_realizado' => $pago && $pago->fecha_pago
                        ? Carbon::parse($pago->fecha_pago)->format('d-m-Y H:i')
                        : null,
                    'historial_pagos' => $af->pagos
                        ->where('estado', 'Verificado')
                        ->pluck('periodo_pagado')
                        ->map(fn($p) => Carbon::parse($p)->format('Y-m-d'))
                        ->toArray(),
                ];
            });

        return Inertia::render('Empleados/ControlWifi/Index', [
            'afiliados' => $afiliados,
            'availableYears' => $availableYears, // <-- ARRAY DINÁMICO ENVIADO
            'empleadosDisponibles' => EmpleadoActivo::doesntHave('wifiAfiliado')
                ->get(['id', 'nombres', 'apellidos', 'cedula']),
            'totalAfiliados' => WifiAfiliado::count(),
            'estadisticasDeuda' => $this->getEstadisticas(),
            'filters' => [
                'search' => $search,
                'year' => $year,
                'month' => $month,
                'ultimo_periodo' => WifiPago::max('periodo_pagado')
            ],
            'periodoGenerado' => $periodoGeneradoGlobal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleado_activos,id|unique:wifi_afiliados,empleado_id',
            'identificador_dispositivo' => 'required|string|max:50',
        ]);

        DB::transaction(function () use ($request) {
            $afiliado = WifiAfiliado::create($request->all());

            // REGULARIZACIÓN AUTOMÁTICA PARA NUEVOS
            $periodosExistentes = WifiPago::distinct()->pluck('periodo_pagado');
            foreach ($periodosExistentes as $periodo) {
                WifiPago::create([
                    'wifi_afiliado_id' => $afiliado->id,
                    'periodo_pagado' => $periodo,
                    'estado' => 'Verificado', // El nuevo entra "al día"
                    'fecha_pago' => now()
                ]);
            }
        });

        return back()->with('success', 'Afiliado registrado y regularizado.');
    }
  
    public function update(Request $request, int $id)
    {
        $afiliado = WifiAfiliado::findOrFail($id);
        $request->validate(['identificador_dispositivo' => 'required|string|max:50']);
        $afiliado->update(['identificador_dispositivo' => $request->identificador_dispositivo]);
        return back()->with('success', 'Dispositivo actualizado.');
    }

    public function destroy(int $id)
    {
        WifiAfiliado::findOrFail($id)->delete();
        return back()->with('success', 'Afiliado eliminado.');
    }

    public function generarPeriodo(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer'
        ]);

        set_time_limit(0);

        $newPeriodo  = \Carbon\Carbon::createFromDate($request->year, $request->month, 1)->startOfDay();
        $fechaString = $newPeriodo->format('Y-m-d');
        $nombreMes   = $newPeriodo->translatedFormat('F');

        // Validar si ya existe
        if (\App\Models\WifiPago::where('periodo_pagado', $fechaString)->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'El periodo de ' . $nombreMes . ' ya fue generado anteriormente.'
            ]);
        }

        $afiliados = \App\Models\WifiAfiliado::with('empleados')->get();

        foreach ($afiliados as $af) {
            \App\Models\WifiPago::create([
                'wifi_afiliado_id' => $af->id,
                'periodo_pagado'   => $fechaString,
                'estado'           => 'Pendiente'
            ]);
        }

        // Mensaje formateado para copiar
        $mensaje = "📶 *AVISO DE PERÍODO DE PAGO* ⚠️\n" .
            "Estimados afiliados, se informa que el período correspondiente a *{$nombreMes} {$request->year}* ha sido *GENERADO*.\n" .
            "📌 Ya pueden realizar el reporte de su pago correspondiente..🙌"; 
          

        // Retorno compatible con Inertia
        return redirect()->back()->with([
            'success'          => 'Período generado correctamente.',
            'whatsapp_message' => $mensaje
        ]);
    }

    public function togglePago(Request $request, int $id)
    {
        $pago = WifiPago::findOrFail($id);
        $pago->estado = ($pago->estado === 'Pendiente') ? 'Verificado' : 'Pendiente';
        $pago->fecha_pago = ($pago->estado === 'Verificado') ? now() : null;
        $pago->save();

        return back()->with('success', 'Estado del pago actualizado correctamente.');
    }

    private function getEstadisticas()
    {
        return WifiPago::where('estado', 'Pendiente')
            ->select('periodo_pagado', DB::raw('count(*) as deudores'))
            ->groupBy('periodo_pagado')->orderBy('periodo_pagado', 'desc')->get()
            ->map(fn($p) => [
                'mes_nombre' => Carbon::parse($p->periodo_pagado)->locale('es')->isoFormat('MMMM YYYY'),
                'deudores' => $p->deudores
            ]);
    }

    // --- NUEVO MÉTODO: VISTA DE MOROSOS ---
    public function morosos(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year  = $request->input('year', now()->year);

        // Obtenemos afiliados que tienen al menos un pago pendiente
        $afiliadosConDeuda = WifiAfiliado::whereHas('pagos', function ($q) {
            $q->where('estado', 'Pendiente');
        })->with(['empleados', 'pagos' => function ($q) {
            $q->where('estado', 'Pendiente')->orderBy('periodo_pagado', 'asc');
        }])->get();

        $listaMorosos = $afiliadosConDeuda->map(function ($afiliado) {
            $deudas = $afiliado->pagos->map(function ($pago) {
                return \Carbon\Carbon::parse($pago->periodo_pagado)->locale('es')->isoFormat('MMMM YYYY');
            });

            return [
                'id' => $afiliado->id,
                'empleado' => $afiliado->empleados->nombres . ' ' . $afiliado->empleados->apellidos,
                'cedula' => $afiliado->empleados->cedula,
                'cantidad_deuda' => $deudas->count(),
                'meses_deuda' => $deudas->values(),
            ];
        })->values();

        return Inertia::render('Empleados/ControlWifi/Show', [
            'morosos' => $listaMorosos,
            'filters' => [
                'month' => (int) $month,
                'year'  => (int) $year,
            ],
        ]);
    }

    //para el envio de whaasapp
    private function formatearTelefono($numero)
    {
        // 1. Quitamos todo lo que no sea número (elimina el guion)
        // Resultado: 04161231212
        $soloNumeros = preg_replace('/[^0-9]/', '', $numero);

        // 2. Si el número empieza con "0", lo quitamos y ponemos "58" (Venezuela)
        // Resultado: 584161231212
        if (str_starts_with($soloNumeros, '0')) {
            return '58' . substr($soloNumeros, 1);
        }

        return $soloNumeros;
    }
}