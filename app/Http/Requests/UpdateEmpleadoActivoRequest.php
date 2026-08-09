<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmpleadoActivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Capturamos el ID de la ruta de forma segura
        $id = $this->route('id') ?? $this->route('empleado') ?? $this->route('empleado_activo');

        return [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'documento' => 'nullable|string|max:10',

            // Ignorar ID actual en Cédula
            'cedula' => [
                'required',
                'string',
                Rule::unique('empleado_activos', 'cedula')->ignore($id),
            ],

            'sexo' => 'required|string',
            'fecha_de_nacimiento' => 'required|date',
            'lugar_de_nacimiento' => 'required|string|max:255',
            'direccion_de_habitacion' => 'required|string|max:255',
            'parroquia' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'correo_electronico' => 'required|email|max:255',


            'grado_de_intruccion' => 'required|string|max:255',
            'profesion' => 'required|string|max:255',
            'cargo_en_el_perror' => 'required|string|max:255',
            'codigo_del_cargo' => 'required|string|max:255',
            'condicion_del_cargo' => 'required|string|max:255',
            'status_del_cargo' => 'required|string|max:255',
            'fecha_de_ingreso_al_cargo' => 'required|date',
            'carga_horaria' => 'required|string|max:255',
            'dependencia' => 'required|string|max:255',
            'codigo_de_dependencia' => 'required|string|max:255',
            'fecha_de_ingreso_al_plantel' => 'required|date',
            'funcion_en_el_plantel' => 'required|string|max:255',

            // Aceptamos que área de trabajo sea un array (múltiple)
            'area_de_trabajo' => 'required|array',
            'area_de_trabajo.*' => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Campo obligatorio.',
            'cedula.unique' => 'Esta cédula ya está registrada.',
            'correo_electronico.unique' => 'Este correo electrónico ya está en uso.',
            'email' => 'El formato del correo es inválido.',
        ];
    }
}
