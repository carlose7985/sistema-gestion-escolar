<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstitucionRequest extends FormRequest
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
            'nombre_de_la_institucion' => 'required|string|max:255',
            'direccion' => 'required|string',
            'telefono' => 'required|string|max:20',
            'email' => 'required|email',
            'rif' => 'required|string|max:20',
            'nif' => 'required|string|max:20',
            'fecha_de_fundada' => 'required|date',
            'circuito' => 'required|string|max:50',
            'estado' => 'required|string|max:100',
            'municipio' => 'required|string|max:100',
            'parroquia' => 'required|string|max:100',
            'dependencia' => 'required|string|max:100',
            'codigo_de_dependencia' => 'required|string|max:50',
            'codigo_dea' => 'required|string|max:50',
            'codigo_estadistico' => 'required|string|max:50',
            'codigo_cenae' => 'required|string|max:50',
            'codigo_circuito' => 'required|string|max:50',
            'codigo_electoral' => 'required|string|max:50',
            'codigo_primaria' => 'required|string|max:50',
            'comuna' => 'required|string|max:100',
            'zona_educativa' => 'required|string|max:100',
            'turno' => 'required',
            'medio' => 'required',
            'tipo_de_escuela' => 'required',
            'numero_de_aulas' => 'required|string|max:10',
            'numero_de_secciones' => 'required|string|max:10',
            'otras_aulas' => 'required|string|max:10',
         
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
           
            // Correo
            'email.email' => 'Email inválido.',

            // Teléfono
            'telefono.max' => 'Máx. 20 dígitos.',      

            // Fechas específicas (opcional, si quieres ser más puntual)
            'fecha_de_fundada.date'       => 'Fecha nac. inválida.',
          
        ];
    }
}
