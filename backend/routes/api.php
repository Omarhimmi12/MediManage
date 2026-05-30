<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CabinetController;
use App\Http\Controllers\Api\SecretaireController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PatientUpdateController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::get('/cabinets/available', [CabinetController::class, 'availableForPatients']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Patient consultations
    Route::get('/mes-consultations', [ConsultationController::class, 'patientConsultations']);

    // Dashboard (accessible by medecin and secretaire)
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Cabinet (Medecin only)
    Route::post('/cabinet', [CabinetController::class, 'store']);
    Route::get('/cabinet/moncabinet', [CabinetController::class, 'index']);

    Route::post('/cabinet/{id}', [CabinetController::class, 'update']);
    Route::delete('/cabinet/{id}', [CabinetController::class, 'destroy']);

    // Secretaires (Medecin only)
    Route::get('/secretaires', [SecretaireController::class, 'index']);
    Route::post('/secretaires', [SecretaireController::class, 'store']);
    Route::get('/secretaires/{id}', [SecretaireController::class, 'show']);
    Route::put('/secretaires/{id}', [SecretaireController::class, 'update']);
    Route::delete('/secretaires/{id}', [SecretaireController::class, 'destroy']);

    // Patients (Medecin + Secretaire)
    Route::get('/patients', [PatientController::class, 'index']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::post('/patients', [PatientController::class, 'store']);

    // Update/Delete 
    Route::put('/patients/{id}', [PatientUpdateController::class, 'update']);
    Route::delete('/patients/{id}', [PatientUpdateController::class, 'destroy']);


    // Rendez-vous
    Route::get('/rendez-vous', [RendezVousController::class, 'index']);
    Route::post('/rendez-vous', [RendezVousController::class, 'store']);
    Route::put('/rendez-vous/{id}/confirm', [RendezVousController::class, 'confirm']);
    Route::put('/rendez-vous/{id}/cancel', [RendezVousController::class, 'cancel']);
    Route::put('/rendez-vous/{id}/statut', [RendezVousController::class, 'updateStatut']);
    Route::delete('/rendez-vous/{id}', [RendezVousController::class, 'destroy']);
    Route::get('/mon-rendez-vous', [RendezVousController::class, 'myAppointments']);

    // Consultations
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::get('/consultations/{id}', [ConsultationController::class, 'show']);

    // Generic update 
    Route::put('/consultations/{id}', [ConsultationController::class, 'update']);

    // Toggle paiement statut (secretaire action)
    Route::put('/consultations/{id}/paiement/toggle', [ConsultationController::class, 'togglePaiementStatut']);

    Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']);

    // Paiements
    Route::get('/paiements', [PaiementController::class, 'index']);
    Route::get('/paiements/{id}', [PaiementController::class, 'show']);
    Route::post('/paiements', [PaiementController::class, 'store']);

    // revenues
    Route::get('/dashboard/charts/monthly-revenue', [DashboardController::class, 'monthlyRevenueChart']);

});
