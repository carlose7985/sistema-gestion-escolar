<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Estudiante;
use App\Models\EstudiantePeriodo;
use App\Models\PeriodoEscolar;

class UnificarEstudiantesSeeder extends Seeder
{
    public function run()
    {
        // Desactivar restricciones de clave foránea temporalmente para mayor velocidad
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Mapa de tablas estándar a procesar
        $tablasEstandar = [
            'estudiante_aprobados'   => ['status' => 'Activo',    'status_escolar' => 'Aprobado'],
            'estudiante_reprobados'  => ['status' => 'Reprobado',    'status_escolar' => 'Reprobado'],
            'estudiante_repitientes' => ['status' => 'Reprobado',    'status_escolar' => 'Reprobado'],
            'estudiante_retirados'   => ['status' => 'Retirado',  'status_escolar' => 'Retirado'],
        ];

        // 1. PROCESAR TABLAS ESTÁNDAR
        foreach ($tablasEstandar as $tabla => $estados) {
            $registros = DB::table($tabla)->get();

            foreach ($registros as $row) {
                $periodoId = $this->obtenerPeriodoId($row->periodo_escolar);

                // Insertar o recuperar el estudiante base por Cédula (Evita duplicados)
                $estudiante = DB::table('estudiantes')->where('cedula', $row->cedula)->first();

                if (!$estudiante) {
                    $estudianteId = DB::table('estudiantes')->insertGetId([
                        'name'                 => $row->name,
                        'apellido'             => $row->apellido,
                        'cedula'               => $row->cedula,
                        'documento'            => $row->documento ?? 'V',
                        'sexo'                 => $row->sexo,
                        'fecha_de_nacimiento'  => $row->fecha_de_nacimiento,
                        'lugar_de_nacimiento'  => $row->lugar_de_nacimiento,
                        'entidad_federal'      => $row->entidad_federal,
                        'etnia'                => $row->etnia,
                        'representante_id'     => $row->representante_id,
                        'padre_id'             => $row->padre_id,
                        'parentesco'           => $row->parentesco,
                        'enfermedades'         => $row->enfermedades,
                        'tratamiento_medico'   => $row->tratamiento_medico,
                        'alergico'             => $row->alergico,
                        'condicion_especial'   => $row->condicion_especial,
                        'problemas_fisicos'    => $row->problemas_fisicos,
                        'created_at'           => $row->created_at ?? now(),
                        'updated_at'           => $row->updated_at ?? now(),
                    ]);
                } else {
                    $estudianteId = $estudiante->id;
                }

                // Insertar el historial en estudiante_periodos
                DB::table('estudiante_periodos')->insert([
                    'estudiante_id'            => $estudianteId,
                    'periodo_id'               => $periodoId,
                    'grado_id'                 => $row->grado_id,
                    'direccion'                => $row->direccion,
                    'instituto_de_procedencia' => $row->instituto_de_procedencia,
                    'lateralidad'              => $row->lateralidad,
                    'talla_de_camisa'          => $row->talla_de_camisa,
                    'talla_de_pantalon'        => $row->talla_de_pantalon,
                    'talla_de_zapato'          => $row->talla_de_zapato,
                    'condicion'                => $row->condicion,
                    'status'                   => $estados['status'],
                    'status_escolar'           => $estados['status_escolar'],
                    'matricula_sisge'          => $row->matricula_sisge,
                    'apreciacion'              => $row->apreciacion,
                    'actualizado'              => $row->actualizado,
                    'calificado'               => $row->calificado,
                    'fecha_registro'           => $row->fecha_registro,
                    'created_at'               => $row->created_at ?? now(),
                    'updated_at'               => $row->updated_at ?? now(),
                ]);
            }
        }

        // 2. PROCESAR TABLA DE GRADUADOS (Campos no estandarizados)
        $graduados = DB::table('estudiante_graduados')->get();
        $gradosGraduados = [16, 17, 18]; // IDs de grado alternados

        foreach ($graduados as $index => $row) {
            $periodoId = $this->obtenerPeriodoId($row->periodo_escolar);
            // Asignación salteada/alternada de grado_id (16, 17, 18)
            $gradoId = $gradosGraduados[$index % count($gradosGraduados)];

            $estudiante = DB::table('estudiantes')->where('cedula', $row->cedula)->first();

            if (!$estudiante) {
                $estudianteId = DB::table('estudiantes')->insertGetId([
                    'name'                 => $row->name,
                    'apellido'             => $row->apellido,
                    'cedula'               => $row->cedula,
                    'documento'            => $row->documento ?? 'V',
                    'sexo'                 => $row->sexo,
                    'fecha_de_nacimiento'  => $row->fecha_de_nacimiento,
                    'lugar_de_nacimiento'  => $row->lugar_de_nacimiento,
                    'entidad_federal'      => $row->entidad_federal,
                    'etnia'                => 'No especificado',
                    'representante_id'     => 1, // ID por defecto o asignación previa
                    'padre_id'             => 1, // ID por defecto
                    'parentesco'           => 'Padre/Madre',
                    'enfermedades'         => 'Ninguna',
                    'tratamiento_medico'   => 'Ninguno',
                    'alergico'             => 'Ninguno',
                    'condicion_especial'   => 'Ninguna',
                    'problemas_fisicos'    => 'Ninguno',
                    'created_at'           => $row->created_at ?? now(),
                    'updated_at'           => $row->updated_at ?? now(),
                ]);
            } else {
                $estudianteId = $estudiante->id;
            }

            DB::table('estudiante_periodos')->insert([
                'estudiante_id'            => $estudianteId,
                'periodo_id'               => $periodoId,
                'grado_id'                 => $gradoId,
                'direccion'                => $row->direccion,
                'instituto_de_procedencia' => 'Escuala Carlos Rafael Contreras',
                'lateralidad'              => 'Derecho',
                'talla_de_camisa'          => 'S/I',
                'talla_de_pantalon'        => 'S/I',
                'talla_de_zapato'          => 'S/I',
                'condicion'                => 'Regular',
                'status'                   => 'Graduado',
                'status_escolar'           => 'Graduado',
                'matricula_sisge'          => 'Si',
                'apreciacion'              => $row->apreciacion ?? 'Graduado exitosamente',
                'actualizado'              => 'Si',
                'calificado'               => 'Si',
                'fecha_registro'           => $row->fecha_registro,
                'created_at'               => $row->created_at ?? now(),
                'updated_at'               => $row->updated_at ?? now(),
            ]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Mapea el texto del periodo (ej: '2020-2021') con su ID correspondiente en periodo_escolars
     */
    private function obtenerPeriodoId($periodoTexto)
    {
        $periodo = DB::table('periodo_escolars')->where('periodo_actual', $periodoTexto)->first();
        return $periodo ? $periodo->id : 1; // Si no lo halla, asigna 1 por defecto
    }
}