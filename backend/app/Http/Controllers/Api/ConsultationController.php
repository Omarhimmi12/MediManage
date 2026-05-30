<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Consultation;
use App\Models\RendezVous;

class ConsultationController extends Controller
{
    public function patientConsultations(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $patient = $user->patient;
        if (!$patient) {
            return response()->json(['message' => 'Profil patient introuvable'], 404);
        }

        $consultations = \App\Models\Consultation::with([
            'rendezVous', 'rendezVous.medecin.user', 'rendezVous.cabinet',
        ])
            ->whereHas('rendezVous', function ($q) use ($patient) {
                $q->where('patient_id', $patient->id);
            })
            ->orderBy('date_consultation', 'desc')
            ->get();

        $consultations->transform(function (Consultation $cons) {
            $rdv = $cons->rendezVous;

            $medecinUser = $rdv?->medecin?->user;
            $cons->medecinNom = $medecinUser
                ? trim((string)($medecinUser->prenom ?? '') . ' ' . (string)($medecinUser->nom ?? ''))
                : null;

            $cons->cabinetNom = $rdv?->cabinet?->nom ?? null;

            return $cons;
        });

        return response()->json($consultations);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'rendez_vous_id' => 'required|exists:rendez_vous,id',
            'diagnostic' => 'nullable|string',
            'ordonnance' => 'nullable|string',
            'montant' => 'nullable|numeric|min:0',
            'mode_paiement' => 'nullable|string|max:255',
            'statut_paiement' => 'nullable|string|max:255',
        ]);

        $rdv = RendezVous::find($request->rendez_vous_id);

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous not found'], 404);
        }

        if ($rdv->statut !== 'confirme') {
            return response()->json([
                'message' => 'Rendez-vous must be confirmed before consultation'
            ], 400);
        }

        if ($rdv->consultation) {
            return response()->json([
                'message' => 'Consultation already exists for this rendez-vous'
            ], 400);
        }

        if ($user->role === 'medecin') {
            if ($rdv->medecin_id !== $user->medecin->id) {
                return response()->json([
                    'message' => 'This rendez-vous does not belong to you'
                ], 403);
            }

            if ($rdv->cabinet_id !== $user->medecin->cabinet->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        } else {
            $medecinId = $user->secretaire?->cabinet?->medecin_id;
            $secretaireCabinetId = $user->secretaire?->cabinet_id;

            if (!$medecinId || !$secretaireCabinetId) {
                return response()->json(['message' => 'Access denied'], 403);
            }

            if ($rdv->medecin_id !== (int)$medecinId) {
                return response()->json([
                    'message' => 'This rendez-vous does not belong to your cabinet'
                ], 403);
            }

            if ($rdv->cabinet_id !== (int)$secretaireCabinetId) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        if ($user->role === 'medecin') {
            if (empty($request->diagnostic)) {
                return response()->json(['message' => 'diagnostic is required for medecin'], 422);
            }

            $consultation = Consultation::create([
                'rendez_vous_id' => $rdv->id,
                'date_consultation' => now(),
                'diagnostic' => $request->diagnostic,
                'ordonnance' => $request->ordonnance ?? null,
                'montant' => $request->montant ?? 0,
                'mode_paiement' => null,
                'statut_paiement' => 'en_attente',
            ]);

            $rdv->update(['statut' => 'termine']);
        } else {
            $consultation = Consultation::create([
                'rendez_vous_id' => $rdv->id,
                'date_consultation' => now(),
                'diagnostic' => $request->diagnostic ?? null,
                'ordonnance' => null,

                'montant' => $request->montant,
                'mode_paiement' => $request->mode_paiement,
                'statut_paiement' => $request->statut_paiement ?? 'en_attente',
            ]);
        }

        return response()->json([
            'message' => 'Consultation created successfully',
            'consultation' => $consultation
        ], 201);
    }

    public function show($id)
    {
        $consultation = Consultation::with('rendezVous.patient.user')
            ->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        return response()->json($consultation);
    }

    public function update($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // - Secrétaire : remplit paiement (montant/mode/statut_paiement)
        // - Médecin : remplit diagnostic/ordonnance
        if ($user->role === 'medecin') {
            $request->validate([
                'diagnostic' => 'required|string',
                'ordonnance' => 'nullable|string',
                'montant' => 'nullable|numeric|min:0',
                'statut_paiement' => 'nullable|string',
                'mode_paiement' => 'nullable|string|max:255',
            ]);
        } else {
            $request->validate([
                'diagnostic' => 'nullable|string',
                'ordonnance' => 'nullable|string',
                'montant' => 'required|numeric|min:0',
                'statut_paiement' => 'nullable|string',
                'mode_paiement' => 'nullable|string|max:255',
            ]);
        }

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        if ($user->role === 'medecin') {
            $rdv = RendezVous::find($consultation->rendez_vous_id);

            if (!$rdv) {
                return response()->json(['message' => 'Rendez-vous not found'], 404);
            }

            if ($rdv->medecin_id !== $user->medecin->id) {
                return response()->json(['message' => 'This rendez-vous does not belong to you'], 403);
            }

            if ($rdv->cabinet_id !== $user->medecin->cabinet->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $updatePayload = [
            'diagnostic' => $request->diagnostic ?? $consultation->diagnostic,
            'ordonnance' => $request->ordonnance ?? $consultation->ordonnance,
            'montant' => $request->montant ?? $consultation->montant,
            'mode_paiement' => $request->mode_paiement ?? $consultation->mode_paiement,
            'statut_paiement' => $request->statut_paiement ?? $consultation->statut_paiement,
        ];

        $consultation->update($updatePayload);

        return response()->json([
            'message' => 'Consultation updated successfully',
            'consultation' => $consultation
        ]);
    }

    public function togglePaiementStatut($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        $rdv = RendezVous::find($consultation->rendez_vous_id);
        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous not found'], 404);
        }

        if ($user->role === 'medecin') {
            if ($rdv->medecin_id !== $user->medecin->id) {
                return response()->json(['message' => 'This rendez-vous does not belong to you'], 403);
            }

            if ($rdv->cabinet_id !== $user->medecin->cabinet->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        } else {
            $medecinId = $user->secretaire?->cabinet?->medecin_id;
            $secretaireCabinetId = $user->secretaire?->cabinet_id;

            if (!$medecinId || !$secretaireCabinetId) {
                return response()->json(['message' => 'Access denied'], 403);
            }

            if ($rdv->medecin_id !== (int)$medecinId) {
                return response()->json(['message' => 'This rendez-vous does not belong to your cabinet'], 403);
            }

            if ($rdv->cabinet_id !== (int)$secretaireCabinetId) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $current = $consultation->statut_paiement ?? 'en_attente';
        $next = ($current === 'payé') ? 'en_attente' : 'payé';

        $consultation->update([
            'statut_paiement' => $next,
        ]);

        return response()->json([
            'message' => 'Paiement statut updated successfully',
            'consultation' => $consultation,
        ]);
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        if ($user->role === 'medecin') {
            $rdv = RendezVous::find($consultation->rendez_vous_id);

            if (!$rdv) {
                return response()->json(['message' => 'Rendez-vous not found'], 404);
            }

            if ($rdv->medecin_id !== $user->medecin->id) {
                return response()->json(['message' => 'This rendez-vous does not belong to you'], 403);
            }

            if ($rdv->cabinet_id !== $user->medecin->cabinet->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $consultation->delete();

        return response()->json(['message' => 'Consultation deleted successfully']);
    }
}
