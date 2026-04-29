<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Users Routes
    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [App\Http\Controllers\UserController::class, 'create'])->name('users.create');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [App\Http\Controllers\UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    // Teachers Routes
    Route::get('teachers', [App\Http\Controllers\TeacherController::class, 'index'])->name('teachers.index');
    Route::get('teachers/create', [App\Http\Controllers\TeacherController::class, 'create'])->name('teachers.create');
    Route::post('teachers', [App\Http\Controllers\TeacherController::class, 'store'])->name('teachers.store');
    Route::get('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'show'])->name('teachers.show');
    Route::get('teachers/{teacher}/edit', [App\Http\Controllers\TeacherController::class, 'edit'])->name('teachers.edit');
    Route::put('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('teachers/{teacher}', [App\Http\Controllers\TeacherController::class, 'destroy'])->name('teachers.destroy');

    // Subjects Routes
    Route::get('subjects', [App\Http\Controllers\SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/create', [App\Http\Controllers\SubjectController::class, 'create'])->name('subjects.create');
    Route::post('subjects', [App\Http\Controllers\SubjectController::class, 'store'])->name('subjects.store');
    Route::get('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'show'])->name('subjects.show');
    Route::get('subjects/{subject}/edit', [App\Http\Controllers\SubjectController::class, 'edit'])->name('subjects.edit');
    Route::put('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('subjects/{subject}', [App\Http\Controllers\SubjectController::class, 'destroy'])->name('subjects.destroy');
});

require __DIR__.'/settings.php';
