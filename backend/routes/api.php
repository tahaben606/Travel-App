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

// Auth endpoints using AuthController
Route::post('/auth/signup', [\App\Http\Controllers\AuthController::class, 'signup']);
Route::post('/auth/register', [\App\Http\Controllers\AuthController::class, 'signup']);
Route::post('/auth/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::get('/auth/me', [\App\Http\Controllers\AuthController::class, 'me']);

// Protected auth endpoint
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
});

// Story routes
Route::get('/stories', [\App\Http\Controllers\StoryController::class, 'index']);
Route::get('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'show']);

// Location endpoints (no auth required)
Route::get('/locations/countries', [\App\Http\Controllers\LocationController::class, 'countries']);
Route::get('/locations/cities', [\App\Http\Controllers\LocationController::class, 'cities']);
Route::get('/locations/types', [\App\Http\Controllers\LocationController::class, 'types']);
Route::get('/locations', [\App\Http\Controllers\LocationController::class, 'all']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stories', [\App\Http\Controllers\StoryController::class, 'store']);
    Route::put('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'update']);
    Route::delete('/stories/{id}', [\App\Http\Controllers\StoryController::class, 'destroy']);
    
    // Like and Save endpoints
    Route::post('/stories/{id}/like', [\App\Http\Controllers\StoryController::class, 'like']);
    Route::post('/stories/{id}/unlike', [\App\Http\Controllers\StoryController::class, 'unlike']);
    Route::post('/stories/{id}/save', [\App\Http\Controllers\StoryController::class, 'save']);
    Route::post('/stories/{id}/unsave', [\App\Http\Controllers\StoryController::class, 'unsave']);
    
    // User stories endpoints
    Route::get('/user/stories', [\App\Http\Controllers\StoryController::class, 'userStories']);
    
    // Profile endpoints
    Route::get('/profile/liked-stories', [\App\Http\Controllers\StoryController::class, 'likedStories']);
    Route::get('/profile/saved-stories', [\App\Http\Controllers\StoryController::class, 'savedStories']);
});

// View increment endpoint (no auth required - public endpoint)
Route::post('/stories/{id}/increment-views', [\App\Http\Controllers\StoryController::class, 'incrementViews']);

