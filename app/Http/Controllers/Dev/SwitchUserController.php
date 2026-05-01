<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwitchUserController extends Controller
{
    public function __invoke(Request $request, User $user)
    {
        abort_unless(app()->environment('local'), 403);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
