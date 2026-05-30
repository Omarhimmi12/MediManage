<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Secretaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request){
        $request->validate([
            'nom' => 'required|string|min:3',
            'prenom' => 'nullable|string|min:3',
            'email' => 'required|email|unique:users',
            'telephone' => 'required|string',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:admin,medecin,patient,secretaire',

            'specialite' => 'required_if:role,medecin',
            'date_naissance' => 'required_if:role,patient',
            'adresse' => 'required_if:role,patient',
            'sexe' => 'required_if:role,patient',
            'cabinet_id' => 'required_if:role,secretaire',
            'date_embauche' => 'required_if:role,secretaire',
        ]);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        switch ($user->role) {

            case 'medecin':
                Medecin::create([
                    'user_id' => $user->id,
                    'specialite' => $request->specialite
                ]);
                break;

            case 'patient':
                Patient::create([
                    'user_id' => $user->id,
                    'date_naissance' => $request->date_naissance,
                    'adresse' => $request->adresse,
                    'sexe' => $request->sexe
                ]);
                break;

            case 'secretaire':
                Secretaire::create([
                    'user_id' => $user->id,
                    'cabinet_id' => $request->cabinet_id,
                    'date_embauche' => $request->date_embauche
                ]);
                break;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }


    public function login(Request $request){
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }


    public function logout(Request $request){
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'medecin') {
            $user->load('medecin.cabinet');
        }

        if ($user->role === 'secretaire') {
            $user->load('secretaire.cabinet');
        }

        if ($user->role === 'patient') {
            $user->load('patient');
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
}
