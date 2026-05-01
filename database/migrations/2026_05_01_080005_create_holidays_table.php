<?php

use App\Enums\HolidayType;
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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->date('date')->unique();
            $table->enum('type', HolidayType::values())->default(HolidayType::REGULAR->value);
            $table->text('description')->nullable();
            $table->boolean('affects_schedules')->default(true);
            $table->string('academic_year', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('academic_year');
            $table->index('type');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
