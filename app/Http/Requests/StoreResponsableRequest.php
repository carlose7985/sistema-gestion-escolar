<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResponsableRequest extends FormRequest
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
        return [
            'name_r' => 'required|string|max:255',
            'fecha_de_nacimiento_r' => 'required|date',
            'cedula_r' => 'required|string|unique:responsables,cedula_r|max:20',
            'sexo_r' => 'required',
            'telefono_r' => 'required',
            'direccion_r' => 'required',
            'ocupacion_r' => 'required',
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
