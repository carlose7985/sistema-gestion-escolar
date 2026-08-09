<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Estadistica extends Model
{
    use HasFactory;
    protected $fillable = ['fecha', 'dias_habiles', 'dias_laborados', 'status'];
}
