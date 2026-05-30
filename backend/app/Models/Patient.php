<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = ['user_id', 'date_naissance', 'adresse', 'sexe', 'cabinet_id'];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function dossierMedical(){
        return $this->hasOne(DossierMedical::class);
    }

    public function rendezVous(){
        return $this->hasMany(RendezVous::class);
    }

    public function cabinet(){
        return $this->belongsTo(Cabinet::class);
    }

    
    
}
