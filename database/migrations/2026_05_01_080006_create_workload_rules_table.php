<?php

use App\Enums\EmploymentType;
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
        Schema::create('workload_rules', function (Blueprint $table) {
            $table->id();
            $table->enum('employment_type', EmploymentType::values())->default(EmploymentType::FULL_TIME->value);
            $table->decimal('max_teaching_hours', 4, 1)->default(24.0);
            $table->decimal('max_units', 5, 1)->default(24.0);
            $table->decimal('min_units', 5, 1)->nullable();
            $table->decimal('max_preparation_hours', 4, 1)->nullable();
            $table->decimal('overtime_rate', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('effective_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index('employment_type');
            $table->index('is_active');
            $table->index('effective_date');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workload_rules');
    }
};
