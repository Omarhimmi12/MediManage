<?php

use App\Models\Cabinet;
use App\Models\Medecin;
use App\Models\Patient;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Medecin::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Cabinet::class)->constrained()->cascadeOnDelete();
            $table->date('date_rdv');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->enum('statut', ['en_attente', 'confirme', 'annule', 'termine'])->default('en_attente');
            $table->string('motif')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
