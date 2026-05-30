<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'rendez_vous_id',
        'date_consultation',
        'diagnostic',
        'ordonnance',
        'montant',
        'statut_paiement',
        'mode_paiement'
    ];


    public function rendezVous(){
        return $this->belongsTo(RendezVous::class);
    }

    public function paiement(){
        return $this->hasOne(Paiement::class);
    }
}
