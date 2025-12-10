<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // POST /api/auth/signup
    public function signup(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        // Check if email exists
        $existing = DB::selectOne('SELECT id, email FROM users WHERE email = ?', [$data['email']]);
        if ($existing) {
            return response()->json(['message' => 'Email already taken'], 422);
        }

        $token = Str::random(60);
        $now = now();
        $hashed = Hash::make($data['password']);

        // Insert user via raw SQL
        DB::insert(
            'INSERT INTO users (name, email, password, remember_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [$data['name'], $data['email'], $hashed, $token, $now, $now]
        );

        $user = DB::selectOne('SELECT id, name, email, remember_token AS token FROM users WHERE email = ?', [$data['email']]);

        return response()->json([
            'token' => $user->token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = DB::selectOne('SELECT * FROM users WHERE email = ?', [$data['email']]);
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = Str::random(60);
        DB::update('UPDATE users SET remember_token = ?, updated_at = ? WHERE id = ?', [$token, now(), $user->id]);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    // POST /api/auth/logout
    public function logout(Request $request)
    {
        $auth = $request->header('Authorization', '');
        if (str_starts_with($auth, 'Bearer ')) {
            $token = substr($auth, 7);
            DB::update('UPDATE users SET remember_token = NULL, updated_at = ? WHERE remember_token = ?', [now(), $token]);
        }
        return response()->json(['message' => 'Logged out']);
    }

    // GET /api/auth/me
    public function me(Request $request)
    {
        $auth = $request->header('Authorization', '');
        if (! str_starts_with($auth, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $token = substr($auth, 7);
        $user = DB::selectOne('SELECT id, name, email FROM users WHERE remember_token = ?', [$token]);
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return response()->json(['user' => $user]);
    }
}

