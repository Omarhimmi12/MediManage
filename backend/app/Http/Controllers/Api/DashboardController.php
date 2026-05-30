<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\RendezVous;
use App\Models\Consultation;
use App\Models\Paiement;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Medecin dashboard
       if ($user->role === 'medecin') {

        if (!$user->medecin || !$user->medecin->cabinet) {
            return response()->json([
                'total_patients' => 0,
                'total_rendez_vous' => 0,
                'total_consultations' => 0,
                'total_revenue' => 0,
                'today_rendez_vous' => 0,
                'monthly_revenue' => 0
            ]);
        }

        $cabinetId = $user->medecin->cabinet->id;

        $totalPatients = Patient::whereHas('rendezVous', function ($q) use ($cabinetId) {
            $q->where('cabinet_id', $cabinetId);
        })->count();

        $totalRdv = RendezVous::where('cabinet_id', $cabinetId)->count();

        $totalConsultations = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
            $q->where('cabinet_id', $cabinetId);
        })->count();

        $revenueConsultationBase = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
            $q->where('cabinet_id', $cabinetId);
        });

        $revenuePaidBase = (clone $revenueConsultationBase)
            ->whereIn('statut_paiement', ['payé', 'paye']);

        $totalRevenue = Paiement::whereHas('consultation.rendezVous', function ($q) use ($cabinetId) {
            $q->where('cabinet_id', $cabinetId);
        })
        ->whereDate('date_paiement', now())
        ->sum('montant');

        $todayRdv = RendezVous::where('cabinet_id', $cabinetId)->whereDate('date_rdv', now())->count();

        $monthlyRevenue = (clone $revenuePaidBase)->whereMonth('date_consultation', now()->month)->sum('montant');

        return response()->json([
            'total_patients' => $totalPatients,
            'total_rendez_vous' => $totalRdv,
            'total_consultations' => $totalConsultations,
            'total_revenue' => $totalRevenue,
            'today_rendez_vous' => $todayRdv,
            'monthly_revenue' => $monthlyRevenue
        ]);
    }

        // Secretaire dashboard
        if ($user->role === 'secretaire') {

            if (!$user->secretaire || !$user->secretaire->cabinet) {
                return response()->json([
                    'role' => 'secretaire',
                    'total_rendez_vous' => 0,
                    'pending_rendez_vous' => 0,
                    'confirmed_rendez_vous' => 0,
                    'today_rendez_vous' => 0
                ]);
            }

            $cabinetId = $user->secretaire->cabinet->id;

            $totalRdv = RendezVous::where('cabinet_id', $cabinetId)->count();
            $pendingRdv = RendezVous::where('cabinet_id', $cabinetId)
                ->where('statut', 'en_attente')
                ->count();
            $confirmedRdv = RendezVous::where('cabinet_id', $cabinetId)
                ->where('statut', 'confirme')
                ->count();
            $todayRdv = RendezVous::where('cabinet_id', $cabinetId)
                ->whereDate('date_rdv', Carbon::today())
                ->count();

            return response()->json([
                'role' => 'secretaire',
                'total_rendez_vous' => $totalRdv,
                'pending_rendez_vous' => $pendingRdv,
                'confirmed_rendez_vous' => $confirmedRdv,
                'today_rendez_vous' => $todayRdv
            ]);
        }


        return response()->json(['message' => 'Unauthorized'], 403);
    }


    // Chiffre d'affaires
    public function monthlyRevenueChart(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cabinetId = $user->medecin->cabinet->id;
        $labels = [];
        $values = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $labels[] = $month->format('F');

            $revenue = Paiement::whereHas('consultation.rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereYear('date_paiement', $month->year)
            ->whereMonth('date_paiement', $month->month)
            ->sum('montant');

            $values[] = $revenue;
        }

        return response()->json([
            'labels' => $labels,
            'values' => $values
        ]);
    }
}
