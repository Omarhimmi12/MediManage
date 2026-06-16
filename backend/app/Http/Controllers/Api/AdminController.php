<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Cabinet;
use App\Models\Medecin;
use App\Models\Secretaire;
use App\Models\RendezVous;
use App\Models\Consultation;
use App\Models\Paiement;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AdminController extends Controller
{
    
    public function stats()
    {
        $totalMedecins = Medecin::count();
        $totalSecretaires = Secretaire::count();
        $totalCabinets = Cabinet::count();
        $totalUsers = User::count();
        $totalRendezvous = RendezVous::count();
        $totalConsultations = Consultation::count();
        $totalRevenue = (float) Consultation::whereIn('statut_paiement', ['payé', 'paye'])->sum('montant');
        $todayRevenue = (float) Consultation::whereIn('statut_paiement', ['payé', 'paye'])
            ->whereDate('date_consultation', Carbon::today())
            ->sum('montant');

        return response()->json([
            'total_medecins' => $totalMedecins,
            'total_secretaires' => $totalSecretaires,
            'total_cabinets' => $totalCabinets,
            'total_users' => $totalUsers,
            'total_rendez_vous' => $totalRendezvous,
            'total_consultations' => $totalConsultations,
            'total_revenue' => $totalRevenue,
            'today_revenue' => $todayRevenue,
            'active_cabinets' => Cabinet::where('suspendu', false)->count(),
            'suspended_cabinets' => Cabinet::where('suspendu', true)->count(),
        ]);
    }

    public function users(Request $request)
    {
        $request->validate([
            'role' => ['nullable', Rule::in(['medecin', 'secretaire', 'admin'])],
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = User::whereIn('role', ['medecin', 'secretaire', 'admin'])
            ->with('medecin.cabinet', 'secretaire.cabinet');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%{$s}%")
                  ->orWhere('prenom', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $perPage = $request->integer('per_page', 20);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    public function showUser($id)
    {
        $user = User::with('medecin.cabinet', 'secretaire.cabinet')
            ->whereIn('role', ['medecin', 'secretaire', 'admin'])
            ->findOrFail($id);

        return response()->json($user);
    }

   
    public function updateUser(Request $request, $id)
    {
        $user = User::whereIn('role', ['medecin', 'secretaire', 'admin'])->findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|nullable|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'telephone' => 'sometimes|nullable|string|max:255',
            'role' => ['sometimes', Rule::in(['medecin', 'secretaire', 'admin'])],
            'password' => 'sometimes|nullable|min:6',
        ]);

        if ($request->has('nom')) {
            $user->nom = $request->nom;
        }
        if ($request->has('prenom')) {
            $user->prenom = $request->prenom;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('telephone')) {
            $user->telephone = $request->telephone;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        // Changing role requires creating/destroying related profile
        if ($request->has('role') && $request->role !== $user->role) {
            $oldRole = $user->role;
            $newRole = $request->role;

            // Clean up old profile
            if ($oldRole === 'medecin' && $user->medecin) {
                $user->medecin->delete();
            }
            if ($oldRole === 'secretaire' && $user->secretaire) {
                $user->secretaire->delete();
            }

            $user->role = $newRole;

            // Create new profile if needed
            if ($newRole === 'medecin') {
                Medecin::create(['user_id' => $user->id, 'specialite' => 'Généraliste']);
            }
            if ($newRole === 'secretaire') {
                Secretaire::create(['user_id' => $user->id, 'cabinet_id' => null]);
            }
        }

        $user->save();
        $user->load('medecin.cabinet', 'secretaire.cabinet');

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user,
        ]);
    }

    /*
     * Delete a user (medecin/secretaire only — never admin self-delete).
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::whereIn('role', ['medecin', 'secretaire'])->findOrFail($id);

        // Prevent self-deletion
        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }

        // Clean up relations
        if ($user->medecin) {
            $cabinet = $user->medecin->cabinet;
            if ($cabinet) {
                // Remove associated secretaires
                Secretaire::where('cabinet_id', $cabinet->id)->delete();
                $cabinet->delete();
            }
            $user->medecin->delete();
        }
        if ($user->secretaire) {
            $user->secretaire->delete();
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    public function cabinets(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
            'suspended' => 'nullable|boolean',
        ]);

        $query = Cabinet::with('medecin.user');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%{$s}%")
                  ->orWhere('specialite', 'like', "%{$s}%")
                  ->orWhereHas('medecin.user', function ($uq) use ($s) {
                      $uq->where('nom', 'like', "%{$s}%")
                         ->orWhere('prenom', 'like', "%{$s}%");
                  });
            });
        }

        if ($request->has('suspended')) {
            $query->where('suspendu', $request->boolean('suspended'));
        }

        $perPage = $request->integer('per_page', 20);
        $cabinets = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Attach aggregate stats to each cabinet
        $cabinets->getCollection()->transform(function ($cabinet) {
            $cabinetId = $cabinet->id;
            return [
                'id' => $cabinet->id,
                'nom' => $cabinet->nom,
                'adresse' => $cabinet->adresse,
                'telephone' => $cabinet->telephone,
                'specialite' => $cabinet->specialite,
                'suspendu' => $cabinet->suspendu ?? false,
                'medecin_nom' => $cabinet->medecin?->user?->nom ?? '—',
                'medecin_prenom' => $cabinet->medecin?->user?->prenom ?? '',
                'medecin_email' => $cabinet->medecin?->user?->email ?? '—',
                'total_secretaires' => Secretaire::where('cabinet_id', $cabinetId)->count(),
                'total_rendez_vous' => RendezVous::where('cabinet_id', $cabinetId)->count(),
                'total_consultations' => Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                    $q->where('cabinet_id', $cabinetId);
                })->count(),
                'total_revenue' => (float) Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                    $q->where('cabinet_id', $cabinetId);
                })->whereIn('statut_paiement', ['payé', 'paye'])->sum('montant'),
                'created_at' => $cabinet->created_at,
            ];
        });

        return response()->json($cabinets);
    }

    public function showCabinet($id)
    {
        $cabinet = Cabinet::with('medecin.user')->findOrFail($id);
        $cabinetId = $cabinet->id;

        return response()->json([
            'id' => $cabinet->id,
            'nom' => $cabinet->nom,
            'adresse' => $cabinet->adresse,
            'telephone' => $cabinet->telephone,
            'specialite' => $cabinet->specialite,
            'suspendu' => $cabinet->suspendu ?? false,
            'medecin_nom' => $cabinet->medecin?->user?->nom ?? '—',
            'medecin_prenom' => $cabinet->medecin?->user?->prenom ?? '',
            'medecin_email' => $cabinet->medecin?->user?->email ?? '—',
            'total_secretaires' => Secretaire::where('cabinet_id', $cabinetId)->count(),
            'total_rendez_vous' => RendezVous::where('cabinet_id', $cabinetId)->count(),
            'total_consultations' => Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })->count(),
            'total_revenue' => (float) Consultation::whereHas('rendezVous', function ($q) use ($cabinetId) {
                $q->where('cabinet_id', $cabinetId);
            })->whereIn('statut_paiement', ['payé', 'paye'])->sum('montant'),
        ]);
    }
   
    public function toggleSuspendCabinet($id)
    {
        $cabinet = Cabinet::findOrFail($id);
        $cabinet->suspendu = !$cabinet->suspendu;
        $cabinet->save();

        $status = $cabinet->suspendu ? 'suspendu' : 'réactivé';

        return response()->json([
            'message' => "Cabinet {$status} avec succès",
            'suspendu' => $cabinet->suspendu,
        ]);
    }

    /**
     * Monthly revenue chart — aggregate across all cabinets.
     */
    public function monthlyRevenueChart()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $frenchMonths = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];

        $labels = [];
        $values = [];

        for ($m = 1; $m <= $currentMonth; $m++) {
            $labels[] = $frenchMonths[$m];

            $revenue = Consultation::whereIn('statut_paiement', ['payé', 'paye'])
                ->whereYear('date_consultation', $currentYear)
                ->whereMonth('date_consultation', $m)
                ->sum('montant');

            $values[] = (float) $revenue;
        }

        return response()->json(['labels' => $labels, 'values' => $values]);
    }
}
