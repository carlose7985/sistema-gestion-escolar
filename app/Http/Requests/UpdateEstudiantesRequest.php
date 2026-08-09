<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEstudiantesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $estudianteId = $this->route('id');

        return [
            // --- TABLA ESTUDIANTES (Datos Personales) ---
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cedula' => ['required', 'min:8', 'max:11', Rule::unique('estudiantes')->ignore($estudianteId)],
            'documento' => 'required|string|max:2',
            'sexo' => 'required|in:M,F',
            'fecha_de_nacimiento' => 'required|date',
            'lugar_de_nacimiento' => 'nullable|string|max:255',
            'entidad_federal' => 'nullable|string|max:255',
            // Datos de salud (tabla estudiantes)
            'enfermedades' => 'nullable|string|max:255',
            'tratamiento_medico' => 'nullable|string|max:255',
            'alergico' => 'nullable|string|max:255',
            'condicion_especial' => 'nullable|string|max:255',
            'problemas_fisicos' => 'nullable|string|max:255',
            'etnia' => 'nullable|string|max:255',

            // --- TABLA ESTUDIANTE_PERIODOS (Datos Académicos y Antropométricos) ---
            'direccion' => 'nullable|string|max:255',
            'instituto_de_procedencia' => 'nullable|string|max:255',
            'apreciacion' => 'nullable|string|max:255',
            'condicion' => 'nullable|string|max:255',
            'lateralidad' => 'nullable|string|max:255',
            'talla_de_camisa' => 'nullable|string|max:20',
            'talla_de_pantalon' => 'nullable|string|max:20',
            'talla_de_zapato' => 'nullable|string|max:20',
            'status_escolar' => 'nullable|string|max:255',

            // --- RESPONSABLES ---
            'parentesco' => 'nullable|string|max:255',
            'representante_id' => 'nullable|exists:responsables,id',
            'padre_id' => 'nullable|exists:responsables,id',
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
