<?php

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
        Schema::create('teacher_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_assignment_id');
            $table->unsignedBigInteger('draft_schedule_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('semester_id');
            $table->unsignedBigInteger('teacher_id');
            $table->date('scheduled_date');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 50)->nullable();
            $table->string('section', 20)->nullable();
            $table->enum('status', ['scheduled', 'cancelled', 'completed', 'postponed'])->default('scheduled');
            $table->unsignedBigInteger('attendance_record_id')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_holiday')->default(false);
            $table->string('holiday_name', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['scheduled_date'], 'teacher_schedules_scheduled_date_index');
            $table->index(['teacher_id', 'semester_id', 'scheduled_date'], 'teacher_schedules_teacher_semester_date_index');
            $table->index(['status'], 'teacher_schedules_status_index');

            // Foreign keys
            $table->foreign('teacher_assignment_id')
                ->references('id')
                ->on('teacher_assignments')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('draft_schedule_id')
                ->references('id')
                ->on('draft_schedules')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('subject_id')
                ->references('id')
                ->on('subjects')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('semester_id')
                ->references('id')
                ->on('semesters')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('teacher_id')
                ->references('id')
                ->on('teachers')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('attendance_record_id')
                ->references('id')
                ->on('attendance_records')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_schedules');
    }
};
