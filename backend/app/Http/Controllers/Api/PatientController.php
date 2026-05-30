<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Patient;
use App\Models\DossierMedical;

class PatientController extends Controller
{   

    public function index(Request $request)
{
    $user = $request->user();

    if (!in_array($user->role, ['medecin', 'secretaire'])) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    $cabinetId = null;

    if ($user->role === 'medecin') {
        $cabinetId = $user->medecin?->cabinet?->id;
    }

    if ($user->role === 'secretaire') {
        $cabinetId = $user->secretaire?->cabinet?->id;
    }

    if (!$cabinetId) {
        return response()->json([]);
    }

    $patients = Patient::with('user', 'dossierMedical')
        ->where('cabinet_id', $cabinetId)
        ->orderBy('id')
        ->get();

    return response()->json($patients);
}


    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'nom' => 'required|string|min:3',
            'prenom' => 'required|string|min:3',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'telephone' => 'required|string',
            'date_naissance' => 'required|date',
            'adresse' => 'required|string',
            'sexe' => 'required|string|in:male,female'
        ]);

        $newUser = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'password' => Hash::make($request->password),
            'role' => 'patient'
        ]);

        $cabinetId = null;
        if ($user->role === 'medecin') {
            $cabinetId = $user->medecin?->cabinet?->id;
        } else {
            $cabinetId = $user->secretaire?->cabinet?->id;
        }

        if (!$cabinetId) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $patient = Patient::create([
            'user_id' => $newUser->id,
            'cabinet_id' => $cabinetId,
            'date_naissance' => $request->date_naissance,
            'adresse' => $request->adresse,
            'sexe' => $request->sexe
        ]);

        DossierMedical::create([
            'patient_id' => $patient->id,
            'date_creation' => now()
        ]);

        return response()->json([
            'message' => 'Patient créé avec succès',
            'patient' => $patient->load('user', 'dossierMedical')
        ], 201);
    }
   
    public function show($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $patient = Patient::with('user', 'dossierMedical')->find($id);

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        return response()->json($patient);
    }
}
