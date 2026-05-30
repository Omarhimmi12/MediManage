<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cabinet;

class CabinetController extends Controller
{   

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'Aucun cabinet trouvé'], 403);
        }

        $medecin = $user->medecin;

        if (!$medecin || !$medecin->cabinet) {
            return response()->json(['message' => 'Aucun cabinet trouvé'], 404);
        }

        return response()->json($medecin->cabinet);
    }


    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'non autorisé'], 403);
        }

        $medecin = $user->medecin;
        if (!$medecin) {
            return response()->json(['message' => 'Profil médical introuvable'], 404);
        }

        if ($medecin->cabinet) {
            return response()->json(['message' => 'Vous avez déjà un cabinet'], 400);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'adresse' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'specialite' => 'required|string|max:255',
            'latitude' => 'numeric',
            'longitude' => 'numeric'
        ]);

        $cabinet = Cabinet::create([
            'nom' => $request->nom,
            'adresse' => $request->adresse,
            'telephone' => $request->telephone,
            'specialite' => $request->specialite,
            'medecin_id' => $medecin->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude
        ]);

        return response()->json(['message' => 'Cabinet créé avec succès', 'cabinet' => $cabinet], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        // Only medecin can update
        if (!$user || $user->role !== 'medecin') {
            return response()->json(['message' => 'non autorisé'], 403);
        }

        $medecin = $user->medecin;
        if (!$medecin || !$medecin->cabinet) {
            return response()->json(['message' => 'Aucun cabinet trouvé'], 404);
        }

        if ((int)$medecin->cabinet->id !== (int)$id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $cabinet = Cabinet::findOrFail($id);

        $request->validate([
            'nom' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'specialite' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $data = [
            'nom' => $cabinet->nom,
            'adresse' => $cabinet->adresse,
            'telephone' => $cabinet->telephone,
            'specialite' => $cabinet->specialite,
            'latitude' => $cabinet->latitude,
            'longitude' => $cabinet->longitude,
        ];


        if ($request->exists('nom') && trim((string) $request->nom) !== '') {
            $data['nom'] = $request->nom;
        }
        if ($request->exists('adresse') && trim((string) $request->adresse) !== '') {
            $data['adresse'] = $request->adresse;
        }
        if ($request->exists('telephone') && trim((string) $request->telephone) !== '') {
            $data['telephone'] = $request->telephone;
        }
        if ($request->exists('specialite') && trim((string) $request->specialite) !== '') {
            $data['specialite'] = $request->specialite;
        }

        if ($request->exists('latitude') && trim((string) $request->latitude) !== '') {
            $data['latitude'] = $request->latitude;
        }
        if ($request->exists('longitude') && trim((string) $request->longitude) !== '') {
            $data['longitude'] = $request->longitude;
        }

        if ($request->hasFile('logo')) {
            if (!is_dir(public_path('uploads/cabinets'))) {
                mkdir(public_path('uploads/cabinets'), 0775, true);
            }

            $file = $request->file('logo');
            $filename = time() . "_" . preg_replace('/[^A-Za-z0-9_\-\.]/', '', $file->getClientOriginalName());
            $file->move(public_path('uploads/cabinets'), $filename);

            $data['logo'] = $filename;
        }

        $cabinet->update($data);

        return response()->json($cabinet);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'medecin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $medecin = $user->medecin;
        if (!$medecin || !$medecin->cabinet) {
            return response()->json(['message' => 'Aucun cabinet trouvé'], 404);
        }

        if ((int) $medecin->cabinet->id !== (int) $id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $medecin->cabinet->delete();

        return response()->json(['message' => 'Cabinet supprimé avec succès']);
    }

    public function availableForPatients(Request $request)
    {
        $cabinets = Cabinet::with(['medecin.user'])->get()->map(function (Cabinet $cabinet) {
                $medecin = $cabinet->medecin;
                $doctor = $medecin?->user;

                return [
                    'id' => $cabinet->id,
                    'nom' => $cabinet->nom,
                    'adresse' => $cabinet->adresse,
                    'telephone' => $cabinet->telephone,
                    'specialite' => $cabinet->specialite,
                    'latitude' => $cabinet->latitude,
                    'longitude' => $cabinet->longitude,
                    'logo' => $cabinet->logo,
                    'medecin_id' => $medecin?->id,
                    'medecinNom' => $doctor ? trim(($doctor->nom ?? '') . ' ' . ($doctor->prenom ?? '')) : null,
                    'adresseComplete' => $cabinet->adresse,
                ];
            });

        return response()->json($cabinets);
    }
    
}
