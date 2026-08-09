<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmpleadoActivoRequest extends FormRequest
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
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'documento' => ['max:10'],
            'cedula' => ['required', 'string', 'max:8', 'unique:empleado_activos,cedula'],
            'sexo' => ['required', 'string'],
            'fecha_de_nacimiento' => ['required', 'date'],
            'lugar_de_nacimiento' => ['required', 'string', 'max:255'],
            'direccion_de_habitacion' => ['required', 'string', 'max:500'],
            'parroquia' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'max:20'],
            'correo_electronico' => ['required', 'email', 'max:255'],
            'grado_de_intruccion' => ['required', 'string', 'max:255'],
            'profesion' => ['required', 'string', 'max:255'],
            'tipo_de_personal' => ['required', 'string', 'max:255'],
            'cargo_en_el_perror' => ['required', 'string', 'max:255'],
            'codigo_del_cargo' => ['required', 'string', 'max:255'],
            'condicion_del_cargo' => ['required', 'string', 'max:255'],
            'status_del_cargo' => ['required', 'string', 'max:255'],
            'fecha_de_ingreso_al_cargo' => ['required', 'date'],
            'carga_horaria' => ['required', 'string', 'max:255'],
            'dependencia' => ['required', 'string', 'max:255'],
            'codigo_de_dependencia' => ['required', 'string', 'max:255'],
            'situacion_laboral' => ['nullable', 'string', 'max:255'],
            'status_de_actualizacion' => ['nullable', 'string', 'max:255'],
            'fecha_de_ingreso_al_plantel' => ['required', 'date'],
            'funcion_en_el_plantel' => ['required', 'string', 'max:255'],
            'area_de_trabajo' => 'required|array',
            'area_de_trabajo.*' => 'string|max:255',
             'fecha_registro' => ['nullable', 'date'], // Se autocompleta
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
            'cedula.unique' => 'Cedula ya existe.',
            'cedula.max'    => 'Máx. 8 dígitos.',

            // Correo
            'correo_electronico.email' => 'Email inválido.',

            // Teléfono
            'telefono.max' => 'Máx. 20 dígitos.',

            // Área de trabajo
            'area_de_trabajo.required' => 'Seleccione al menos una.',

            // Fechas específicas (opcional, si quieres ser más puntual)
            'fecha_de_nacimiento.date'       => 'Fecha nac. inválida.',
            'fecha_de_ingreso_al_cargo.date' => 'Fecha ingreso inválida.',
        ];
    }
}
