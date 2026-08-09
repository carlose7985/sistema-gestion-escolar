<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmpleadoActivo extends Model
{
    use HasFactory;

    protected $table = 'empleado_activos'; // Aseguramos el nombre de la tabla

    protected $guarded = [];

    protected $casts = [
        'area_de_trabajo' => 'array',
    ];

    // Añadimos 'foto_url' a los campos que se envían a Vue
    protected $appends = ['age', 'agec', 'agep', 'foto_url'];


    public function getFotoUrlAttribute()
    {
        // Si tiene foto, genera la URL de storage. Si no, devuelve null.
        if ($this->foto) {
            return asset('storage/' . $this->foto);
        }
        return null;
    }

    public function getAgeAttribute()
    {
        return Carbon::parse($this->fecha_de_nacimiento)->age;
    }

    public function getAgecAttribute()
    {
        return Carbon::parse($this->fecha_de_ingreso_al_cargo)->age;
    }

    public function getAgepAttribute()
    {
        return Carbon::parse($this->fecha_de_ingreso_al_plantel)->age;
    }

    // Accessor para el primer nombre
    public function getPrimerNombreAttribute()
    {
        return explode(' ', $this->nombres)[0];
    }

    // Accessor para el primer apellido
    public function getPrimerApellidoAttribute()
    {
        return explode(' ', $this->apellidos)[0];
    }
    // Scope para orden jerárquico
    public function scopeOrdenJerarquico($query)
    {
        return $query->orderByRaw("
            CASE 
                WHEN tipo_de_personal = 'Docente' THEN 1
                WHEN tipo_de_personal = 'Administrativo' THEN 2
                WHEN tipo_de_personal = 'Obrero' THEN 3
                WHEN tipo_de_personal = 'Cenae' THEN 4
                WHEN tipo_de_personal = 'Vigilante' THEN 5
                ELSE 6
            END
        ");
    }

    public function recaudo()
    {
        // El segundo parámetro es la llave foránea en la tabla empleado_recaudos
        return $this->hasOne(EmpleadoRecaudo::class, 'empleado_id');
    }
    // En App\Models\EmpleadoActivo
    public function evaluaciones()
    {
        return $this->hasMany(EvaluacionEmpleado::class, 'empleado_id');
    }
    public function pagosAcciones()
    {
        return $this->hasMany(AccionPago::class);
    }
    public function ultimaEvaluacion()
    {
        return $this->hasOne(EvaluacionEmpleado::class, 'empleado_id')->latest();
    }
    // /* --- RELACIONES --- */
    public function wifiAfiliado()
    {
        return $this->hasOne(WifiAfiliado::class, 'empleado_id');
    }
    public function asistencias()
    {
        return $this->hasMany(AsistenciaEmpleado::class, 'empleado_id');
    }


    public function permisos()
    {
        return $this->hasMany(Permiso::class, 'empleado_id');
    }


    public function permisosEventual()
    {
        return $this->hasMany(PermisoEventual::class, 'empleado_id');
    }
    public function permisosVacacion()
    {
        return $this->hasMany(PermisoVacacion::class, 'empleado_id');
    }
    public function permisosPermanente()
    {
        return $this->hasMany(PermisoPermanente::class, 'empleado_id');
    }

   
    /* --- CONFIGURACIÓN JSON --- */
    public function toJson($options = 0)
    {
        return json_encode($this->jsonSerialize(), $options | JSON_UNESCAPED_UNICODE);
    }

    protected function castAttributeAsJson($key, $value)
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE);
    }
}
