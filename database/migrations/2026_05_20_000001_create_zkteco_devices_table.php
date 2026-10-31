<?php

use App\Enums\ZktecoDeviceStatus;
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
        Schema::create('zkteco_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')
                ->unique()
                ->constrained('classrooms')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->string('device_name', 100);
            $table->string('ip_address', 45);
            $table->unsignedInteger('port')->default(4370);
            $table->string('comm_key', 50)->nullable();
            $table->string('serial_number', 100)->nullable()->unique();
            $table->string('model_name', 100)->nullable();
            $table->enum('connection_type', ['tcp', 'udp', 'push'])->default('tcp');
            $table->enum('status', ZktecoDeviceStatus::values())->default(ZktecoDeviceStatus::OFFLINE->value);
            $table->dateTime('last_sync_at')->nullable();
            $table->dateTime('last_heartbeat_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('is_active');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zkteco_devices');
    }
};
