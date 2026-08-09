<?php

namespace App\Exports;

use App\Models\EmpleadoActivo;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class EmpleadoSheet implements FromQuery, WithTitle, WithHeadings, WithMapping, ShouldAutoSize
{
    private string $cargo;
    private bool $esVigilanteSheet;

    // Añadimos un flag para saber si es la pestaña especial
    public function __construct(string $cargo, bool $esVigilanteSheet = false)
    {
        $this->cargo = $cargo;
        $this->esVigilanteSheet = $esVigilanteSheet;
    }

    public function query()
    {
        // Si es la pestaña de vigilantes, filtramos por funcion_en_el_plantel
        if ($this->esVigilanteSheet) {
            return EmpleadoActivo::query()->where('funcion_en_el_plantel', 'Vigilante');
        }

        // Si no, filtramos por tipo_de_personal como antes
        return EmpleadoActivo::query()->where('tipo_de_personal', $this->cargo);
    }

    public function title(): string
    {
        return $this->cargo;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombres',
            'Apellidos',
            'Doc',
            'Cédula',
            'Sexo',
            'Fecha Nacimiento',
            'Lugar Nacimiento',
            'Dirección',
            'Parroquia',
            'Teléfono',
            'Email',
            'Instrucción',
            'Profesión',
            'Cargo Nómina',
            'Cód. Cargo',
            'Condición',
            'Status Cargo',
            'Ingreso Cargo',
            'Carga Horaria',
            'Dependencia',
            'Cod. Dependencia',
            'Situación Laboral',
            'Ingreso Plantel',
            'Función',
            'Área'
        ];
    }

    public function map($emp): array
    {
        return [
            $emp->id,
            mb_strtoupper($emp->nombres, 'UTF-8'),
            mb_strtoupper($emp->apellidos, 'UTF-8'),
            $emp->documento,
            $emp->cedula,
            $emp->sexo,
            $emp->fecha_de_nacimiento,
            $emp->lugar_de_nacimiento,
            $emp->direccion_de_habitacion,
            $emp->parroquia,
            $emp->telefono,
            $emp->correo_electronico,
            mb_strtoupper($emp->grado_de_intruccion, 'UTF-8'),
            mb_strtoupper($emp->profesion, 'UTF-8'),
            mb_strtoupper($emp->cargo_en_el_perror, 'UTF-8'),
            mb_strtoupper($emp->codigo_del_cargo, 'UTF-8'),
            mb_strtoupper($emp->condicion_del_cargo, 'UTF-8'),
            mb_strtoupper($emp->status_del_cargo, 'UTF-8'),
            $emp->fecha_de_ingreso_al_cargo,
            $emp->carga_horaria,
            $emp->dependencia,
            mb_strtoupper($emp->codigo_de_dependencia, 'UTF-8'),
            mb_strtoupper($emp->situacion_laboral, 'UTF-8'),
            $emp->fecha_de_ingreso_al_plantel,
            mb_strtoupper($emp->funcion_en_el_plantel, 'UTF-8'),
            is_array($emp->area_de_trabajo) ? implode(', ', $emp->area_de_trabajo) : $emp->area_de_trabajo
        ];
    }
}
