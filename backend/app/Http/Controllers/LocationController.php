<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    /**
     * Get all unique countries from stories
     */
    public function countries()
    {
        try {
            $countries = DB::table('stories')
                ->whereNotNull('location')
                ->select('location')
                ->distinct()
                ->get()
                ->map(function ($item) {
                    $parts = array_map('trim', explode(',', $item->location));
                    return end($parts); // Get the last part (country)
                })
                ->filter()
                ->unique()
                ->sort()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $countries,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all unique cities from stories
     */
    public function cities()
    {
        try {
            $cities = DB::table('stories')
                ->whereNotNull('location')
                ->select('location')
                ->distinct()
                ->get()
                ->map(function ($item) {
                    $parts = array_map('trim', explode(',', $item->location));
                    return count($parts) >= 2 ? $parts[0] : null; // Get the first part (city)
                })
                ->filter()
                ->unique()
                ->sort()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all unique story types
     */
    public function types()
    {
        try {
            $types = DB::table('stories')
                ->whereNotNull('type')
                ->distinct()
                ->pluck('type')
                ->sort()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $types,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all locations data (countries, cities, and types)
     */
    public function all()
    {
        try {
            $stories = DB::table('stories')
                ->whereNotNull('location')
                ->select('location', 'type')
                ->distinct()
                ->get();

            $countries = collect();
            $cities = collect();
            $types = collect();

            foreach ($stories as $story) {
                $parts = array_map('trim', explode(',', $story->location));
                
                if (count($parts) >= 2) {
                    $cities->push($parts[0]);
                    $countries->push(end($parts));
                } else {
                    $countries->push($parts[0]);
                }
                
                if ($story->type) {
                    $types->push($story->type);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'countries' => $countries->unique()->sort()->values(),
                    'cities' => $cities->unique()->sort()->values(),
                    'types' => $types->unique()->sort()->values(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
