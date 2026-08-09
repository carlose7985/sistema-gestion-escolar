<?php

namespace App\Http\Controllers\Empleados\Permisos;

use App\Http\Controllers\Controller;
use App\Models\EmpleadoActivo;
use App\Models\Permiso;
use App\Models\VigilanteGuardia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PermisosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tipoActual = $request->input('tipo', 'Eventual');
        $hoy = now()->format('Y-m-d');

        $query = Permiso::query()
            ->where('tipo', $tipoActual)
            ->with('empleado');

        // --- LÓGICA DE AGRUPACIÓN PARA PERMANENTES ---
        if ($tipoActual === 'Permanente') {
            $query->select('empleado_id', 'descripcion', 'status', 'tipo', DB::raw('MAX(id) as id'))
                ->groupBy('empleado_id', 'descripcion', 'status', 'tipo');
        }

        $datos = $query->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('empleado', function ($sub) use ($search) {
                    $sub->where('nombres', 'like', "%{$search}%")
                        ->orWhere('cedula', 'like', "%{$search}%");
                })->orWhere('descripcion', 'like', "%{$search}%");
            });
        })
            ->orderBy('id', 'desc')
            ->paginate(7)
            ->withQueryString();

        $datos->getCollection()->transform(function ($permiso) use ($hoy) {
            if ($permiso->tipo === 'Permanente') {
                // Buscamos todos los días asociados a este grupo
                $permiso->dias_agrupados = Permiso::where('empleado_id', $permiso->empleado_id)
                    ->where('tipo', 'Permanente')
                    ->pluck('dia')
                    ->toArray();

                $permiso->status_real = 'Activo';
                $permiso->color = 'purple';
            } else {
                $fechaFinal = $permiso->fecha_final ? $permiso->fecha_final->format('Y-m-d') : null;
                if ($permiso->status === 'Activo' && $fechaFinal && $fechaFinal < $hoy) {
                    $permiso->status_real = 'Vencido';
                    $permiso->color = 'rose';
                } else {
                    $permiso->status_real = $permiso->status;
                    $permiso->color = $permiso->status === 'Activo' ? 'emerald' : 'slate';
                }
            }
            return $permiso;
        });

        return Inertia::render('Empleados/Permisos/GestionPermisos', [
            'datos' => $datos,
            'filters' => $request->only(['search', 'tipo']),
            'tipoActual' => $tipoActual
        ]);
    }   
    
    //Se crea solo esde la vista empleados activo
    public function store(Request $request, int $id)
    {
        $request->validate([
            'tipo' => 'required|in:Eventual,Vacacion,Permanente',
            'descripcion' => 'required|string',
            'dias' => 'nullable|array', // Array para permanentes
            'fecha_de_inicio' => 'nullable|date',
            'fecha_final' => 'nullable|date',
        ]);
        $tipo = $request->tipo;

        // 2. VERIFICACIÓN DE PERMISO ACTIVO (Solo para Eventual y Vacación)
        if ($tipo !== 'Permanente') {
            $existeActivo = \App\Models\Permiso::where('empleado_id', $id)
                ->where('tipo', $tipo)
                ->where('status', 'Activo')
                ->first();

            if ($existeActivo) {
                return back()->with('error', "Ya existe un permiso activo de tipo {$tipo} para este empleado.");
            }
        }

        try {
            $empleado = EmpleadoActivo::findOrFail($id);
            $msgPart = "";
            $fechaInicio = Carbon::parse($request->fecha_de_inicio);
            $fechaFinal = Carbon::parse($request->fecha_final);
            $totalDias = $fechaFinal->diffInDays($fechaInicio) + 1;
            DB::transaction(function () use ($request, $id) {
                if ($request->tipo === 'Permanente') {
                    // Borrar días previos para evitar duplicados si se está reasignando
                    Permiso::where('empleado_id', $id)->where('tipo', 'Permanente')->delete();

                    foreach ($request->dias as $dia) {
                        Permiso::create([
                            'empleado_id' => $id,
                            'tipo' => 'Permanente',
                            'dia' => $dia,
                            'descripcion' => $request->descripcion,
                            'status' => 'Activo',
                            'fecha_registro' => now()
                        ]);
                    }
                } else {
                    Permiso::create([
                        'empleado_id' => $id,
                        'tipo' => $request->tipo,
                        'fecha_de_inicio' => $request->fecha_de_inicio,
                        'fecha_final' => $request->fecha_final,
                        'descripcion' => $request->descripcion,
                        'status' => 'Activo',
                        'fecha_registro' => now(),
                    ]);
                }
            });

            // Mensaje de WhatsApp
            if ($request->tipo === 'Permanente') {
                $listaDias = implode(', ', $request->dias);
                $msgPart = "asignado un Permiso Permanente los días: *{$listaDias}*";
            } else {
                $msgPart = "registrado un Permiso de *{$request->tipo}* hasta el " . Carbon::parse($request->fecha_final)->format('d/m/Y');
            }

            // $mensaje = "✅ *NOTIFICACIÓN DE PERMISO*\n" .
            //     "Hola *{$empleado->nombres}*,\n" .
            //     "Se informa que se ha {$msgPart}.\n" .
            //     "📝 *Motivo:* {$request->descripcion}";

            // Mensaje dirigido al trabajador
            $mensaje = "✅ *COMPROBANTE DE PERMISO*\n" .
                "Estimad@ *{$empleado->nombres} {$empleado->apellidos}*,\n" .
                "Se te informa que ha s{$msgPart}.\n" .
                "📝 *Motivo:* {$request->descripcion}\n" .
                "🗓️ *Desde:* " . $fechaInicio->format('d/m/Y') . "\n" .
                "🗓️ *Hasta:* " . $fechaFinal->format('d/m/Y') . "\n" .
                "⏳ *Total:* {$totalDias} día(s)\n" .
                "Atentamente, *Gestión de Personal*";

            return redirect()->back()->with('success', 'Permiso procesado exitosamente.')->with('whatsapp_message', [
                'url' => "whatsapp://send?phone=" . $this->formatPhone($empleado->telefono) . "&text=" . rawurlencode($mensaje),
                'destinatario' => $empleado->nombres,
                'numero' => $empleado->telefono,
                'mensaje_preview' => $mensaje
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    private function formatPhone($phone)
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        return str_starts_with($clean, '0') ? '58' . substr($clean, 1) : '58' . $clean;
    }


    public function update(Request $request, int $id)
    {
        // 1. Validar según el tipo de permiso que llega en el request
        $request->validate([
            'tipo' => 'required|in:Eventual,Vacacion,Permanente',
            'descripcion' => 'required|string',
            'fecha_de_inicio' => 'nullable|date',
            'fecha_final' => 'nullable|date|after_or_equal:fecha_de_inicio',
            'dias' => 'array', // Solo para permanentes
        ]);

        // 2. Encontrar el registro inicial
        $permisoOriginal = Permiso::findOrFail($id);
        $tipo = $request->tipo;

        try {
            DB::transaction(function () use ($request, $permisoOriginal, $tipo) {

                if ($tipo === 'Permanente') {
                    Permiso::where('empleado_id', $permisoOriginal->empleado_id)
                        ->where('tipo', 'Permanente')
                        ->delete();

                    // Creamos los nuevos días seleccionados
                    foreach ($request->dias as $dia) {
                        Permiso::create([
                            'empleado_id' => $permisoOriginal->empleado_id,
                            'tipo' => 'Permanente',
                            'dia' => $dia,
                            'descripcion' => $request->descripcion,
                            'status' => 'Activo',
                            'fecha_registro' => $permisoOriginal->fecha_registro, // Mantenemos fecha original
                        ]);
                    }
                } else {
                    // LÓGICA INDIVIDUAL (Eventual o Vacación):
                    // Actualizamos el registro único
                    $permisoOriginal->update([
                        'fecha_de_inicio' => $request->fecha_de_inicio,
                        'fecha_final' => $request->fecha_final,
                        'descripcion' => $request->descripcion,
                        'status' => 'Activo',
                    ]);
                }
            });

            return back()->with('success', "Los datos del permiso ({$tipo}) han sido actualizados correctamente.");
        } catch (\Exception $e) {
            return back()->with('error', 'Error al actualizar el permiso: ' . $e->getMessage());
        }
    }

    // --- NUEVO MÉTODO PARA ELIMINAR/REVOCAR ---
    public function destroy(Request $request, $id)
    {
        $permiso = Permiso::findOrFail($id);

        if ($permiso->tipo === 'Permanente') {
            // Si es permanente, eliminamos TODOS los días de ese empleado
            Permiso::where('empleado_id', $permiso->empleado_id)
                ->where('tipo', 'Permanente')
                ->delete();

            // Opcional: Reincorporar al empleado si lo deseas
            EmpleadoActivo::where('id', $permiso->empleado_id)->update(['situacion_laboral' => 'Activo']);

            return back()->with('info', 'Permiso permanente revocado. El empleado vuelve a estatus Activo.');
        }

        // Si es eventual/vacación, eliminación normal
        $permiso->delete();
        return back()->with('success', 'Registro eliminado correctamente.');
    }

    //viene de la tabla asistencia empleados al chequear permisos
    public function renovarPermiso(Request $request)
    {
        DB::beginTransaction();

        // dd($request->permiso_id_actual);
        try {
            $permisoAnterior = Permiso::find($request->permiso_id_actual);
            if ($permisoAnterior) {
                $permisoAnterior->status = 'Permiso Vencido';
                $permisoAnterior->save();
            }

            Permiso::create([
                'empleado_id' => $request->empleado_id,
                'tipo' =>'Eventual',
                'fecha_de_inicio' => $request->fecha_de_inicio,
                'fecha_final' => $request->fecha_final,
                'dia' => $request->dia,
                'descripcion' => $request->descripcion,
                'status' => 'Activo',
                'fecha_registro' => now(),
            ]);

            DB::commit();
            return redirect()->route('recursos.asistencia.empleados.index')->with('success', 'Permiso eventual renovado.');
            //return $this->index($request);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al renovar el permiso: ' . $e->getMessage());
        }
    }

    //viene de la tabla asistencia empleados al chequear permisos
    public function marcarComoVencido(Request $request)
    {
        DB::beginTransaction();
        //dd($request->permiso_id);
        try {
            $permiso = Permiso::find($request->permiso_id);
            if ($permiso) {
                $permiso->status = 'Permiso Vencido';
                $permiso->save();
            }

            $empleado = EmpleadoActivo::where('id', $request->empleado_id)->first();
            if ($empleado) {
                $empleado->situacion_laboral = 'Activo';
                $empleado->save();
            }

            $empleadoV = VigilanteGuardia::where('empleado_id', $request->empleado_id)->first();
            if ($empleadoV) {
                $empleadoV->status = 'Asistio';
                $empleadoV->save();
            }

            DB::commit();
            return redirect()->route('recursos.asistencia.empleados.index')->with('info', 'Permiso culminado, empleado reincorporado.');
            //return $this->index($request);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al marcar permiso como vencido: ' . $e->getMessage());
        }
    }
}