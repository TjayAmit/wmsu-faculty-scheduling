<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('qr_kiosks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')
                ->constrained('classrooms')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->string('kiosk_name', 120);
            $table->string('kiosk_token', 128)->unique();
            $table->string('browser_name', 150)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->foreignId('registered_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->dateTime('registered_at');
            $table->dateTime('last_used_at')->nullable();
            $table->unsignedInteger('scans_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('classroom_id');
            $table->index('is_active');
            $table->index('kiosk_token');
        });

        Schema::table('zkteco_attendance_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('zkteco_device_id')->nullable()->change();
            $table->foreignId('qr_kiosk_id')
                ->nullable()
                ->after('zkteco_device_id')
                ->constrained('qr_kiosks')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });

        // Expand verify_type to support 'qr_kiosk'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE zkteco_attendance_logs MODIFY COLUMN verify_type ENUM('fingerprint', 'face', 'rfid_card', 'password', 'qr_kiosk', 'other') NOT NULL DEFAULT 'fingerprint'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE zkteco_attendance_logs SET verify_type = 'other' WHERE verify_type = 'qr_kiosk'");
            DB::statement("ALTER TABLE zkteco_attendance_logs MODIFY COLUMN verify_type ENUM('fingerprint', 'face', 'rfid_card', 'password', 'other') NOT NULL DEFAULT 'fingerprint'");
        }

        Schema::table('zkteco_attendance_logs', function (Blueprint $table) {
            $table->dropForeign(['qr_kiosk_id']);
            $table->dropColumn('qr_kiosk_id');
        });

        Schema::dropIfExists('qr_kiosks');
    }
};
