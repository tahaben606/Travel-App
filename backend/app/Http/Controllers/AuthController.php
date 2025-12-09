<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:clients',
            'mot_de_passe' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create client
            $client = Client::create([
                'nom' => $request->nom,
                'email' => $request->email,
                'mot_de_passe' => Hash::make($request->mot_de_passe),
            ]);

            // Create Sanctum token
            $token = $client->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'client' => [
                    'id_client' => $client->id_client,
                    'nom' => $client->nom,
                    'email' => $client->email,
                    'date_inscription' => $client->date_inscription,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'mot_de_passe' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // Find client by email
        $client = Client::where('email', $request->email)->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found. Please check your email.',
            ], 404);
        }

        // Check password - since we have custom password field name
        if (!Hash::check($request->mot_de_passe, $client->mot_de_passe)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password. Please try again.',
            ], 401);
        }

        // Create token if using Sanctum
        if (method_exists($client, 'createToken')) {
            $token = $client->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'client' => [
                    'id_client' => $client->id_client,
                    'nom' => $client->nom,
                    'email' => $client->email,
                    'date_inscription' => $client->date_inscription,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } else {
            // If not using Sanctum, just return client data
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'client' => [
                    'id_client' => $client->id_client,
                    'nom' => $client->nom,
                    'email' => $client->email,
                    'date_inscription' => $client->date_inscription,
                ],
            ]);
        }

    } catch (\Exception $e) {
        \Log::error('Login error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Login failed. Please try again.',
            'error' => $e->getMessage()
        ], 500);
    }
}
}