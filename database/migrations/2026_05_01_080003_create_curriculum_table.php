<?php

use App\Enums\CurriculumSemesterType;
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
        Schema::create('curriculum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade')->onUpdate('cascade');
            $table->unsignedInteger('year_level')->default(1);
            $table->enum('semester_type', CurriculumSemesterType::values())->default(CurriculumSemesterType::FIRST->value);
            $table->boolean('is_required')->default(true);
            $table->json('prerequisite_subjects')->nullable();
            $table->decimal('units_override', 3, 1)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['program_id', 'subject_id']);
            $table->index(['program_id', 'year_level', 'semester_type']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum');
    }
};
