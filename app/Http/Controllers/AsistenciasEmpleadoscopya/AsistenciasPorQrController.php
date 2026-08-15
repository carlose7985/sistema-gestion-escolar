<?php

namespace App\Http\Controllers\Empleados\AsistenciasEmpleados;

use App\Http\Controllers\Controller;
use App\Models\AsistenciaEmpleado;
use App\Models\EmpleadoActivo; // Ajusta según tu modelo real
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class AsistenciasPorQrController extends Controller
{
    public function index()
    {
        return Inertia::render('Empleados/Asistencias/TomarAsistenciaPorQr');
    }

   
    public function store(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'mode'    => 'required|in:entrada,salida',
           
        ]);

        $qrContent = $request->input('qr_code');
        $mode = $request->input('mode');
        $now = Carbon::now();

        // Buscamos al empleado directamente por el código QR impreso
        $empleado = EmpleadoActivo::where('codigo_qr', $qrContent)->first();

        if (!$empleado) {
            return back()->with('last_scan', [
                'success' => false,
                'empleado' => 'No identificado',
                'cargo' => 'QR no registrado en base de datos',
                'hora' => $now->format('h:i A'),
                'mode' => $mode,
                'metodo' => 'Qr'
            ]);
        }

        $asistenciaHoy = AsistenciaEmpleado::where('empleado_id', $empleado->id)
            ->where('fecha', $now->toDateString())
            ->first();

        if ($mode === 'entrada') {
            if ($asistenciaHoy) {
                return back()->with('last_scan', [
                    'success' => false,
                    'empleado' => $empleado->nombres,
                    'cargo' => 'ENTRADA YA REGISTRADA HOY',
                    'hora' => $asistenciaHoy->hora_entrada,
                    'mode' => $mode,
                    'metodo' => 'Qr'
                ]);
            }
            AsistenciaEmpleado::create([
                'empleado_id'  => $empleado->id,
                'fecha'        => $now->toDateString(),
                'hora_entrada' => $now->toTimeString(),
                'status'       => 'Asistio',
            ]);
        } else {
            if (!$asistenciaHoy) {
                return back()->with('last_scan', [
                    'success' => false,
                    'empleado' => $empleado->nombres,
                    'cargo' => 'SIN ENTRADA PREVIA',
                    'hora' => '--:--',
                    'mode' => $mode
                ]);
            }
            $asistenciaHoy->update(['hora_salida' => $now->toTimeString()]);
        }

        return back()->with('last_scan', [
            'success'  => true,
            'empleado' => $empleado->nombres . ' ' . $empleado->apellidos,
            'cargo'    => $empleado->tipo_de_personal,
            'hora'     => $now->format('h:i A'),
            'mode'     => $mode,
        ]);
    }
}
