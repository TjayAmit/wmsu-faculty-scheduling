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
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_code', 20)->unique();
            $table->foreignId('program_id')->constrained('programs')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('restrict')->onUpdate('cascade');
            $table->unsignedInteger('year_level')->default(1);
            $table->unsignedInteger('max_students')->default(40);
            $table->unsignedInteger('current_students')->default(0);
            $table->foreignId('adviser_id')->nullable()->constrained('teachers')->onDelete('set null')->onUpdate('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['program_id', 'semester_id']);
            $table->index('adviser_id');
            $table->index('is_active');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
