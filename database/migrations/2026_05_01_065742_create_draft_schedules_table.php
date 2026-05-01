<?php

use App\Enums\DraftScheduleStatus;
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
        Schema::create('draft_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('status', DraftScheduleStatus::values())->default(DraftScheduleStatus::DRAFT->value);
            $table->text('notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('teacher_assignment_id')->nullable()->constrained('teacher_assignments')->onDelete('set null')->onUpdate('cascade')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index('teacher_id');
            $table->index('schedule_id');
            $table->index('status');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('draft_schedules');
    }
};
