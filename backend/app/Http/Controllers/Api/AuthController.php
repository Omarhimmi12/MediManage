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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom' => 'required|string|min:3',
            'prenom' => 'nullable|string|min:3',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'required|string',
            'specialite' => 'nullable|string',
            'cabinet_nom' => 'nullable|string',
            'cabinet_adresse' => 'nullable|string',
            'cabinet_telephone' => 'nullable|string',
        ]);

        $user->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
        ]);

        if ($user->role === 'medecin') {
            $medecin = $user->medecin;
            if ($medecin && $request->has('specialite')) {
                $medecin->update(['specialite' => $request->specialite]);
            }

            $cabinet = $medecin?->cabinet;
            if ($cabinet) {
                $cabinet->update([
                    'nom' => $request->cabinet_nom ?? $cabinet->nom,
                    'adresse' => $request->cabinet_adresse ?? $cabinet->adresse,
                    'telephone' => $request->cabinet_telephone ?? $cabinet->telephone,
                ]);
            }
        }

        $user->load('medecin.cabinet');

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'data' => $user
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $medecin = $user->medecin;

        if ($medecin) {
            $cabinet = $medecin->cabinet;

            if ($cabinet) {
                // Delete all secretaires (and their user accounts)
                $secretaires = \App\Models\Secretaire::where('cabinet_id', $cabinet->id)->get();
                foreach ($secretaires as $secretaire) {
                    if ($secretaire->user) {
                        $secretaire->user->tokens()->delete();
                        $secretaire->user->delete();
                    }
                }

                // Delete all rendez-vous for this cabinet
                $rendezVous = \App\Models\RendezVous::where('cabinet_id', $cabinet->id)->get();
                foreach ($rendezVous as $rdv) {
                    // Delete associated consultation and paiement
                    if ($rdv->consultation) {
                        if ($rdv->consultation->paiement) {
                            $rdv->consultation->paiement->delete();
                        }
                        $rdv->consultation->delete();
                    }
                    $rdv->delete();
                }

                $cabinet->delete();
            }

            // Delete rendez-vous by medecin (without cabinet)
            \App\Models\RendezVous::where('medecin_id', $medecin->id)->delete();

            $medecin->delete();
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Compte supprimé avec succès.'
        ]);
    }
}
