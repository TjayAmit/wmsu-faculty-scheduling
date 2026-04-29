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
            $table->foreignId('time_slot_id')->constrained('time_slots')->onDelete('restrict')->onUpdate('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])->default('monday');
            $table->string('room', 50)->nullable();
            $table->string('section', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('subject_id');
            $table->index('semester_id');
            $table->index('time_slot_id');
            $table->index(['semester_id', 'day_of_week', 'time_slot_id']);
            $table->index('is_active');
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
