<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCuposRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ajusta esto según tu lógica de autorización
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        $cupoId = $this->route('id');

        return [
            'name' => 'required|string|max:255',
            'documento' => 'required',
            'sexo' => 'required|string|max:10',
            'cedula' => ['required', Rule::unique('cupo_estudiantes', 'cedula')->ignore($cupoId),],
            'grado_id' => 'required',
            'institucion_procedencia' => 'required|string|max:255',
            'ciudad_procedencia' => 'required|string|max:255',
            'periodo_escolar' => 'required',
            'fecha_registro' => 'nullable',
            'status' => 'required|in:Pendiente,Inscrito,Vencido',
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
            // --- Mensajes Específicos ---
            'cedula.unique' => 'Cedula ya existe.',
            'cedula.max'    => 'Máx. 8 dígitos.',

           
        ];
    }
}
