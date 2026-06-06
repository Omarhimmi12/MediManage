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
                    'today_revenue' => 0,
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

            $todayRdv = RendezVous::where('cabinet_id', $cabinetId)
                ->whereDate('date_rdv', Carbon::today())
                ->count();

            $todayRevenue = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereDate('date_consultation', Carbon::today())
            ->sum('montant');

            $todayPaiementsRevenue = Paiement::whereHas('consultation.rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereDate('date_paiement', Carbon::today())
            ->whereDoesntHave('consultation', function ($q) {
                $q->whereDate('date_consultation', Carbon::today());
            })
            ->sum('montant');

            $todayRevenue += (float) $todayPaiementsRevenue;

            $monthlyRevenue = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereIn('statut_paiement', ['payé', 'paye'])
            ->whereMonth('date_consultation', Carbon::now()->month)
            ->whereYear('date_consultation', Carbon::now()->year)
            ->sum('montant');

            return response()->json([
                'total_patients' => $totalPatients,
                'total_rendez_vous' => $totalRdv,
                'total_consultations' => $totalConsultations,
                'today_revenue' => (float) $todayRevenue,
                'today_rendez_vous' => $todayRdv,
                'monthly_revenue' => (float) $monthlyRevenue
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

    // CA mensuel
    public function monthlyRevenueChart(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$user->medecin || !$user->medecin->cabinet) {
            return response()->json([
                'labels' => [],
                'values' => []
            ]);
        }

        $cabinetId = $user->medecin->cabinet->id;
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $labels = [];
        $values = [];

        $frenchMonths = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        for ($m = 1; $m <= $currentMonth; $m++) {
            $labels[] = $frenchMonths[$m];

            // Revenue from consultations with statut_paiement = payé/paye
            $consultationRevenue = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereIn('statut_paiement', ['payé', 'paye'])
            ->whereYear('date_consultation', $currentYear)
            ->whereMonth('date_consultation', $m)
            ->sum('montant');

            $paiementRevenue = Paiement::whereHas('consultation.rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereYear('date_paiement', $currentYear)
            ->whereMonth('date_paiement', $m)
            ->sum('montant');

            $values[] = (float) ($consultationRevenue + $paiementRevenue);
        }

        return response()->json([
            'labels' => $labels,
            'values' => $values
        ]);
    }

    // rdv statistics
    public function appointmentStats(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['medecin', 'secretaire'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cabinetId = null;

        if ($user->role === 'medecin') {
            if (!$user->medecin || !$user->medecin->cabinet) {
                return response()->json([
                    ['status' => 'En attente', 'count' => 0],
                    ['status' => 'Confirmé', 'count' => 0],
                    ['status' => 'Terminé', 'count' => 0],
                ]);
            }
            $cabinetId = $user->medecin->cabinet->id;
        } elseif ($user->role === 'secretaire') {
            if (!$user->secretaire || !$user->secretaire->cabinet) {
                return response()->json([
                    ['status' => 'En attente', 'count' => 0],
                    ['status' => 'Confirmé', 'count' => 0],
                    ['status' => 'Terminé', 'count' => 0],
                ]);
            }
            $cabinetId = $user->secretaire->cabinet->id;
        }

        $counts = RendezVous::where('cabinet_id', $cabinetId)
            ->whereIn('statut', ['en_attente', 'confirme', 'termine'])
            ->selectRaw("statut, COUNT(*) as count")
            ->groupBy('statut')
            ->pluck('count', 'statut');

        return response()->json([
            ['status' => 'En attente', 'count' => (int) ($counts['en_attente'] ?? 0)],
            ['status' => 'Confirmé', 'count' => (int) ($counts['confirme'] ?? 0)],
            ['status' => 'Terminé', 'count' => (int) ($counts['termine'] ?? 0)],
        ]);
    }

    // Daily revenue
    public function dailyRevenueChart(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'medecin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$user->medecin || !$user->medecin->cabinet) {
            return response()->json([
                'labels' => [],
                'values' => []
            ]);
        }

        $cabinetId = $user->medecin->cabinet->id;
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $daysInMonth = Carbon::now()->daysInMonth;

        $labels = [];
        $values = [];

        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = Carbon::create($currentYear, $currentMonth, $d);
            if ($date->isAfter(Carbon::today())) {
                break;
            }

            $labels[] = (string) $d;

            // Revenue from consultations on that day
            $consultationRevenue = Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereIn('statut_paiement', ['payé', 'paye'])
            ->whereYear('date_consultation', $currentYear)
            ->whereMonth('date_consultation', $currentMonth)
            ->whereDay('date_consultation', $d)
            ->sum('montant');

            $paiementRevenue = Paiement::whereHas('consultation.rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })
            ->whereYear('date_paiement', $currentYear)
            ->whereMonth('date_paiement', $currentMonth)
            ->whereDay('date_paiement', $d)
            ->sum('montant');

            $values[] = (float) ($consultationRevenue + $paiementRevenue);
        }

        return response()->json([
            'labels' => $labels,
            'values' => $values
        ]);
    }
}
