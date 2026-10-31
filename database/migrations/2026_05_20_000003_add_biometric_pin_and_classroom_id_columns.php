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
        Schema::table('teachers', function (Blueprint $table) {
            if (! Schema::hasColumn('teachers', 'biometric_pin')) {
                $table->string('biometric_pin', 50)->nullable()->unique()->after('employee_id');
            }
        });

        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'classroom_id')) {
                $table->foreignId('classroom_id')
                    ->nullable()
                    ->after('semester_id')
                    ->constrained('classrooms')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
                $table->index('classroom_id');
            }
        });

        Schema::table('teacher_schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('teacher_schedules', 'classroom_id')) {
                $table->foreignId('classroom_id')
                    ->nullable()
                    ->after('room')
                    ->constrained('classrooms')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
                $table->index('classroom_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('teacher_schedules', 'classroom_id')) {
                $table->dropConstrainedForeignId('classroom_id');
            }
        });

        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'classroom_id')) {
                $table->dropConstrainedForeignId('classroom_id');
            }
        });

        Schema::table('teachers', function (Blueprint $table) {
            if (Schema::hasColumn('teachers', 'biometric_pin')) {
                $table->dropUnique(['biometric_pin']);
                $table->dropColumn('biometric_pin');
            }
        });
    }
};
