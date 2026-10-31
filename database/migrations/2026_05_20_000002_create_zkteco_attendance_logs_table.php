<?php

use App\Enums\ZktecoMatchStatus;
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
        Schema::create('zkteco_attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zkteco_device_id')
                ->constrained('zkteco_devices')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreignId('classroom_id')
                ->constrained('classrooms')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->string('biometric_pin', 50);
            $table->foreignId('teacher_id')
                ->nullable()
                ->constrained('teachers')
                ->onDelete('set null')
                ->onUpdate('cascade');
            $table->dateTime('punch_time');
            $table->enum('punch_type', ['check_in', 'check_out', 'auto'])->default('auto');
            $table->enum('verify_type', ['fingerprint', 'face', 'rfid_card', 'password', 'other'])->default('fingerprint');
            $table->enum('match_status', ZktecoMatchStatus::values())->default(ZktecoMatchStatus::NO_SCHEDULED_CLASS->value);
            $table->foreignId('teacher_schedule_id')
                ->nullable()
                ->constrained('teacher_schedules')
                ->onDelete('set null')
                ->onUpdate('cascade');
            $table->foreignId('attendance_record_id')
                ->nullable()
                ->constrained('attendance_records')
                ->onDelete('set null')
                ->onUpdate('cascade');
            $table->string('rejection_reason', 255)->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('zkteco_device_id');
            $table->index('classroom_id');
            $table->index('teacher_id');
            $table->index('punch_time');
            $table->index('match_status');
            $table->index('biometric_pin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zkteco_attendance_logs');
    }
};
