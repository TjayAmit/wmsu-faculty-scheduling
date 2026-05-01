<?php

use App\Enums\DayOfWeek;
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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('restrict')->onUpdate('cascade');
            $table->json('time_slots')->nullable();
            $table->string('room', 50)->nullable();
            $table->string('section', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('subject_id');
            $table->index('semester_id');
            $table->index(['semester_id', 'is_active']);
            $table->index('is_active');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
