<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Models\DossierMedical;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PatientUpdateController extends Controller
{
    private function authorizeCabinetPatient(Request $request, Patient $patient): void
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            abort(response()->json(['message' => 'Non autorisé'], 403));
        }

        $cabinetId = null;
        if ($user->role === 'medecin') {
            $cabinetId = $user->medecin?->cabinet?->id;
        } else {
            $cabinetId = $user->secretaire?->cabinet?->id;
        }

        if (!$cabinetId || !$patient->cabinet_id || (int) $patient->cabinet_id !== (int) $cabinetId) {
            abort(response()->json(['message' => 'Access denied'], 403));
        }
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'nom' => 'sometimes|required|string|min:3',
            'prenom' => 'sometimes|required|string|min:3',
            'email' => 'sometimes|required|email|',
            'telephone' => 'sometimes|required|string',
            'date_naissance' => 'sometimes|required|date',
            'adresse' => 'sometimes|required|string',
            'sexe' => 'sometimes|required|string|in:male,female',
            'password' => 'sometimes|nullable|min:6',
            'password_confirmation' => 'sometimes|nullable|same:password',

            // dossier medical
            'antecedents' => 'sometimes|nullable|string',
            'allergies' => 'sometimes|nullable|string',
            'notes_generales' => 'sometimes|nullable|string',
        ]);

        $patient = Patient::with(['user', 'dossierMedical'])->find($id);
        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        $this->authorizeCabinetPatient($request, $patient);

        $payloadUser = [
            'nom' => $request->input('nom', $patient->user?->nom),
            'prenom' => $request->input('prenom', $patient->user?->prenom),
            'email' => $request->input('email', $patient->user?->email),
            'telephone' => $request->input('telephone', $patient->user?->telephone),
        ];


        $user = $patient->user;
        if ($request->has('nom')) $user->nom = $payloadUser['nom'];
        if ($request->has('prenom')) $user->prenom = $payloadUser['prenom'];
        if ($request->has('email')) $user->email = $payloadUser['email'];
        if ($request->has('telephone')) $user->telephone = $payloadUser['telephone'];

        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        $patientData = [
            'date_naissance' => $request->input('date_naissance', $patient->date_naissance),
            'adresse' => $request->input('adresse', $patient->adresse),
            'sexe' => $request->input('sexe', $patient->sexe),
        ];

        if ($request->has('date_naissance')) $patient->date_naissance = $patientData['date_naissance'];
        if ($request->has('adresse')) $patient->adresse = $patientData['adresse'];
        if ($request->has('sexe')) $patient->sexe = $patientData['sexe'];
        $patient->save();

        if ($patient->dossierMedical) {
            if ($request->has('antecedents')) $patient->dossierMedical->antecedents = $request->input('antecedents');
            if ($request->has('allergies')) $patient->dossierMedical->allergies = $request->input('allergies');
            if ($request->has('notes_generales')) $patient->dossierMedical->notes_generales = $request->input('notes_generales');
            $patient->dossierMedical->save();
        } else {

            $dm = DossierMedical::create([
                'patient_id' => $patient->id,
                'date_creation' => now(),
                'antecedents' => $request->input('antecedents'),
                'allergies' => $request->input('allergies'),
                'notes_generales' => $request->input('notes_generales'),
            ]);
            $patient->setRelation('dossierMedical', $dm);
        }

        return response()->json([
            'message' => 'Patient mis à jour avec succès',
            'patient' => $patient->fresh(['user', 'dossierMedical'])
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $patient = Patient::with(['user', 'dossierMedical'])->find($id);
        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        $this->authorizeCabinetPatient($request, $patient);

        if ($patient->dossierMedical) {
            $patient->dossierMedical->delete();
        }
        if ($patient->user) {
            $patient->user->delete();
        }
        $patient->delete();

        return response()->json(['message' => 'Patient supprimé avec succès']);
    }
}
