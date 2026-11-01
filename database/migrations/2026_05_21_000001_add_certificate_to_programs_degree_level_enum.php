<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE programs MODIFY COLUMN degree_level ENUM('bachelor', 'master', 'doctoral', 'certificate') NOT NULL DEFAULT 'bachelor'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE programs MODIFY COLUMN degree_level ENUM('bachelor', 'master', 'doctoral') NOT NULL DEFAULT 'bachelor'");
        }
    }
};
