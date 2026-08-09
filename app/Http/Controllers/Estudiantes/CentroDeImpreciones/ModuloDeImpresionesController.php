<?php

namespace App\Http\Controllers\Estudiantes\CentroDeImpreciones;

use App\Helpers\PeriodoHelper;
use App\Http\Controllers\Controller;
use App\Models\Grado;
use App\Models\PeriodoEscolar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuloDeImpresionesController extends Controller
{

    public function docPorGrados()
    {
        // Obtener todos los períodos disponibles
        $periodos = PeriodoEscolar::orderBy('id', 'desc')->get(['id', 'nombre_periodo']);

        // Obtener período activo por defecto
        $periodoActivo = PeriodoHelper::getActivo();
        $periodoId = $periodoActivo ? $periodoActivo->id : null;

        return Inertia::render('Estudiantes/CentroDeImpresiones/DocumentosPorGrado', [
            'grades' => Grado::all(),
            'periodos' => $periodos,
            'periodoId' => $periodoId,
        ]);
    }


    public function controlDeActividades(Request $request)
    {

        // 1. Capturamos el string de IDs "1,2,3"
        $rawGrados = $request->query('gradoIds');
        if (!$rawGrados) {
            return back()->with('error', 'No se han seleccionado grados. Por favor, selecciona al menos un grado para configurar el reporte.');
        }

        // 2. Lo convertimos en array para buscar en la base de datos
        $gradoIds = $rawGrados ? explode(',', $rawGrados) : [];

        // 3. Obtenemos los grados para mostrarlos en la vista de configuración
        // Así el usuario sabe qué grados está configurando.
        $grados = Grado::whereIn('id', $gradoIds)
            ->orderBy('id', 'asc')
            ->get();

        // 4. Retornamos la vista de Inertia (debes crear este archivo .jsx)
        return Inertia::render('Estudiantes/CentroDeImpresiones/ControlDeActividades', [
            'gradosSeleccionados' => $grados,
            'camposDisponibles' => $this->getCamposDisponibles(),
            'gradoIds' => $rawGrados, // Lo pasamos de vuelta como string para el formulario final
        ]);
    }

    private function getCamposDisponibles()
    {
        return [
            'full_name'           => 'Nombres y Apellidos',
            'name'                => 'Nombres',
            'apellido'            => 'Apellidos',
            'cedula'              => 'Cédula',
            'sexo'                => 'Género',
            'fecha_de_nacimiento' => 'F. Nacimiento',
            'edad'                => 'Edad',
            'direccion'           => 'Dirección',
            'telefono'            => 'Teléfono',
            'talla_de_camisa'     => 'Talla Camisa',
            'talla_de_pantalon'   => 'Talla Pantalón',
            'talla_de_zapato'     => 'Talla Zapato',
            'enfermedades'        => 'Enfermedades',
            'alergico'            => 'Alergias',

            // Estructura: relacion.campo_en_tabla_responsable
            'representante.name_r'     => 'Nombre del Representante',
            'representante.cedula_r'   => 'Cédula del Representante',
            'representante.telefono_r' => 'Teléfono del Representante',

            'padre.name_r'             => 'Nombre del Padre',
            'padre.cedula_r'           => 'Cédula del Padre',
        ];
    }

    public function docGenerales()
    {
        // Buscamos el periodo que esté marcado como actual/activo
        $periodoActual = PeriodoHelper::getActivo();

        // Obtener TODOS los períodos disponibles para el selector
        $periodos = PeriodoEscolar::orderBy('id', 'desc')->get(['id', 'nombre_periodo']);

        return Inertia::render('Estudiantes/CentroDeImpresiones/DocumentosGenerales', [
            'periodoActual' => $periodoActual ? $periodoActual->nombre_periodo : date('Y'),
            'periodos' => $periodos,
        ]);
    }
}
