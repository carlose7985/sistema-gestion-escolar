<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateResponsableRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        $responsableId = $this->route('id');
        return [
            'name_r' => 'required',
            'cedula_r' => ['required', Rule::unique('responsables', 'cedula_r')->ignore($responsableId),],
            'sexo_r' => 'required',
            'fecha_de_nacimiento_r' => 'required|date_format:Y-m-d',
            'ocupacion_r' => 'required',
            'direccion_r' => 'required',
            'telefono_r' => 'required|min:12|max:12',
            'documento_r' => 'required',
        ];
    }
    public function messages(): array
    {
        return [
            // --- Mensajes Generales (Aplican a todos los campos) ---
            'required' => 'Campo requerido.',
            'string'   => 'Debe ser texto.',
            'date'     => 'Fecha inválida.',
            'array'    => 'Selección inválida.',
            'max'      => 'Máx. :max caracteres.', // Laravel reemplaza :max automáticamente (ej: 255)

            // --- Mensajes Específicos (Sobreescriben los generales) ---

            // Cédula
            'cedula_r.unique' => 'Cedula ya existe.',
            'cedula_r.max'    => 'Máx. 8 dígitos.',            
            'telefono_r.max' => 'Máx. 20 dígitos.',           
            'fecha_de_nacimiento.date'       => 'Fecha nac. inválida.',
            
        ];
    }
}
