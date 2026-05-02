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
        Schema::create('substitute_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requesting_teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('substitute_teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->foreignId('schedule_id')->nullable()->constrained()->onDelete('set null');
            $table->date('date');
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['requesting_teacher_id', 'status']);
            $table->index(['substitute_teacher_id', 'status']);
            $table->index(['date', 'status']);
            $table->index('approved_at');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('substitute_requests');
    }
};
