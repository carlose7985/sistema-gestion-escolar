<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCuposRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:255',
            'sexo' => 'required|string|max:10',
            'documento' => 'required',
            'cedula' => 'required|unique:cupo_estudiantes,cedula',
            'grado_id' => 'required',
            'institucion_procedencia' => 'required|string|max:255',
            'ciudad_procedencia' => 'required|string|max:255',
            'periodo_escolar' => 'required',
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
            'max'      => 'Máx. :max caracteres.', 

            'cedula.unique' => 'Cedula ya existe.',
            'cedula.max'    => 'Máx. 8 dígitos.',

           
        ];
    }
}
