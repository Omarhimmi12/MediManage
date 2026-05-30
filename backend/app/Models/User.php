<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['nom', 'prenom', 'email', 'telephone', 'password', 'role'];

    public function medecin()
    {
        return $this->hasOne(Medecin::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function secretaire()
    {
        return $this->hasOne(Secretaire::class);
    }
}