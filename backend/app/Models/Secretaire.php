<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Secretaire extends Model
{
    protected $fillable = ['user_id', 'cabinet_id', 'date_embauche'];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function cabinet(){
        return $this->belongsTo(Cabinet::class);
    }
    
}
