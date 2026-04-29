<?php

use App\Enums\AttendanceStatus;
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
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_assignment_id')->constrained('teacher_assignments')->onDelete('cascade')->onUpdate('cascade');
            $table->date('date');
            $table->enum('status', AttendanceStatus::values())->default(AttendanceStatus::PENDING->value);
            $table->timestamp('timestamp_in')->nullable();
            $table->timestamp('timestamp_out')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();

            $table->index('teacher_assignment_id');
            $table->index('date');
            $table->index('status');
            $table->unique(['teacher_assignment_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
