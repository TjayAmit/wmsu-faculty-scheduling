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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')
                ->nullable()
                ->after('remember_token')
                ->constrained('departments')
                ->nullOnDelete();
        });

        // Assign Dr. Lourdes Fernandez (COEd Dean) to COEd department
        $coedDepartment = DB::table('departments')->where('code', 'COEd')->first();
        if ($coedDepartment) {
            DB::table('users')
                ->where('email', 'faculty.admin@example.com')
                ->update(['department_id' => $coedDepartment->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });
    }
};
