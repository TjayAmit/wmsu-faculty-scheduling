<?php

use App\Enums\ConflictType;
use App\Enums\ConflictSeverity;
use App\Enums\ConflictStatus;
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
        Schema::create('schedule_conflicts', function (Blueprint $table) {
            $table->id();
            $table->enum('conflict_type', ConflictType::values())->default(ConflictType::TEACHER_OVERLAP->value);
            $table->foreignId('primary_schedule_id')->nullable()->constrained('schedules')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('secondary_schedule_id')->nullable()->constrained('schedules')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('time_slot_id')->nullable()->constrained('time_slots')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('day_of_week', DayOfWeek::values())->nullable();
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('severity', ConflictSeverity::values())->default(ConflictSeverity::MEDIUM->value);
            $table->enum('status', ConflictStatus::values())->default(ConflictStatus::PENDING->value);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('conflict_type');
            $table->index('teacher_id');
            $table->index('classroom_id');
            $table->index('time_slot_id');
            $table->index('semester_id');
            $table->index('severity');
            $table->index('status');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_conflicts');
    }
};
