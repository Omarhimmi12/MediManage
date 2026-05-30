<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = ['consultation_id', 'montant', 'date_paiement', 'mode_paiement', 'statut'];


    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
