<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{

    public function index(Request $request){
        $user = $request->user();

        if ($user->role === 'medecin') {

            $cabinetId = $user->medecin->cabinet->id;

            return RendezVous::with(['patient.user', 'consultation'])
                ->where('cabinet_id', $cabinetId)
                ->orderBy('date_rdv')
                ->get();
        }

        if ($user->role === 'secretaire') {

            $cabinetId = $user->secretaire->cabinet_id;

            return RendezVous::with(['patient.user', 'consultation'])
                ->where('cabinet_id', $cabinetId)
                ->orderBy('date_rdv')
                ->get();
        }

        if ($user->role === 'patient') {

            return RendezVous::with('medecin.user')
                ->where('patient_id', $user->patient->id)
                ->orderBy('date_rdv')
                ->get();
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }


    public function store(Request $request){
        $user = $request->user();

        if (!in_array($user->role, ['patient', 'secretaire', 'medecin'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'medecin_id' => 'nullable|exists:medecins,id',
            'cabinet_id' => 'nullable|exists:cabinets,id',
            'date_rdv' => 'required|date|after_or_equal:today',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'motif' => 'required|string',
            'patient_id' => 'nullable|exists:patients,id'
        ]);


        if ($user->role === 'secretaire' && empty($request->cabinet_id)) {
            $request->merge([
                'cabinet_id' => $user->secretaire?->cabinet_id,
            ]);
        }


        if ($user->role === 'secretaire' && empty($request->medecin_id)) {
            $request->merge([
                'medecin_id' => $user->secretaire?->cabinet?->medecin_id,
            ]);
        }


        if ($user->role === 'medecin') {
            $medecin = $user->medecin;
            if (!$medecin) {
                return response()->json(['message' => 'Medecin introuvable'], 404);
            }

            $cabinetId = $medecin->cabinet?->id;

            if (!$cabinetId) {
                return response()->json(['message' => 'cabinet invalide'], 404);
            }

            $request->merge([
                'medecin_id' => $medecin->id,
                'cabinet_id' => $cabinetId,
            ]);
        }


        if ($user->role === 'patient' && empty($request->medecin_id)) {
            return response()->json(['message' => 'medecin_id est requis'], 422);
        }

        if ($user->role === 'patient') {
            $patient = $user->patient;

            if (!$patient) {
                return response()->json(['message' => 'Profil du patient introuvable'], 404);
            }

            $patient_id = $patient->id;

        } else {

            if (!$request->patient_id) {
                return response()->json([
                    'message' => 'patient_id est requis pour secrétaire'
                ], 400);
            }

            $patient_id = $request->patient_id;
        }
               
        if ($user->role === 'secretaire') {
            $secretaireCabinetId = $user->secretaire->cabinet_id;
            if ((int) $request->cabinet_id !== (int) $secretaireCabinetId) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $medecinCabinetId = $request->medecin_id
            ? \App\Models\Medecin::with('cabinet')->find($request->medecin_id)?->cabinet?->id
            : null;

        if (!$medecinCabinetId) {
            return response()->json(['message' => 'Medecin introuvable ou cabinet invalide'], 404);
        }

        // Conflict check 
        $conflict = RendezVous::where('medecin_id', $request->medecin_id)
            ->where('cabinet_id', $request->cabinet_id)
            ->where('date_rdv', $request->date_rdv)
            ->where(function ($query) use ($request) {
                $query->whereBetween('heure_debut', [$request->heure_debut, $request->heure_fin])
                    ->orWhereBetween('heure_fin', [$request->heure_debut, $request->heure_fin]);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Plage horaire déjà prise'
            ], 400);
        }

        $rdv = RendezVous::create([
            'patient_id' => $patient_id,
            'medecin_id' => $request->medecin_id,
            'cabinet_id' => $request->cabinet_id,
            'date_rdv' => $request->date_rdv,
            'heure_debut' => $request->heure_debut,
            'heure_fin' => $request->heure_fin,
            'motif' => $request->motif,
            'statut' => 'en_attente'
        ]);

        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'rendez_vous' => $rdv
        ], 201);
    }    

    public function confirm($id, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'secretaire') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rdv = RendezVous::find($id);

        if (!$rdv) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($rdv->cabinet_id !== $user->secretaire->cabinet_id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $rdv->update(['statut' => 'confirme']);

        // Link patient to this cabinet if not already linked
        $patient = \App\Models\Patient::find($rdv->patient_id);
        if ($patient && !$patient->cabinet_id) {
            $patient->update(['cabinet_id' => $rdv->cabinet_id]);
        }

        return response()->json(['message' => 'Confirmed']);
    }
    

    public function updateStatut($id, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'secretaire') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'statut' => 'required|string',
        ]);

        $rdv = RendezVous::find($id);

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous introuvable'], 404);
        }

        if ($rdv->cabinet_id !== $user->secretaire->cabinet_id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $rdv->update(['statut' => $request->statut]);

        // Link patient to cabinet when confirmed
        if ($request->statut === 'confirme') {
            $patient = \App\Models\Patient::find($rdv->patient_id);
            if ($patient && !$patient->cabinet_id) {
                $patient->update(['cabinet_id' => $rdv->cabinet_id]);
            }
        }

        return response()->json([
            'message' => 'Statut mis à jour',
            'rendez_vous' => $rdv
        ]);
    }

    public function cancel($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['secretaire', 'patient'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rdv = RendezVous::find($id);

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous introuvable'], 404);
        }

        if ($user->role === 'secretaire') {
            if ($rdv->cabinet_id !== $user->secretaire->cabinet_id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        if ($user->role === 'patient') {
            if ($rdv->patient_id !== $user->patient->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $statut = strtolower((string) $rdv->statut);
        $isTermine = str_contains($statut, 'termin');

        // Patient cancellation rule: only before completion
        if ($user->role === 'patient' && $isTermine) {
            return response()->json([
                'message' => 'Annulation impossible: rendez-vous déjà terminé'
            ], 403);
        }

        $rdv->update(['statut' => 'annule']);

        return response()->json([
            'message' => 'Rendez-vous annulé'
        ]);
    }

    public function monRdv(Request $request){
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $patient = $user->patient;

        $rdv = RendezVous::with('medecin.user')
            ->where('patient_id', $patient->id)
            ->orderBy('date_rdv')
            ->get();

        return response()->json($rdv);
    }

    public function myAppointments(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'secretaire') {
            $cabinetId = $user->secretaire->cabinet_id;

            return RendezVous::with('patient.user')
                ->where('cabinet_id', $cabinetId)
                ->orderBy('date_rdv')
                ->get();
        }

        if ($user->role === 'patient') {
            return RendezVous::with('medecin.user')
                ->where('patient_id', $user->patient->id)
                ->orderBy('date_rdv')
                ->get();
        }

        return response()->json(['message' => 'Non autorisé'], 403);
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['secretaire', 'patient'])) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rdv = RendezVous::find($id);

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous introuvable'], 404);
        }

        if ($user->role === 'secretaire') {
            if ($rdv->cabinet_id !== $user->secretaire->cabinet_id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        if ($user->role === 'patient') {
            if ($rdv->patient_id !== $user->patient->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $rdv->delete();

        return response()->json(['message' => 'Rendez-vous supprimé']);
    }
}
