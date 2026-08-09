<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrarEstudiantesUnificados extends Command
{
    protected $signature = 'sistema:migrar-estudiantes';
    protected $description = 'Unifica todas las tablas de estudiantes en el nuevo modelo histórico';

    public function handle()
    {
        // 1. Lista de tablas que tienen estructura idéntica (con grado_id)
        $tablasConGrado = [
            'estudiante_activos'    => 'activo',
            'estudiante_aprobados'  => 'aprobado',
            'estudiante_reprobados' => 'reprobado',
            'estudiante_retirados'  => 'retirado'
        ];

        foreach ($tablasConGrado as $tabla => $status) {
            $this->info("Procesando tabla: $tabla...");

            DB::table($tabla)->orderBy('id')->chunk(500, function ($registros) use ($status) {
                foreach ($registros as $reg) {
                    // Crear identidad
                    $estudianteId = $this->obtenerIdEstudiante($reg);

                    // Insertar matrícula real
                    DB::table('matriculas')->updateOrInsert(
                        [
                            'estudiante_id' => $estudianteId,
                            'periodo_escolar' => $reg->periodo_escolar ?? '2025-2026' // Ajustar si es nulo
                        ],
                        [
                            'grado_id' => $reg->grado_id,
                            'status_inscripcion' => $status,
                            'apreciacion' => $reg->apreciacion ?? null,
                            'institucion_procedencia' => $reg->instituto_de_procedencia ?? null,
                            'updated_at' => now()
                        ]
                    );

                    // RECONSTRUCCIÓN: Si quieres rellenar años anteriores automáticamente
                    $this->rellenarAñosFaltantes($estudianteId, $reg);
                }
            });
        }

        // 2. Procesar Graduados (Especial: no tienen grado_id)
        $this->info("Procesando tabla: estudiante_graduados...");
        DB::table('estudiante_graduados')->orderBy('id')->chunk(500, function ($graduados) {
            foreach ($graduados as $grad) {
                $estudianteId = $this->obtenerIdEstudiante($grad);

                // Intentar encontrar el grado_id por el nombre de la sección
                // Ejemplo: $grad->grado_seccion = "6to Grado - A"
                $gradoId = $this->buscarGradoPorNombre($grad->grado_seccion);

                DB::table('matriculas')->updateOrInsert(
                    ['estudiante_id' => $estudianteId, 'periodo_escolar' => $grad->periodo_escolar],
                    [
                        'grado_id' => $gradoId,
                        'status_inscripcion' => 'graduado',
                        'apreciacion' => $grad->apreciacion ?? 'Graduado satisfactoriamente',
                        'updated_at' => now()
                    ]
                );
            }
        });

        $this->info('¡Unificación completada!');
    }

    private function obtenerIdEstudiante($data)
    {
        DB::table('estudiantes')->updateOrInsert(
            ['cedula' => $data->cedula],
            [
                'documento' => $data->documento ?? 'V',
                'name' => $data->name,
                'apellido' => $data->apellido ?? $data->name,
                'sexo' => $data->sexo,
                'fecha_nacimiento' => $data->fecha_de_nacimiento,
                'representante_id' => $data->representante_id ?? 1,
                'padre_id' => $data->padre_id ?? 1,
            ]
        );
        return DB::table('estudiantes')->where('cedula', $data->cedula)->value('id');
    }

    private function buscarGradoPorNombre($nombreSeccion)
    {
        if (!$nombreSeccion) return null;

        // Limpiamos el string para buscar (ej: de "6to Grado - A" buscamos nivel 6 y seccion A)
        $nivel = (int) filter_var($nombreSeccion, FILTER_SANITIZE_NUMBER_INT);
        $seccion = trim(last(explode('-', $nombreSeccion)));

        return DB::table('grados')
            ->where('nombre_del_grado', 'like', "$nivel%")
            ->where('seccion', $seccion)
            ->value('id');
    }

    private function rellenarAñosFaltantes($estId, $reg)
    {
        // Esta lógica resta años y grados para crear el historial previo si no existe
        $nivelActual = (int) filter_var(DB::table('grados')->where('id', $reg->grado_id)->value('nombre_del_grado'), FILTER_SANITIZE_NUMBER_INT);
        $year = (int) explode('-', $reg->periodo_escolar)[0];

        while ($nivelActual > 1) {
            $nivelActual--;
            $year--;
            $periodoPrevio = "$year-" . ($year + 1);

            // Solo insertamos si no hay ya un registro real para ese año
            $existe = DB::table('matriculas')
                ->where('estudiante_id', $estId)
                ->where('periodo_escolar', $periodoPrevio)
                ->exists();

            if (!$existe) {
                $gradoIdPrevio = DB::table('grados')->where('nombre_del_grado', 'like', "$nivelActual%")->value('id');
                if ($gradoIdPrevio) {
                    DB::table('matriculas')->insert([
                        'estudiante_id' => $estId,
                        'grado_id' => $gradoIdPrevio,
                        'periodo_escolar' => $periodoPrevio,
                        'status_inscripcion' => 'aprobado',
                        'apreciacion' => 'Reconstrucción de historial automático',
                        'created_at' => now()
                    ]);
                }
            }
        }
    }
}