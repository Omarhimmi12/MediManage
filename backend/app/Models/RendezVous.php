<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $table = 'rendez_vous';

    protected $fillable = ['patient_id', 'medecin_id', 'cabinet_id', 'date_rdv', 'heure_debut', 'heure_fin', 'statut', 'motif'];

    public function patient(){
        return $this->belongsTo(Patient::class);
    }
    public function medecin(){
        return $this->belongsTo(Medecin::class);
    }
    public function cabinet(){
        return $this->belongsTo(Cabinet::class);
    }
    public function consultation(){
        return $this->hasOne(Consultation::class, 'rendez_vous_id', 'id');
    }


}
