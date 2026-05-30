<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cabinet extends Model
{
    protected $fillable = ['nom', 'adresse', 'telephone', 'logo', 'specialite', 'medecin_id', 'latitude', 'longitude'];

    public function medecin(){
        return $this->belongsTo(Medecin::class, 'medecin_id');
    }

    public function secretaires(){
        return $this->hasMany(Secretaire::class);
    }

    public function rendezVous(){
        return $this->hasMany(RendezVous::class);
    }
}
