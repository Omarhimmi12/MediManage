<?php

use App\Models\RendezVous;
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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(RendezVous::class)->constrained()->cascadeOnDelete();
            $table->dateTime('date_consultation');
            $table->text('diagnostic')->nullable();
            $table->text('ordonnance')->nullable();
            $table->decimal('montant', 10, 2)->default(0);
            $table->enum('statut_paiement', ['en_attente', 'paye'])->default('en_attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
