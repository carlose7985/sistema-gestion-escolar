<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGraduadosRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'documento' => 'required|string|max:1',
            'cedula' => 'required|numeric|unique:estudiantes,cedula',
            'sexo' => 'required|in:M,F',
            'fecha_de_nacimiento' => 'required|date',
            'lugar_de_nacimiento' => 'required|string',
            'entidad_federal' => 'required|string',
            'direccion' => 'required|string',
            'apreciacion' => 'required|string',
            'periodo_escolar' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            // --- Mensajes Generales (Aplican a todos los campos) ---
            'required' => 'Campo requerido.',
            'string'   => 'Debe ser texto.',
            'num'   => 'Debe ser numero.',
            'date'     => 'Fecha inválida.',
            'array'    => 'Selección inválida.',
            'max'      => 'Máx. :max caracteres.', // Laravel reemplaza :max automáticamente (ej: 255)

            // --- Mensajes Específicos (Sobreescriben los generales) ---

            // Cédula
            'cedula.unique' => 'Cedula ya existe.',
            'cedula.max'    => 'Máx. 8 dígitos.',
            'talla_de_camisa.min'    => 'Min. 2 dígitos.',
            'talla_de_pantalon.min'    => 'Min. 2 dígitos.',
            'talla_de_zapato.min'    => 'Min. 2 dígitos.',
            'talla_de_camisa.max'    => 'Max. 2 dígitos.',
            'talla_de_pantalon.max'    => 'Max. 2 dígitos.',
            'talla_de_zapato.max'    => 'Max. 2 dígitos.',

            // Fechas específicas (opcional, si quieres ser más puntual)
            'fecha_de_nacimiento.date'       => 'Fecha nac. inválida.',

        ];
    }
}
