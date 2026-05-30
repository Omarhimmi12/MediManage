<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Secretaire;

class SecretaireController extends Controller
{
    private function getMedecinCabinetOrFail(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'medecin') {
            abort(response()->json(['message' => 'Non autorisé'], 403));
        }

        if (!$user->medecin) {
            abort(response()->json(['message' => 'Profil médecin introuvable'], 404));
        }

        if (!$user->medecin->cabinet) {
            abort(response()->json(['message' => 'Aucun cabinet trouvé'], 404));
        }

        return $user->medecin->cabinet;
    }

    private function findSecretaireOrFail(Request $request, int $id)
    {
        $cabinet = $this->getMedecinCabinetOrFail($request);

        $secretaire = Secretaire::with('user')
            ->where('cabinet_id', $cabinet->id)
            ->where('id', $id)
            ->first();

        if (!$secretaire) {
            return abort(response()->json(['message' => 'Secrétaire introuvable'], 404));
        }

        return $secretaire;
    }

    public function index(Request $request)
    {
        $cabinet = $this->getMedecinCabinetOrFail($request);

        $secretaires = $cabinet->secretaires()
            ->with('user')
            ->get();

        // frontend always receives a JSON array
        return response()->json($secretaires->values());
    }

    public function store(Request $request)
    {
        $cabinet = $this->getMedecinCabinetOrFail($request);

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:255',
            'password' => 'required|min:6',
            'date_embauche' => 'nullable|date'
        ]);

        $newUser = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'password' => Hash::make($request->password),
            'role' => 'secretaire',
        ]);

        $secretaire = Secretaire::create([
            'user_id' => $newUser->id,
            'cabinet_id' => $cabinet->id,
            'date_embauche' => $request->date_embauche,
        ]);

        $secretaire->load('user');

        return response()->json([
            'message' => 'Secrétaire créé avec succès',
            'secretaire' => $secretaire
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $secretaire = $this->findSecretaireOrFail($request, $id);

        return response()->json($secretaire);
    }

    public function update(Request $request, int $id)
    {
        $secretaire = $this->findSecretaireOrFail($request, $id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $secretaire->user_id,
            'telephone' => 'nullable|string|max:255',
            'password' => 'nullable|min:6',
            'date_embauche' => 'nullable|date'
        ]);

        $secretaire->user->nom = $request->nom;
        $secretaire->user->prenom = $request->prenom;
        $secretaire->user->email = $request->email;
        $secretaire->user->telephone = $request->telephone;

        if ($request->filled('password')) {
            $secretaire->user->password = Hash::make($request->password);
        }

        $secretaire->user->save();

        $secretaire->date_embauche = $request->date_embauche;
        $secretaire->save();

        $secretaire->load('user');

        return response()->json([
            'message' => 'Secrétaire mis à jour avec succès',
            'secretaire' => $secretaire
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $secretaire = $this->findSecretaireOrFail($request, $id);

        $secretaire->user()->delete();
        $secretaire->delete();

        return response()->json([
            'message' => 'Secrétaire supprimé avec succès'
        ]);
    }
}
