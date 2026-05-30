<?php

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
        if (!Schema::hasTable('dossier_medical')) {
            Schema::create('dossier_medical', function (Blueprint $table) {
                $table->id();
                $table->foreignIdFor(Patient::class)->unique()->constrained()->cascadeOnDelete();
                $table->text('antecedents')->nullable();
                $table->text('allergies')->nullable();
                $table->text('notes_generales')->nullable();
                $table->date('date_creation')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dossier_medical');
    }
};
