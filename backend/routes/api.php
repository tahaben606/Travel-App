<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

// Health check
Route::get('/test', function () {
    return response()->json(['success' => true, 'message' => 'Backend is working!'])
        ->header('Access-Control-Allow-Origin', '*');
});

// Client raw endpoint
Route::post('/client', function (Request $request) {
    $validated = $request->validate([
        'nom' => 'required|string',
        'email' => 'required|email',
        'mot_de_passe' => 'required|string|min:6',
    ]);

    $existingClient = DB::selectOne("SELECT * FROM clients WHERE email = ?", [$validated['email']]);
    if (! $existingClient) {
        $hashedPassword = Hash::make($validated['mot_de_passe']);
        DB::insert(
            "INSERT INTO clients (nom, email, mot_de_passe, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [$validated['nom'], $validated['email'], $hashedPassword, now(), now()]
        );
    }

    $clients = DB::select("SELECT * FROM clients");
    return response()->json([
        'success' => true,
        'message' => $existingClient ? 'Client already exists' : 'Client created successfully',
        'received' => $validated,
        'clients' => $clients,
        'count' => count($clients),
    ])->header('Access-Control-Allow-Origin', '*');
});

Route::options('/client', function () {
    return response()
        ->json(null)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// Auth endpoints (raw SQL on users table)
Route::post('/auth/signup', function (Request $request) {
    $data = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email',
        'password' => 'required|string|min:6',
    ]);

    $hashed = Hash::make($data['password']);
    $token = Str::random(60);
    DB::insert(
        "INSERT INTO users (name, email, password, remember_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [$data['name'], $data['email'], $hashed, $token, now(), now()]
    );

    $user = DB::selectOne("SELECT id, name, email, remember_token FROM users WHERE email = ?", [$data['email']]);

    return response()->json([
        'token' => $user->remember_token,
        'user' => $user,
    ], 201)->header('Access-Control-Allow-Origin', '*');
});

Route::post('/auth/login', function (Request $request) {
    $data = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = DB::selectOne("SELECT * FROM users WHERE email = ?", [$data['email']]);
    if (! $user || ! Hash::check($data['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401)
            ->header('Access-Control-Allow-Origin', '*');
    }

    $token = Str::random(60);
    DB::update("UPDATE users SET remember_token = ?, updated_at = ? WHERE id = ?", [$token, now(), $user->id]);

    $fresh = DB::selectOne("SELECT id, name, email, remember_token FROM users WHERE id = ?", [$user->id]);

    return response()->json([
        'token' => $token,
        'user' => $fresh,
    ])->header('Access-Control-Allow-Origin', '*');
});

Route::post('/auth/logout', function (Request $request) {
    $auth = $request->header('Authorization', '');
    if (str_starts_with($auth, 'Bearer ')) {
        $token = substr($auth, 7);
        DB::update("UPDATE users SET remember_token = NULL, updated_at = ? WHERE remember_token = ?", [now(), $token]);
    }
    return response()->json(['message' => 'Logged out'])
        ->header('Access-Control-Allow-Origin', '*');
});

Route::get('/auth/me', function (Request $request) {
    $auth = $request->header('Authorization', '');
    if (!str_starts_with($auth, 'Bearer ')) {
        return response()->json(['message' => 'Unauthorized'], 401)
            ->header('Access-Control-Allow-Origin', '*');
    }
    $token = substr($auth, 7);
    $user = DB::selectOne("SELECT id, name, email FROM users WHERE remember_token = ?", [$token]);
    if (! $user) {
        return response()->json(['message' => 'Unauthorized'], 401)
            ->header('Access-Control-Allow-Origin', '*');
    }
    return response()->json(['user' => $user])
        ->header('Access-Control-Allow-Origin', '*');
});

// Story routes
Route::get('/stories', [\App\Http\Controllers\StoryController::class, 'index'])
    ->middleware('cors');

Route::get('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'show'])
    ->middleware('cors');

// Protected routes (require authentication)
Route::middleware(['auth:sanctum', 'cors'])->group(function () {
    Route::post('/stories', [\App\Http\Controllers\StoryController::class, 'store']);
    Route::put('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'update']);
    Route::delete('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'destroy']);
});

