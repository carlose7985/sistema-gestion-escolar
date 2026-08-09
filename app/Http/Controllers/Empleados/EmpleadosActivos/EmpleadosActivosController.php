<?php

namespace App\Http\Controllers\Empleados\EmpleadosActivos;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmpleadoActivoRequest;
use App\Http\Requests\UpdateEmpleadoActivoRequest;
use App\Models\AreaTrabajo;
use App\Models\AsistenciaEmpleado;
use App\Models\Cargo;
use App\Models\DestinoEmpleado;
use App\Models\EmpleadoActivo;
use App\Models\EmpleadoRetirado;
use App\Models\EvaluacionEmpleado;
use App\Models\HistorialAsistencia;
use App\Models\Institucion;
use App\Models\Logo;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class EmpleadosActivosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $hoy = Carbon::now()->format('Y-m-d');
        $diaSemana = Carbon::now()->locale('es')->dayName; // ej: "lunes"

        $empleados = EmpleadoActivo::query()
            ->with(['permisos'])
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%");
            })
            ->orderBy('id', 'asc')
            ->paginate(4) // Tu límite de 4 por página
            ->withQueryString();

        // --- EL VIGILANTE INTELIGENTE ---
        // En tu controlador, dentro del transform()
        $empleados->getCollection()->transform(function ($emp) use ($hoy, $diaSemana) {
            $status = 'Activo';
            $color = 'emerald';
            $detallePermiso = null;

            // Obtenemos todos los permisos activos del empleado para procesarlos en memoria
            // Se asume que la relación en el modelo Empleado ahora es $emp->permisos
            $permisosActivos = $emp->permisos->where('status', 'Activo');

            // 1. PRIORIDAD MÁXIMA: Vacaciones (tipo = 'Vacacion')
            $vacacion = $permisosActivos->where('tipo', 'Vacacion')
                ->where('fecha_de_inicio', '<=', $hoy)
                ->where('fecha_final', '>=', $hoy)
                ->first();

            if ($vacacion) {
                $status = 'Permiso por Vacaciones';
                $color = 'purple';
                $detallePermiso = "Vacaciones: " . ($vacacion->descripcion ?? 'Disfrute de periodo vacacional');
            }

            // 2. PRIORIDAD MEDIA: Permisos Eventuales (tipo = 'Eventual')
            else {
                $eventual = $permisosActivos->where('tipo', 'Eventual')
                    ->where('fecha_de_inicio', '<=', $hoy)
                    ->where('fecha_final', '>=', $hoy)
                    ->first();

                if ($eventual) {
                    $status = 'Permiso Eventual';
                    $color = 'rose';
                    $detallePermiso = $eventual->descripcion ?? 'Permiso eventual activo';
                }

                // 3. PRIORIDAD BAJA: Permisos Permanentes (tipo = 'Permanente')
                else {
                    // Buscamos si hoy coincide con alguno de sus días fijos
                    $permanente = $permisosActivos->where('tipo', 'Permanente')
                        ->where('dia', ucfirst($diaSemana))
                        ->first();

                    if ($permanente) {
                        $status = 'Permiso Diario';
                        $color = 'amber';
                        $detallePermiso = "Día Fijo ({$permanente->dia}): {$permanente->descripcion}";
                    }

                    // 4. FALLBACK: Situación Laboral Base
                    else {
                        $statusBase = $emp->situacion_laboral ?? 'Activo';
                        $status = $statusBase;

                        // Mapeo de colores para estados directos
                        $colorMap = [
                            'Activo' => 'emerald',
                            'Inactivo' => 'gray',
                            'Comision de Servicio' => 'blue',
                            'Proceso Administrativo' => 'slate',
                            'Reposo' => 'rose', // Por si tienes este estatus en situacion_laboral
                        ];

                        $color = $colorMap[$statusBase] ?? 'slate';
                        $detallePermiso = null;
                    }
                }
            }

            // Inyectamos los valores calculados al objeto del empleado
            $emp->situacion_real = $status;
            $emp->color_real = $color;
            $emp->detalle_permiso = $detallePermiso;

            return $emp;
        });

        return Inertia::render('Empleados/EmpleadosActivos/Index', [
            'empleados' => $empleados,
            'cargos' => Cargo::all(),
            'filters' => $request->only(['search'])
        ]);
    }

    // Vista de Creación
    public function create()
    {
        return Inertia::render('Empleados/EmpleadosActivos/Create', [
            'cargos' => Cargo::all(),
            'areas' => AreaTrabajo::all()
        ]);
    }

    // Guardar Nuevo
    public function store(StoreEmpleadoActivoRequest $request)
    {
        $data = $request->validated();

        // Si tu columna es string, los unimos por comas
        if (is_array($request->area_de_trabajo)) {
            $data['area_de_trabajo'] = implode(', ', $request->area_de_trabajo);
        }
        $data['status_de_actualizacion'] = 'Si';
        $data['situacion_laboral'] = 'Activo';
        $data['fecha_registro'] = now()->format('Y-m-d');

        EmpleadoActivo::create($data);

        return redirect()->route('empleados.activos.listado.index')->with('success', 'Personal registrado correctamente');
    }

    // Vista Detallada
    public function show(int $id)
    {
        $empleado = EmpleadoActivo::findOrFail($id);

        // Convertimos el string de la DB en Array para que React no falle
        if (is_null($empleado->area_de_trabajo)) {
            $empleado->area_de_trabajo = [];
        }

        return Inertia::render('Empleados/EmpleadosActivos/Show', [
            'empleado' => $empleado
        ]);
    }

    // Vista de Edición
    public function edit(int $id)
    {
        $empleado = EmpleadoActivo::findOrFail($id);

        if (is_null($empleado->area_de_trabajo)) {
            $empleado->area_de_trabajo = [];
        }

        return Inertia::render('Empleados/EmpleadosActivos/Edit', [
            'empleado' => $empleado,
            'cargos' => Cargo::all(),
            'areas' => AreaTrabajo::all()
        ]);
    }

    // Actualizar Registro
    public function update(UpdateEmpleadoActivoRequest $request, int $id)
    {
        $empleado = EmpleadoActivo::findOrFail($id);

        // 1. Obtenemos los datos ya validados por el FormRequest
        $data = $request->validated();
        $data['status_de_actualizacion'] = 'Si';

        // 3. Actualizamos el registro en MySQL
        $empleado->update($data);

        // 4. Redirigimos al expediente con mensaje de éxito
        return redirect()->route('empleados.activos.show', $id)
            ->with('success', 'Expediente actualizado correctamente');
    }

    // Cargar Foto (Base64 desde Cámara o Archivo)
    public function updateFoto(Request $request, int $id)
    {
        $emp = EmpleadoActivo::findOrFail($id);

        if ($request->foto) {
            // Borrar foto anterior si existe
            if ($emp->foto) Storage::disk('public')->delete($emp->foto);

            // Procesar Base64
            $image = $request->foto;
            $image = str_replace('data:image/jpeg;base64,', '', $image);
            $image = str_replace(' ', '+', $image);
            $imageName = 'empleados/foto_' . $id . '_' . time() . '.jpg';
            Storage::disk('public')->put($imageName, base64_decode($image));

            $emp->update(['foto' => $imageName]);
        }

        return back()->with('success', 'Fotografía actualizada con exito');
    }

    // Cargar Descriptores Faciales (Base64 desde el Frontend)
    public function updateRostro(Request $request, int $id)
    {
        $request->validate(['rostro_data' => 'required']);
        $emp = EmpleadoActivo::findOrFail($id);
        // Guardamos los descriptores faciales (un array de 128 números) como JSON
        $emp->update(['rostro_data' => $request->rostro_data]);
        return back()->with('success', 'Biometría facial vinculada con éxito');
    }

    // Cargar ID de Huella Dactilar
    public function updateHuella(Request $request, int $id)
    {
        $request->validate(['huella_id' => 'required|unique:empleado_activos,huella_id,' . $id]);
        \App\Models\EmpleadoActivo::findOrFail($id)->update(['huella_id' => $request->huella_id]);
        return back()->with('success', 'Lector de huella vinculado con éxito');
    }

    public function carnet(int $id)
    {
        $empleado = EmpleadoActivo::findOrFail($id);

        if (empty($empleado->codigo_qr)) {
            $empleado->update([
                'codigo_qr' => 'EMP-' . $empleado->cedula . '-' . Str::upper(Str::random(5))
            ]);
        }

        $qrcode = base64_encode(QrCode::format('svg')
            ->size(150)
            ->margin(2)
            ->generate($empleado->codigo_qr));

        // Obtener la institución (Un solo objeto)
        $institucion = Institucion::first();
        $logo = Logo::first();

        $logoDocumento = ($logo && $logo->logo_documentos && Storage::disk('public')->exists($logo->logo_documentos))
            ? storage_path('app/public/' . $logo->logo_documentos)
            : public_path('img/noImgdoc.jpeg');

        $logoInstitucion = ($logo && $logo->logo_institucion && Storage::disk('public')->exists($logo->logo_institucion))
            ? storage_path('app/public/' . $logo->logo_institucion)
            : public_path('img/noImgdoc.jpeg');

        $pdf = Pdf::loadView('reportes.carnet_empleado', [
            'empleado' => $empleado,
            'qr'       => $qrcode,
            'institucion' => $institucion,
            'logoDocumento' => $logoDocumento,
            'logoInstitucion' => $logoInstitucion,
        ]);

        return $pdf->setPaper([0, 0, 190, 290], 'portrait')->stream("Carnet_{$empleado->cedula}.pdf");
    }

    // actualizar status del Registro
    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['situacion_laboral' => 'required|string']);

        EmpleadoActivo::findOrFail($id)->update([
            'situacion_laboral' => $request->situacion_laboral
        ]);

        return back()->with('success', 'Situación laboral actualizada');
    }


    public function updateCargo(Request $request, int $id)
    {
        $request->validate(['tipo_de_personal' => 'required|string']);

        try {
            // Iniciamos la transacción para asegurar que se cumplan AMBAS actualizaciones
            DB::transaction(function () use ($request, $id) {

                // 1. Actualizamos el registro maestro del empleado
                $empleado = EmpleadoActivo::findOrFail($id);
                $empleado->update([
                    'tipo_de_personal' => $request->tipo_de_personal
                ]);

                // 2. Sincronizamos el cargo en toda su tabla de asistencia
                // Buscamos todos los registros donde coincida el empleado_id
                DB::table('asistencia_empleados') // Asegúrate de que el nombre de la tabla sea este
                    ->where('empleado_id', $id)
                    ->update([
                        'tipo_de_cargo' => $request->tipo_de_personal
                    ]);
            });

            return back()->with('success', 'Cargo actualizado en correctamente.');
        } catch (\Exception $e) {
            // Si algo falla, Laravel hace un "rollback" automático y nada se guarda
            return back()->with('error', 'No se pudo sincronizar el cambio de cargo.');
        }
    }

    public function destroy(Request $request, int $id)
    {
        DB::beginTransaction();

        try {
            $empleado = EmpleadoActivo::findOrFail($id);
            $empleadoId = $empleado->id;

            // ---------------------------------------------------------
            // NUEVO: VERIFICAR DESTINO DEL EMPLEADO
            // ---------------------------------------------------------
            // Buscamos si existe un destino registrado para este empleado
            $registroDestino = DestinoEmpleado::where('empleado_id', $empleadoId)->first();
            $destinoFinal = $registroDestino ? $registroDestino->destino : 'NO ESPECIFICADO';

            // ---------------------------------------------------------
            // PASO A: ARCHIVAR ASISTENCIAS
            // ---------------------------------------------------------
            $asistencias = AsistenciaEmpleado::where('empleado_id', $empleadoId)->get();
            $historialData = [];
            $now = Carbon::now();

            foreach ($asistencias as $asistencia) {
                $historialData[] = [
                    'nombres'              => $empleado->nombres,
                    'apellidos'            => $empleado->apellidos,
                    'cedula'               => $empleado->cedula,
                    'fecha_de_asistencia'  => $asistencia->fecha,
                    'status_de_asistencia' => $asistencia->status,
                    'tipo_de_cargo'        => $asistencia->tipo_de_cargo,
                    'created_at'           => $now,
                    'updated_at'           => $now,
                ];
            }

            if (!empty($historialData)) {
                HistorialAsistencia::insert($historialData);
            }

            // Eliminar asistencias originales
            AsistenciaEmpleado::where('empleado_id', $empleadoId)->delete();
            EvaluacionEmpleado::where('empleado_id', $empleadoId)->delete();
            // ---------------------------------------------------------
            // PASO C: MOVER EMPLEADO A RETIRADOS
            // ---------------------------------------------------------
            $employeeData = $empleado->toArray();

            unset(
                $employeeData['id'],
                $employeeData['created_at'],
                $employeeData['updated_at'],
                $employeeData['foto'],
                $employeeData['codigo_qr'],
                $employeeData['rostro_data'],
                $employeeData['huella_id']
            );

            $employeeData['fecha_registro'] = Carbon::today();
            $employeeData['situacion_laboral'] = 'Retirado';

            // ASIGNAMOS EL DESTINO ENCONTRADO (Asegúrate que tu tabla empleados_retirados tenga este campo)
            $employeeData['destino'] = $destinoFinal;

            EmpleadoRetirado::create($employeeData);

            // ---------------------------------------------------------
            // NUEVO: LIMPIAR TABLA DE DESTINOS TEMPORALES
            // ---------------------------------------------------------
            if ($registroDestino) {
                $registroDestino->delete();
            }

            // ---------------------------------------------------------
            // PASO D: ELIMINAR EMPLEADO ACTIVO
            // ---------------------------------------------------------
            $empleado->delete();

            DB::commit();

            return redirect()->route('empleados.activos.listado.index')
                ->with('success', 'Empleado retirado con éxito. Se ha registrado su destino: ' . $destinoFinal);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', "Ocurrió un error al procesar la solicitud: " . $e->getMessage());
        }
    }

    public function check(int $empleadoId)
    {
        // Buscamos el registro
        $registro = DestinoEmpleado::where('empleado_id', $empleadoId)->first();

        // Retornamos un objeto con una llave 'exists' clara
        return response()->json([
            'exists' => !is_null($registro),
            'destino' => $registro ? $registro->destino : null
        ]);
    }

    public function storeDestino(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required',
            'destino' => 'required|string|max:255'
        ]);

        $destino = DestinoEmpleado::updateOrCreate(
            ['empleado_id' => $request->empleado_id], // Condición de búsqueda
            ['destino' => $request->destino]          // Datos a actualizar/crear
        );

        return response()->json(['message' => 'Destino guardado con éxito', 'data' => $destino]);
    }

    public function reportesIndex()
    {
        return Inertia::render('Empleados/EmpleadosActivos/LogImpresiones', [
            'cargos' => \App\Models\Cargo::orderBy('id')->get(),
            'filters' => request()->all(['search', 'tipo_id']),
        ]);
    }
}
