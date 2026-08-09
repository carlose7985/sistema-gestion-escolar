<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGraduadosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $estudianteId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'fecha_de_nacimiento' => ['required', 'date'],
            'sexo' => ['required', 'string', 'in:M,F'],
            'cedula' => [
                'required',
                'min:8',
                'max:11',
                Rule::unique('estudiantes', 'cedula')->ignore($estudianteId),
            ],
            'apreciacion' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            // Generales
            'required' => 'Campo requerido.',
            'string'   => 'Debe ser texto.',
            'date'     => 'Fecha inválida.',
            'max'      => 'Máx. :max caracteres.',
            'in'       => 'Valor no válido.',
            'exists'   => 'El registro seleccionado no existe.',

            // Cédula
            'cedula.unique' => 'La cédula ya está registrada.',
            'cedula.min'    => 'La cédula debe tener al menos 8 dígitos.',
            'cedula.max'    => 'La cédula no debe exceder los 11 dígitos.',

            // Talles
            'talla_de_camisa.max'   => 'Máx. 2 dígitos.',
            'talla_de_pantalon.max' => 'Máx. 2 dígitos.',
            'talla_de_zapato.max'   => 'Máx. 2 dígitos.',

            // Fechas
            'fecha_de_nacimiento.date' => 'Fecha de nacimiento inválida.',

            // Responsables
            'representante_id.exists' => 'El representante seleccionado no existe.',
            'padre_id.exists'         => 'El padre/madre seleccionado no existe.',
        ];
    }
}
