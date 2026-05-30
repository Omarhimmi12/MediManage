<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    protected $fillable = ['user_id', 'specialite'];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function cabinet(){
        return $this->hasOne(Cabinet::class);
    }

    public function rendezVous(){
        return $this->hasMany(RendezVous::class);
    }

}
