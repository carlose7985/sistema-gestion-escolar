<?php


use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\DatosBasicos\ApreciacionController;
use App\Http\Controllers\DatosBasicos\AreaTrabajoController;
use App\Http\Controllers\DatosBasicos\Comedor\ComedorController;
use App\Http\Controllers\DatosBasicos\DiaFestivoController;
use App\Http\Controllers\DatosBasicos\GradosController;
use App\Http\Controllers\DatosBasicos\InmueblesController;
use App\Http\Controllers\DatosBasicos\InstitucionController;
use App\Http\Controllers\DatosBasicos\LogosController;
use App\Http\Controllers\DatosBasicos\NivelesController;
use App\Http\Controllers\DatosBasicos\PlantelesController;
use App\Http\Controllers\Empleados\AccionesDePago\AccionesDePagoController;
use App\Http\Controllers\Empleados\AsistenciasEmpleados\AsistenciaEditorController;
use App\Http\Controllers\Empleados\AsistenciasEmpleados\AsistenciasEmpleadosController;
use App\Http\Controllers\Empleados\CartadeAceptacion\CartaAceptacionController;
use App\Http\Controllers\Empleados\ControlWifi\ControlWifiController;
use App\Http\Controllers\Empleados\DocentesGuardias\GuardiasDocenteController;
use App\Http\Controllers\Empleados\EmpleadosActivos\EmpleadoRecaudoController;
use App\Http\Controllers\Empleados\EmpleadosActivos\EmpleadosActivosController;
use App\Http\Controllers\Empleados\EmpleadosRetirados\EmpleadosRetiradosController;
use App\Http\Controllers\Empleados\Evaluaciones\EvaluacionesEmpleadosController;
use App\Http\Controllers\Empleados\Notificaciones\NotificacionesController;
use App\Http\Controllers\Empleados\Permisos\PermisosController;
use App\Http\Controllers\Empleados\VigilantesGuradias\VigilantesGuardiasController;
use App\Http\Controllers\Estudiantes\Aprobados\EstudiantesAprobadosController;
use App\Http\Controllers\Estudiantes\AprobarReprobar\AprobarReprobarEstudiantesController;
use App\Http\Controllers\Estudiantes\Asistencias\AsistenciaEstudiantesController;
use App\Http\Controllers\Estudiantes\CentroDeImpreciones\ModuloDeImpresionesController;
use App\Http\Controllers\Estudiantes\Estadisticas\EstadisticasController;
use App\Http\Controllers\Estudiantes\EstudiantesCondicionales\ReportesEspecialesController;
use App\Http\Controllers\Estudiantes\EstudiantesPorGrado\EstudiantesNoCeduladosController;
use App\Http\Controllers\Estudiantes\EstudiantesPorGrado\EstudiantesPorGradoController;
use App\Http\Controllers\Estudiantes\Fechas\FechaEntregaDocumentosController;
use App\Http\Controllers\Estudiantes\Graduados\EstudiantesGraduadosController;
use App\Http\Controllers\Estudiantes\Graduandos\GraduandosController;
use App\Http\Controllers\Estudiantes\MatriculaSisge\EstudiantesMatriculaSisgeController;
use App\Http\Controllers\Estudiantes\PanelDeRegistro\GestionDeCuposController;
use App\Http\Controllers\Estudiantes\PanelDeRegistro\PanelDeRegistroEstudiantesController;
use App\Http\Controllers\Estudiantes\PeriodoEscolar\PeriodoEscolarController;
use App\Http\Controllers\Estudiantes\ReporteEspecialWhatsAppController;
use App\Http\Controllers\Estudiantes\Reprobados\EstudiantesReprobadosController;
use App\Http\Controllers\Estudiantes\Responsables\RegistroResponsablesController;
use App\Http\Controllers\Estudiantes\Retirados\EstudiantesRetiradosController;
use App\Http\Controllers\Estudiantes\Unisex\UnisexController;
use App\Http\Controllers\Estudiantes\Zonificacion\ZonificarEstudiantesController;
use App\Http\Controllers\ExportDocumentos\ExportDocEmpleadosPdfController;
use App\Http\Controllers\ExportDocumentos\ExportDocEstudiantesActivosController;
use App\Http\Controllers\ExportDocumentos\ExportDocEstudiantesCalificadosController;
use App\Http\Controllers\ExportDocumentos\ExportDocEstudiantesController;
use App\Http\Controllers\ExportDocumentos\ExportDocEstudiantesInactivosController;
use App\Http\Controllers\GlobalesSearchAndQuist\GlobalSearchController;
use App\Http\Controllers\GlobalesSearchAndQuist\QuickStatsController;
use App\Http\Controllers\ModulosIndex\ReporteAsistencias\ModuloReporteAsistenciaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportesAsistencia\ReporteAsistenciasExcellMensualesController;
use App\Http\Controllers\ReportesAsistencia\ReporteAsitenciasPdfMensualesController;
use App\Http\Controllers\ReportesAsistencia\WhatsAppController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

//Datos basicos
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo de Datos Básicos
    Route::prefix('datos-basicos')->name('settings.')->group(function () {
        // Rutas Index
        Route::get('/', function () {
            return Inertia::render('DatosBasicos/Rutas/RutasIndex');
        })->name('index');

        // Rutas de Institución
        Route::get('/institucion', [InstitucionController::class, 'index'])->name('institucion.index');
        Route::post('/institucion', [InstitucionController::class, 'store'])->name('institucion.store');
        Route::get('/institucion/imprimir', [InstitucionController::class, 'imprimir'])->name('institucion.imprimir');
        // Rutas de Niveles
        Route::get('/institucion/niveles', [NivelesController::class, 'index'])->name('institucion.niveles');
        Route::post('/institucion/niveles', [NivelesController::class, 'store'])->name('institucion.niveles.store');
        Route::post('/institucion/niveles/toggle', [NivelesController::class, 'toggle'])->name('institucion.niveles.toggle');
        // Rutas de Inmuebles
        Route::get('/institucion/inmuebles', [InmueblesController::class, 'index'])->name('institucion.inmuebles.index');
        Route::post('/institucion/inmuebles', [InmueblesController::class, 'store'])->name('institucion.inmuebles.store');
        Route::delete('/institucion/inmuebles{id}', [InmueblesController::class, 'destroy'])->name('institucion.inmuebles.destroy');
        Route::post('/areas/store-fast', [InmueblesController::class, 'storeFastArea'])->name('areas.storeFast');
        // Rutas de Grados
        Route::get('/grados', [GradosController::class, 'index'])->name('grados.index');
        Route::post('/grados/store', [GradosController::class, 'store'])->name('grados.store');
        Route::post('/grados/toggle/{id}', [GradosController::class, 'toggle'])->name('grados.toggle');
        // Rutas de Grados
        Route::get('/areas', [AreaTrabajoController::class, 'index'])->name('areas.index');
        Route::post('/areas/store', [AreaTrabajoController::class, 'store'])->name('areas.store');
        Route::post('/areas/toggle/{id}', [AreaTrabajoController::class, 'toggle'])->name('areas.toggle');
        // Rutas de Logos
        Route::get('/logos', [LogosController::class, 'index'])->name('logos.index');
        Route::post('/logos/store', [LogosController::class, 'store'])->name('logos.store');
        // Rutas de dias Festivos
        Route::get('/festivos', [DiaFestivoController::class, 'index'])->name('festivos.index');
        Route::post('/festivos/store', [DiaFestivoController::class, 'store'])->name('festivos.store');
        Route::post('/festivos/asistencia/store', [DiaFestivoController::class, 'storeFestivo'])->name('festivos.asistencia.store');
        Route::delete('/festivos/destroy{id}', [DiaFestivoController::class, 'destroy'])->name('festivos.destroy');

        Route::get('/apreciaciones', [ApreciacionController::class, 'index'])->name('apreciaciones.index');
        Route::post('/apreciaciones/store', [ApreciacionController::class, 'store'])->name('apreciaciones.store');
        Route::put('/apreciaciones/update/{id}', [ApreciacionController::class, 'update'])->name('apreciaciones.update');
    });
});

//Reportes y Asistencias empleados y estudiantes
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo Recursos
    Route::prefix('reportes-asistencias')->name('recursos.')->group(function () {
        // Ruta del Modulo Index
        // Rutas index
        Route::get('/', function () {
            return Inertia::render('RutasAsistenciasReportes/Index');
        })->name('index');
        // Rutas de Asistencia Empleados
        Route::get('/asistencia/empleados', [AsistenciasEmpleadosController::class, 'index'])->name('asistencia.empleados.index');
        Route::get('/asistencia/empleados/create', [AsistenciasEmpleadosController::class, 'create'])->name('asistencia.empleados.create');
        Route::post('/asistencia/empleados/store', [AsistenciasEmpleadosController::class, 'store'])->name('asistencia.empleados.store');
        Route::post('/asistencia/empleados/actualizar/guardia', [AsistenciasEmpleadosController::class, 'actualizarGuardiaDiaria'])->name('asistencia.empleados.actualizar.guardia');
        Route::get('/asistencia/empleados/edit', [AsistenciaEditorController::class, 'index'])->name('asistencia.empleados.edit');
        Route::get('/asistencia/empleados/actualizar', [AsistenciaEditorController::class, 'actualizar'])->name('asistencia.empleados.actualizar');
        Route::put('/asistencia/empleados/update', [AsistenciaEditorController::class, 'update'])->name('asistencia.empleados.update');

        // Ruta reporte WhatsApp
        Route::get('/reportes/whatsapp', [WhatsAppController::class, 'index'])->name('reportes.whatsapp');
        Route::get('/whatsapp/preview', [WhatsAppController::class, 'previewMessage'])->name('whatsapp.preview');
        Route::post('/whatsapp/send', [WhatsAppController::class, 'sendMessage'])->name('whatsapp.send');

        // Ruta reporte mensual pdf
        Route::get('/reportes/mensualpdf', [ReporteAsitenciasPdfMensualesController::class, 'index'])->name('reportes.mensualpdf');

        // Ruta reporte mensual excell
        Route::get('/reportes/mensualexcell', [ReporteAsistenciasExcellMensualesController::class, 'index'])->name('reportes.mensualexcell');
        Route::get('/reportes/generar/excel', [ReporteAsistenciasExcellMensualesController::class, 'generarExcel'])->name('reportes.generar.excel');

        // Rutas de Asistencia Estudiantes
        Route::get('/asistencia/estudiantes', [AsistenciaEstudiantesController::class, 'index'])->name('asistencia.estudiantes.index');
        Route::post('/asistencia/estudiantes/store', [AsistenciaEstudiantesController::class, 'store'])->name('asistencia.estudiantes.store');
        Route::post('/scan/formulario/asistencia', [AsistenciaEstudiantesController::class, 'scanFormularioAsistencia'])->name('scan.formulario.asistencia');
       
    
    
        });
});

// Empleados Activos
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo empleados activos
    Route::prefix('empleados-activos')->name('empleados.activos.')->group(function () {
        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Empleados/Rutas/RutasActivosIndex');
        })->name('index');    
        
        // Rutas cartas de aceptacion
        Route::get('/carta/aceptacion', [CartaAceptacionController::class, 'index'])->name('carta.aceptacion.index');
        Route::post('/carta/aceptacion', [CartaAceptacionController::class, 'store'])->name('carta.aceptacion.store');
        Route::delete('/carta/aceptacion/{id}', [CartaAceptacionController::class, 'destroy'])->name('carta.aceptacion.destroy');

        // Rutas empleados activos listados
        Route::get('/listado', [EmpleadosActivosController::class, 'index'])->name('listado.index');
        Route::get('/create', [EmpleadosActivosController::class, 'create'])->name('create');
        Route::get('/show/{id}', [EmpleadosActivosController::class, 'show'])->name('show');
        Route::get('/edit/{id}', [EmpleadosActivosController::class, 'edit'])->name('edit');
        Route::post('/store', [EmpleadosActivosController::class, 'store'])->name('store');
        Route::put('/update/{id}', [EmpleadosActivosController::class, 'update'])->name('update');
        Route::delete('/delete/{id}', [EmpleadosActivosController::class, 'destroy'])->name('destroy');
        Route::post('/foto/{id}', [EmpleadosActivosController::class, 'updateFoto'])->name('foto');
        Route::post('/status/{id}', [EmpleadosActivosController::class, 'updateStatus'])->name('updateStatus');
        Route::post('/cargo/{id}/', [EmpleadosActivosController::class, 'updateCargo'])->name('updateCargo');
        Route::get('/carnet{id}', [EmpleadosActivosController::class, 'carnet'])->name('carnet');
        Route::get('/destinos/empleados/check/{empleadoId}', [EmpleadosActivosController::class, 'check'])->name('destinos.empleados.check');
        Route::post('/destinos/empleados/storeDestino', [EmpleadosActivosController::class, 'storeDestino'])->name('destinos.empleados.storeDestino');
        Route::get('/centro/de/impresiones', [EmpleadosActivosController::class, 'reportesIndex'])->name('centro.impresiones');
        // Rutas notificaciones empleados
        Route::get('/notificaciones', [NotificacionesController::class, 'index'])->name('notificaciones.index');
    });
});

// Empleados Inactivos
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo Permisos
    Route::prefix('empleados-inactivos')->name('empleados.inactivos.')->group(function () {

        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Empleados/Rutas/RutasInactivosIndex');
        })->name('index');
        // Rutas empleados retirados
        Route::get('/retirados', [EmpleadosRetiradosController::class, 'index'])->name('retirados.index');

        // Rutas global Permisos 
        Route::get('/permisos/', [PermisosController::class, 'index'])->name('permisos.index');
        Route::post('/permisos/{id}/store', [PermisosController::class, 'store'])->name('permisos.store');
        Route::put('/permisos/{id}/update', [PermisosController::class, 'update'])->name('permisos.update');
        Route::post('/permisos/renovar', [PermisosController::class, 'renovarPermiso'])->name('permisos.renovar');
        Route::post('/permisos/vencer', [PermisosController::class, 'marcarComoVencido'])->name('permisos.vencer');
        Route::delete('/permisos/destroy/{id}', [PermisosController::class, 'destroy'])->name('permisos.destroy');


       });
});

// Empleados acciones generales
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo empleados acciones generales
    Route::prefix('empleados-acciones')->name('empleados.acciones.')->group(function () {
        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Empleados/Rutas/RutasAccionesGeneralesIndex');
        })->name('index');
        // Rutas empleados red wifi
        Route::get('/wifi', [ControlWifiController::class, 'index'])->name('wifi.index');
        Route::post('/wifi/store', [ControlWifiController::class, 'store'])->name('wifi.store');
        Route::put('/wifi/update/{id}', [ControlWifiController::class, 'update'])->name('wifi.update');
        Route::delete('/wifi/destroy/{id}', [ControlWifiController::class, 'destroy'])->name('wifi.destroy');
        Route::post('/wifi/generar-periodo', [ControlWifiController::class, 'generarPeriodo'])->name('wifi.generar.periodo');
        Route::post('/wifi/toggle/{pagoId}', [ControlWifiController::class, 'togglePago'])->name('wifi.toggle');
        Route::get('/wifi/morosos', [ControlWifiController::class, 'morosos'])->name('wifi.morosos');
        // Rutas asignar tallas y profesiones empleados
        Route::get('/recaudos', [EmpleadoRecaudoController::class, 'index'])->name('recaudos.index');
        Route::post('/store', [EmpleadoRecaudoController::class, 'store'])->name('recaudos.store');
        Route::delete('/destroy/{id}', [EmpleadoRecaudoController::class, 'destroy'])->name('recaudos.destroy');
        Route::get('/pdf', [EmpleadoRecaudoController::class, 'imprimir'])->name('recaudos.imprimir');

        // Rutas guardias de docentes
        Route::get('/guardias/docentes', [GuardiasDocenteController::class, 'index'])->name('guardias.docentes.index');
        Route::post('/guardias/docentes/store', [GuardiasDocenteController::class, 'store'])->name('guardias.docentes.store');

        // Rutas guardias de vigilantes
        Route::get('/guardias/vigilantes', [VigilantesGuardiasController::class, 'index'])->name('guardias.vigilantes.index');
        Route::post('/guardias-vigilantes/store', [VigilantesGuardiasController::class, 'store'])->name('guardias.vigilantes.store');
        Route::put('/guardias-vigilantes/update/{id}', [VigilantesGuardiasController::class, 'update'])->name('guardias.vigilantes.update');
        Route::delete('/guardias/vigilantes/destroy/{id}', [VigilantesGuardiasController::class, 'destroy'])->name('guardias.vigilantes.destroy');
        Route::get('/guardias/vigilantes/pdf', [VigilantesGuardiasController::class, 'generarPdf'])->name('guardias.vigilantes.pdf');

        //Ruta evaluaciones empleados 
        Route::get('/evaluaciones', [EvaluacionesEmpleadosController::class, 'index'])->name('evaluaciones.index');
        Route::post('/evaluaciones', [EvaluacionesEmpleadosController::class, 'store'])->name('evaluaciones.store');
        Route::put('/evaluaciones/{id}', [EvaluacionesEmpleadosController::class, 'update'])->name('evaluaciones.update');
        Route::post('/evaluaciones/bulk/store', [EvaluacionesEmpleadosController::class, 'bulkStore'])->name('evaluaciones.bulkStore');
        Route::get('/evaluaciones/gestion', [EvaluacionesEmpleadosController::class, 'gestion'])->name('evaluaciones.gestion');
        Route::get('/evaluaciones/historial/{empleado}', [EvaluacionesEmpleadosController::class, 'obtenerHistorialEvaluaciones'])->name('evaluaciones.historial');
        Route::get('/evaluaciones/reporte/pdf', [EvaluacionesEmpleadosController::class, 'reporteGeneral'])->name('evaluaciones.reporte.general');

        //Ruta acciones de pagos
        Route::get('/pagos', [AccionesDePagoController::class, 'index'])->name('pagos.index');
        Route::post('/pagos/store', [AccionesDePagoController::class, 'storePago'])->name('pagos.store');
        Route::put('/pagos/update/{id}', [AccionesDePagoController::class, 'updatePago'])->name('pagos.update');
        Route::delete('/pagos/destroy/{id}', [AccionesDePagoController::class, 'destroyPago'])->name('pagos.destroy');
        Route::get('/imprimir/reportes/pagos/{id}', [AccionesDePagoController::class, 'imprimirReporte'])->name('pagos.imprimir.reporte');
        Route::post('/tipos', [AccionesDePagoController::class, 'storeTipo'])->name('tipos.store');
        Route::put('/tipos/{id}', [AccionesDePagoController::class, 'updateTipo'])->name('tipos.update');
        Route::post('/tipos/{id}/cerrar', [AccionesDePagoController::class, 'cerrarActividad'])->name('tipos.cerrar');
        Route::delete('/tipos/{id}', [AccionesDePagoController::class, 'eliminarActividad'])->name('tipos.delete');
        Route::post('/tipos/{id}/reabrir', [AccionesDePagoController::class, 'reabrirActividad'])->name('tipos.reabrir');
    });
});

// Estudiantes paneles de registro
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo estudiantes panel de registro
    Route::prefix('estudiantes-registro')->name('estudiantes.registro.')->group(function () {

        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Estudiantes/Rutas/RutasRegistrosIndex');
        })->name('index');

        // Rutas asignacio de cupos
        Route::get('/asignacion/cupo', [GestionDeCuposController::class, 'index'])->name('asignacion.cupo.index');
        Route::post('/asignacion/cupo', [GestionDeCuposController::class, 'store'])->name('asignacion.cupo.store');
        Route::put('/asignacion/cupo/update/{id}', [GestionDeCuposController::class, 'update'])->name('asignacion.cupo.update');
        Route::patch('/asignacion/cupo/status/{id}', [GestionDeCuposController::class, 'updateStatus'])->name('asignacion.cupo.status');

        //Ruta registrar estudiante
        Route::get('/selecciona/grado', [PanelDeRegistroEstudiantesController::class, 'index'])->name('selecciona.grado');
        Route::get('/selecciona/responsable', [PanelDeRegistroEstudiantesController::class, 'seleccionaResponsable'])->name('selecciona.responsable');
        Route::get('/crear/estudiante', [PanelDeRegistroEstudiantesController::class, 'createEstudiante'])->name('crear.estudiante');
        Route::post('/guardar/estudiante', [PanelDeRegistroEstudiantesController::class, 'storeEstudiante'])->name('guardar.estudiante');
        Route::post('/buscar/responsable', [PanelDeRegistroEstudiantesController::class, 'buscarResponsable'])->name('buscar.responsable');
        Route::post('/guardar/responsable', [PanelDeRegistroEstudiantesController::class, 'guardarResponsable'])->name('guardar.responsable');
        Route::post('/scan/formulario', [PanelDeRegistroEstudiantesController::class, 'scanFormulario'])->name('scan.formulario');

        // Rutas responsables activos listados
        Route::get('/responsables', [RegistroResponsablesController::class, 'index'])->name('responsables.index');
        Route::post('/responsables/store', [RegistroResponsablesController::class, 'store'])->name('responsables.store');
        Route::put('/responsables/update/{id}', [RegistroResponsablesController::class, 'update'])->name('responsables.update');
        Route::delete('/responsables/delete/{id}', [RegistroResponsablesController::class, 'destroy'])->name('responsables.destroy');
        Route::patch('/responsables/{id}', [RegistroResponsablesController::class, 'updateStatus'])->name('responsables.updateStatus');
    });
});

// Rutas generales estudiantes activos
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo empleados activos
    Route::prefix('estudiantes-activos')->name('estudiantes.activos.')->group(function () {
        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Estudiantes/Rutas/RutasActivosIndex');
        })->name('index');

        // Rutas estudiantes activos por grado listados
        Route::get('/listado', [EstudiantesPorGradoController::class, 'index'])->name('listado.index');
        Route::get('/listado/show/{grado_id}', [EstudiantesPorGradoController::class, 'show'])->name('listado.show');
        Route::get('/listado/edit/{id}', [EstudiantesPorGradoController::class, 'edit'])->name('listado.edit');
        Route::put('/listado/update/{id}', [EstudiantesPorGradoController::class, 'update'])->name('listado.update');
        Route::delete('/listado/destroy/{id}', [EstudiantesPorGradoController::class, 'destroy'])->name('listado.destroy');
        Route::get('/listado/global/search', [EstudiantesPorGradoController::class, 'globalSearch'])->name('listado.global.search');
        Route::post('/listado/cambiar/grado', [EstudiantesPorGradoController::class, 'cambiarGrado'])->name('listado.cambiar.grado');
        Route::patch('/listado/update/responsable/{id}', [EstudiantesPorGradoController::class, 'updateResponsable'])->name('listado.update.responsable');
        Route::post('/listado/graduate', [EstudiantesPorGradoController::class, 'graduate'])->name('listado.graduate');
        Route::post('/listado/guardar/responsable', [EstudiantesPorGradoController::class, 'guardarResponsable'])->name('listado.guardar.responsable');
        Route::post('/listado/buscar/responsable', [EstudiantesPorGradoController::class, 'buscarResponsable'])->name('listado.buscar.responsable');
        Route::post('/listado/asignar/grados', [EstudiantesPorGradoController::class, 'asignacionMasivaDeGrados'])->name('listado.asignar.grados');

        //Rutas estudiantes activos aprobar reprobar
        Route::get('/aprobar/reprobar', [AprobarReprobarEstudiantesController::class, 'index'])->name('aprobar.reprobar.index');
        Route::get('/aprobar/reprobar/show/{id}', [AprobarReprobarEstudiantesController::class, 'show'])->name('aprobar.reprobar.show');
        Route::post('/aprobar/reprobar/store', [AprobarReprobarEstudiantesController::class, 'store'])->name('aprobar.reprobar.store');
        Route::post('/change/periodo/escolar', [AprobarReprobarEstudiantesController::class, 'abrirInscripcion'])->name('change.periodo.escolar');
        Route::post('/fecha/entrega/documentos/store', [FechaEntregaDocumentosController::class, 'store'])->name('fecha.entrega.documentos.store');
        Route::get('/fecha/entrega/documentos', [FechaEntregaDocumentosController::class, 'index'])->name('fecha.entrega.documentos.index');
        Route::put('/fecha/entrega/documentos/update/{id}', [FechaEntregaDocumentosController::class, 'update'])->name('fecha.entrega.documentos.update');

        //Rutas estudiantes activos aprobados
        Route::get('/aprobados', [EstudiantesAprobadosController::class, 'index'])->name('aprobados.index');
        Route::patch('/aprobados/update/{id}', [EstudiantesAprobadosController::class, 'update'])->name('aprobados.update');
        Route::put('/aprobados/reprobar/{id}', [EstudiantesAprobadosController::class, 'reprobar'])->name('aprobados.reprobar');
        Route::delete('/aprobados/destroy/{id}', [EstudiantesAprobadosController::class, 'destroy'])->name('aprobados.destroy');

        //Rutas estudiantes activos reprobados
        Route::get('/reprobados', [EstudiantesReprobadosController::class, 'index'])->name('reprobados.index');
        Route::put('/reprobados/update/{id}', [EstudiantesReprobadosController::class, 'update'])->name('reprobados.update');
        Route::post('/reprobados/promover/{id}', [EstudiantesReprobadosController::class, 'promover'])->name('reprobados.promover');
        Route::delete('/reprobados/destroy/{id}', [EstudiantesReprobadosController::class, 'destroy'])->name('reprobados.destroy');
    });
});

// Rutas generales estudiantes inactivos
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo estudiantes  inactivos
    Route::prefix('estudiantes-inactivos')->name('estudiantes.inactivos.')->group(function () {

        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Estudiantes/Rutas/RutasInactivosIndex');
        })->name('index');

        // Rutas estudiantes inactivos retirados
        Route::get('/retirados', [EstudiantesRetiradosController::class, 'index'])->name('retirados.index');
        Route::put('/retirados/update/{id}', [EstudiantesRetiradosController::class, 'update'])->name('retirados.update');
        Route::post('/retirados/asignar/grado{id}', [EstudiantesRetiradosController::class, 'reingresar'])->name('retirados.reingresar');

        // Rutas estudiantes inactivos graduados 
        Route::get('/graduados', [EstudiantesGraduadosController::class, 'index'])->name('graduados.index');
        Route::get('/graduados/create', [EstudiantesGraduadosController::class, 'create'])->name('graduados.create');
        Route::post('/graduados/store', [EstudiantesGraduadosController::class, 'store'])->name('graduados.store');
        Route::put('/graduados/update/{id}', [EstudiantesGraduadosController::class, 'update'])->name('graduados.update');

        // Rutas estudiantes inactivos sisge 
        Route::get('/sisge', [EstudiantesMatriculaSisgeController::class, 'index'])->name('sisge.index');
        Route::patch('/sisge/update/sis/{id}', [EstudiantesMatriculaSisgeController::class, 'updateMatriculaSisge'])->name('sisge.update.sis');
        Route::put('/sisge/update/{id}', [EstudiantesMatriculaSisgeController::class, 'update'])->name('sisge.update');
    });
});

// Rutas generales acciones estudiantes 
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo estudiantes acciones
    Route::prefix('estudiantes-acciones')->name('estudiantes.acciones.')->group(function () {
        // Rutas  index
        Route::get('/', function () {
            return Inertia::render('Estudiantes/Rutas/RutasAccionesGeneralesIndex');
        })->name('index');

        // Rutas estudiantes acciones estadisticas
        Route::get('/estadisticas', [EstadisticasController::class, 'index'])->name('estadisticas.index');
        Route::post('/estadisticas/store', [EstadisticasController::class, 'store'])->name('estadisticas.store');
        Route::put('/estadisticas/update/{id}', [EstadisticasController::class, 'update'])->name('estadisticas.update');
        Route::get('/estadisticas/show/{id}', [EstadisticasController::class, 'show'])->name('estadisticas.show');
        Route::post('/estadisticas/apertura', [EstadisticasController::class, 'apertura'])->name('estadisticas.apertura');

        // Rutas estudiantes acciones periodos escolares
        Route::get('/periodo/escolar', [PeriodoEscolarController::class, 'index'])->name('periodo.escolar.index');
        Route::post('/periodo/escolar/store', [PeriodoEscolarController::class, 'store'])->name('periodo.escolar.store');
        Route::put('/periodo/escolar/update/{id}', [PeriodoEscolarController::class, 'update'])->name('periodo.escolar.update');
        Route::post('/periodo/escolar/toggle/{periodo_escolar}', [PeriodoEscolarController::class, 'toggleInscripcion'])->name('periodo.escolar.toggle');

        // Rutas estudiantes acciones zonificacion estudiantes
        Route::get('/zonificacion', [ZonificarEstudiantesController::class, 'index'])->name('zonificacion.index');
        Route::get('/zonificacion/seleccionar', [ZonificarEstudiantesController::class, 'seleccionar'])->name('zonificacion.seleccionar');
        Route::post('/zonificacion/store', [ZonificarEstudiantesController::class, 'store'])->name('zonificacion.store');
        Route::put('/zonificacion/update/{id}', [ZonificarEstudiantesController::class, 'update'])->name('zonificacion.update');
        Route::delete('/zonificacion/destroy/{id}', [ZonificarEstudiantesController::class, 'destroy'])->name('zonificacion.destroy');
        Route::put('/zonificacion/cambiar/plantel/{id}', [ZonificarEstudiantesController::class, 'cambiarPlantel'])->name('zonificacion.cambiar.plantel');
        Route::resource('/planteles', PlantelesController::class)->names('planteles');

        // Rutas estudiantes acciones zonificacion estudiantes
        Route::get('/graduandos', [GraduandosController::class, 'index'])->name('graduandos.index');
        Route::get('/graduandos/imprimir', [GraduandosController::class, 'imprimir'])->name('graduandos.imprimir');
        Route::patch('/graduandos/update/{id}', [GraduandosController::class, 'update'])->name('graduandos.update');

        //Rutas unisex estudiante 
        Route::get('/unisex', [UnisexController::class, 'index'])->name('unisex.index');
        Route::get('/unisex/listado', [UnisexController::class, 'listado'])->name('unisex.listado'); // Ya compraron
        Route::post('/unisex/store', [UnisexController::class, 'store'])->name('unisex.store');
        Route::patch('/unisex/update/{id}', [UnisexController::class, 'updateVinculo'])->name('unisex.updateVinculo');
        Route::post('/unisex/crear/responsable', [UnisexController::class, 'storeResponsable'])->name('unisex.storeResponsable');
        Route::delete('/unisex/destroy{id}', [UnisexController::class, 'destroy'])->name('unisex.destroy');
        Route::delete('/unisex/eliminar', [UnisexController::class, 'eliminar'])->name('unisex.eliminar');
        Route::post('/uisex/buscar/responsable', [UnisexController::class, 'buscarResponsable'])->name('unisex.buscar.responsable');
        Route::get('/unisex/imprimir', [UnisexController::class, 'imprimir'])->name('unisex.imprimir');

        //Rutas estudiantes condicionales
        Route::get('/condiciones/especiales', [ReportesEspecialesController::class, 'index'])->name('condiciones.especiales.index');
        Route::get('/condiciones/especiales/data', [ReportesEspecialesController::class, 'data'])->name('condiciones.especiales.data');

        // 🔥 NUEVA RUTA: Estudiantes No Cedulados
        Route::get('/no-cedulados', [EstudiantesNoCeduladosController::class, 'index'])->name('no.cedulados.index');
        Route::get('/no-cedulados/data', [EstudiantesNoCeduladosController::class, 'data'])->name('no.cedulados.data');
        Route::patch('/no-cedulados/update', [EstudiantesNoCeduladosController::class, 'updateCedulado'])->name('no.cedulados.update');
        Route::get('/estudiantes/no-cedulados/pdf', [EstudiantesNoCeduladosController::class, 'exportPdf'])->name('no.cedulados.pdf');
        });
});

// Rutas gestiones generales de pdfs estudiantes
Route::middleware(['auth', 'verified'])->group(function () {
    // Grupo empleados activos
    Route::prefix('estudiantes-impresiones')->name('estudiantes.impresiones.')->group(function () {
    
        // Rutas index
        Route::get('/', function () {
            return Inertia::render('Estudiantes/Rutas/RutasGestionPdfsIndex');
        })->name('index');

        // Rutas impresion por grado activos listados
        Route::get('/documentos/por/grado', [ModuloDeImpresionesController::class, 'docPorGrados'])->name('documentos.por.grado');
        Route::get('/documentos/generales', [ModuloDeImpresionesController::class, 'docGenerales'])->name('documentos.generales');
        Route::get('/control/de/actividaes', [ModuloDeImpresionesController::class, 'controlDeActividades'])->name('control.de.actividades');
    });
});

// Rutas para imprimir documentos estudiantes y empleados
Route::middleware(['auth', 'verified'])->group(function () {
    //rutas de exportar pdf y excell empleados
    Route::get('/ExportDocumentosEmpleados', [ExportDocEmpleadosPdfController::class, 'exportDocumentosEmpleado'])->name('ExportDocumentosEmpleados');
    Route::get('/estudiantesExport', [ExportDocEstudiantesController::class, 'exportDocumentosEstudiante'])->name('estudiantesExport');

    //rutas estudiantes activos
    Route::get('/estudiantesActivosExport', [ExportDocEstudiantesActivosController::class, 'exportDocumentosEstudianteActivo'])->name('estudiantesActivosExport');

    //rutas estudiantes inactivos
    Route::get('/estudiantesInactivosExport', [ExportDocEstudiantesInactivosController::class, 'exportDocumentosEstudianteInactivo'])->name('estudiantesInactivosExport');

    //rutas estudiantes aprobados reprobados
    Route::get('/estudiantesCalificadosExport', [ExportDocEstudiantesCalificadosController::class, 'exportDocumentosEstudianteCalificado'])->name('estudiantesCalificadosExport');


    Route::post('/control/de/actividades', [ExportDocEstudiantesController::class, 'ControlDeActividades'])->name('control.de.actividades');
});

// Ruta verificar permisos activos automaticmante y los envia al modal de gestionar permiso
Route::get('/api/verificar/permisos/{id}', function ($id) {
    return [
        // Verifica si tiene un permiso EVENTUAL activo
        'tieneEventual' => \App\Models\Permiso::where('empleado_id', $id)
            ->where('tipo', 'Eventual')
            ->where('status', 'Activo')
            ->exists(),

        // Verifica si tiene VACACIONES activas
        'tieneVacacion' => \App\Models\Permiso::where('empleado_id', $id)
            ->where('tipo', 'Vacacion')
            ->where('status', 'Activo')
            ->exists(),

        // Verifica si tiene PERMISO PERMANENTE activo (días fijos)
        'tienePermanente' => \App\Models\Permiso::where('empleado_id', $id)
            ->where('tipo', 'Permanente')
            ->where('status', 'Activo')
            ->exists(),
    ];
});

// Ruta fuera de los middlewares para mantener session activa
Route::get('/ping', function () {
    return response()->noContent(); // Retorna un 204 (sin contenido)
})->middleware(['auth']);


//ruta para conectar api de gemini y escanear formularios
Route::get('/test-gemini', function () {
    $key = config('services.gemini.key');
    $response = Http::get("https://generativelanguage.googleapis.com/v1/models?key={$key}");
    return $response->json();
});


//rutas insumos comedor
Route::middleware(['auth'])->prefix('recursos-comedor')->name('comedor.')->group(function () {
    // 1. Dashboard / Hub Principal
    Route::get('/', [ComedorController::class, 'index'])->name('index');

    // 2. Gestión de Insumos (Catálogo)
    Route::get('/inventario', [ComedorController::class, 'inventarioIndex'])->name('insumo.index');
    Route::post('/insumo', [ComedorController::class, 'storeInsumo'])->name('insumo.store');
    Route::put('/insumo/{id}', [ComedorController::class, 'updateInsumo'])->name('insumo.update');
    Route::put('/comedor/movimiento/{id}', [ComedorController::class, 'updateMovimiento'])
        ->name('movimiento.update');
    // 3. Operaciones Masivas (Entradas y Salidas)
    Route::get('/recepcion', [ComedorController::class, 'recepcionIndex'])->name('recepcion.index'); // Carga masa Entrada
    Route::get('/despacho', [ComedorController::class, 'despachoIndex'])->name('despacho.index');   // Carga masa Salida
    Route::post('/movimiento', [ComedorController::class, 'registrarMovimiento'])->name('movimiento.store');

    // 4. Consultas e Historiales  
    Route::get('/historial-salidas', [ComedorController::class, 'salidasIndex'])->name('salidas.index');
    Route::get('/historial-cierres', [ComedorController::class, 'cierresIndex'])->name('cierres.index');
    Route::get('/reporte-pdf', [ComedorController::class, 'generarReporte'])->name('reporte.pdf');
});

//Rutas busqueda global y generalizacion estudiantes empleados
Route::get('/api/estudiantes/search', [GlobalSearchController::class, 'search'])->name('api.estudiantes.search');
Route::get('/api/birthdays', [QuickStatsController::class, 'birthdays'])->name('api.birthdays');
Route::get('/api/quick/stats', [QuickStatsController::class, 'index'])->name('api.quick.stats');


//Rutas enviar mensajes whappasap reportes especiales
Route::prefix('estudiantes/acciones')->group(function () {
    Route::get('reporte-especial-whatsapp/data', [ReporteEspecialWhatsAppController::class, 'getReportData'])
        ->name('estudiantes.acciones.whatsapp.data');

    Route::get('reporte-especial-whatsapp/empleados', [ReporteEspecialWhatsAppController::class, 'getEmpleados'])
        ->name('estudiantes.acciones.whatsapp.empleados');

    Route::post('reporte-especial-whatsapp/send', [ReporteEspecialWhatsAppController::class, 'sendReport'])
        ->name('estudiantes.acciones.whatsapp.send');
});

//traer periodos escolares existentes en bd 
Route::get('/api/periodos-disponibles-historial', function () {
    try {
        $inicial = DB::table('matricula_inicials')->distinct()->pluck('periodo_escolar');
        $final = DB::table('matricula_finals')->distinct()->pluck('periodo_escolar');
        $periodos = $inicial->merge($final)
            ->unique()
            ->sortDesc()
            ->values()
            ->all();
        return response()->json($periodos);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error interno del servidor'], 500);
    }
})->name('api.periodos-historial');

require __DIR__ . '/auth.php';
