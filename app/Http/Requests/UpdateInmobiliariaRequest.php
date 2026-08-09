<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInmobiliariaRequest extends FormRequest
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
            'tipo_de_inmueble' => 'required|string',
            'ubicacion' => 'required|string',
            'largo' => 'required',
            'ancho' => 'required',
            'alto' => 'required',
            'color' => 'required',
            'costo_aproximado' => 'required',
            'cantidad' => 'required',
            'condicion_legal' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            // --- Mensajes Generales (Aplican a todos los campos) ---
            'required' => 'Campo requerido.',
            'string'   => 'Debe ser texto.',
          

        ];
    }
}
