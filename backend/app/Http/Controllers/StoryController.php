<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoryController extends Controller
{
    /**
     * Display a listing of published stories.
     */
    public function index()
    {
        $stories = Story::with('user')
            ->published()
            ->latest('published_at')
            ->paginate(10);

        return response()->json([
            'stories' => $stories,
            'message' => 'Stories retrieved successfully.'
        ]);
    }

    /**
     * Store a newly created story in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'location' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('stories', 'public');
        }

        $story = new Story([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'location' => $validated['location'] ?? null,
            'image' => $imagePath,
            'is_published' => $validated['is_published'] ?? false,
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
        ]);

        $story->user()->associate(Auth::user());
        $story->save();

        return response()->json([
            'story' => $story->load('user'),
            'message' => 'Story created successfully.'
        ], 201);
    }

    /**
     * Display the specified story.
     */
    public function show($id)
    {
        $story = Story::with('user')
            ->published()
            ->findOrFail($id);

        return response()->json([
            'story' => $story,
            'message' => 'Story retrieved successfully.'
        ]);
    }

    /**
     * Update the specified story in storage.
     */
    public function update(Request $request, $id)
    {
        $story = Story::findOrFail($id);
        
        // Check if the authenticated user is the owner of the story
        if (Auth::id() !== $story->user_id) {
            return response()->json([
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'location' => 'nullable|string|max:255',
            'is_published' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($story->image) {
                Storage::disk('public')->delete($story->image);
            }
            $validated['image'] = $request->file('image')->store('stories', 'public');
        }

        // Update published_at if is_published is being set to true
        if (isset($validated['is_published']) && $validated['is_published'] && !$story->published_at) {
            $validated['published_at'] = now();
        }

        $story->update($validated);

        return response()->json([
            'story' => $story->fresh('user'),
            'message' => 'Story updated successfully.'
        ]);
    }

    /**
     * Remove the specified story from storage.
     */
    public function destroy($id)
    {
        $story = Story::findOrFail($id);
        
        // Check if the authenticated user is the owner of the story
        if (Auth::id() !== $story->user_id) {
            return response()->json([
                'message' => 'Unauthorized action.'
            ], 403);
        }

        // Delete the image if exists
        if ($story->image) {
            Storage::disk('public')->delete($story->image);
        }

        $story->delete();

        return response()->json([
            'message' => 'Story deleted successfully.'
        ], 204);
    }
}
