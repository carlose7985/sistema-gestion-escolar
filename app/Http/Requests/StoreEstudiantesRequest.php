<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEstudiantesRequest extends FormRequest
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
            'name' => 'required',
            'apellido' => 'required',
            'documento' => 'nullable',
            'cedula' =>  'required | max:11 | min:8 |unique:estudiantes,cedula',
            'sexo' => 'required',
            'fecha_de_nacimiento' => 'required|date_format:Y-m-d',
            'lugar_de_nacimiento' => 'required',
            'direccion' => 'required',
            'entidad_federal' => 'required',
            'apreciacion' => 'required',
            'condicion' => 'required',
            'instituto_de_procedencia' => 'required',
            'status_escolar' => 'required',
            'lateralidad' => 'required',
            'problemas_fisicos' => 'nullable',
            'alergico' => 'nullable',
            'enfermedades' => 'nullable',
            'tratamiento_medico' => 'nullable',
            'talla_de_camisa' => 'required|min:2|max:2',
            'talla_de_pantalon' => 'required|min:2|max:2',
            'talla_de_zapato' => 'required|min:2|max:2',
            'condicion_especial' => 'nullable',
            'etnia' => 'nullable',
            'grado_id' => 'nullable',
            'matricula_sisge' => 'nullable',
            'representante_id' => 'nullable',
            'padre_id' => 'nullable', 
            'parentesco' => 'nullable',
            'status' => 'nullable',
            'actualizado' => 'nullable',
            'calificado' => 'nullable',
            'fecha_registro' => 'nullable',
            'periodo_escolar' => 'nullable',


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
