<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'status',
        'scheduled_at',
        'sent_at',
        'phone',
        'email',
        'constact_id',
        'sender',
        'is_read'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'is_read' => 'boolean',
    ];

    public function contacto()
    {
        return $this->belongsTo(Contact::class, 'contacto_id');
    }

}
