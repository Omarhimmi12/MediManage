<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Paiement;
use App\Models\Consultation;

class PaiementController extends Controller
{
    
    public function index(Request $request){
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cabinetId = $user->role === 'medecin'
            ? optional($user->medecin?->cabinet)->id
            : optional($user->secretaire)->cabinet_id;

        $consultationsQuery = Consultation::with([
            'rendezVous.patient.user',
            'paiement',
        ])->where('statut_paiement', 'paye');

        if (!empty($cabinetId)) {
            $consultationsQuery->whereHas('rendezVous', function ($q2) use ($cabinetId) {
                $q2->where('cabinet_id', $cabinetId);
            });
        }

        $consultations = $consultationsQuery->get();

        $rows = $consultations->map(function (Consultation $consultation) {
            $paiement = $consultation->paiement;

            return [
                'id' => $paiement?->id ?? $consultation->id,
                'patient_name' => $consultation->rendezVous?->patient?->user?->nom,
                'montant' => $consultation->montant,
                'date_paiement' => $paiement?->date_paiement ?? $consultation->date_consultation,
                'mode_paiement' => $consultation->mode_paiement ?? $paiement?->mode_paiement ?? null,
                'statut' => $paiement?->statut ?? $consultation->statut_paiement,
                'consultation' => $consultation,
            ];
        })->sortByDesc(function ($row) {
            return $row['date_paiement'] ?? '1970-01-01';
        })->values();

        return response()->json($rows);
    }


    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'secretaire') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'mode_paiement' => 'required|string|max:255',
        ]);

        $consultation = Consultation::with('rendezVous')->find($request->consultation_id);

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        if ($consultation->rendezVous->cabinet_id !== $user->secretaire->cabinet_id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        if ($consultation->statut_paiement === 'paye') {
            return response()->json([
                'message' => 'Consultation already paid'
            ], 400);
        }

        $paiement = Paiement::create([
            'consultation_id' => $consultation->id,
            'montant' => $consultation->montant,
            'date_paiement' => now(),
            'mode_paiement' => $request->mode_paiement,
            'statut' => 'valide'
        ]);

        $consultation->update([
            'statut_paiement' => 'paye',
            'mode_paiement' => $request->mode_paiement,
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'paiement' => $paiement
        ], 201);
    }

    
    
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $paiement = Paiement::with([
                'consultation.rendezVous.patient.user'
            ])
            ->find($id);

        if (!$paiement) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $cabinetId = $user->role === 'medecin'
            ? $user->medecin->cabinet->id
            : $user->secretaire->cabinet_id;

        if ($paiement->consultation->rendezVous->cabinet_id !== $cabinetId) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        return response()->json($paiement);
    }
}
