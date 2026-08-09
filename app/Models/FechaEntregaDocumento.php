<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FechaEntregaDocumento extends Model
{
     protected $table = 'fecha_entrega_documentos';
     protected $fillable = ['fecha','periodo_escolar'];
} 
