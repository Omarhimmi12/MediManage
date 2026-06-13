<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('user_type');
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id', 'user_type'], 'conv_part_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_participants');
    }
};
