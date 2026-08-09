<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logo extends Model
{
    protected $table = 'logos';
    protected $fillable = ['logo_documentos', 'logo_institucion'];

    // Hacemos que estas URLs siempre viajen con el modelo a React
    protected $appends = ['logo_institucion_url', 'logo_documentos_url'];

    public function getLogoInstitucionUrlAttribute()
    {
        return $this->logo_institucion
            ? asset('storage/' . $this->logo_institucion)
            : asset('img/noImg.png');
    }

    public function getLogoDocumentosUrlAttribute()
    {
        return $this->logo_documentos
            ? asset('storage/' . $this->logo_documentos)
            : asset('img/noImg.png');
    }
}
