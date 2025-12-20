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
            'imageUrl' => 'nullable|url',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|in:restaurant,hotel,monument,museum,park,beach,mountain,city,other',
            'is_published' => 'boolean',
        ]);

        $imagePath = null;
        
        // Handle file upload first (takes priority over URL)
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('stories', 'public');
        } 
        // Handle image URL as fallback
        elseif (!empty($validated['imageUrl'])) {
            $imagePath = $validated['imageUrl'];
        }

        $story = new Story([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'location' => $validated['location'] ?? null,
            'type' => $validated['type'] ?? 'other',
            'image' => $imagePath,
            'is_published' => $validated['is_published'] ?? false,
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
            'views' => 0,
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
            'imageUrl' => 'nullable|url',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|in:restaurant,hotel,monument,museum,park,beach,mountain,city,other',
            'is_published' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists and it's a local file
            if ($story->image && strpos($story->image, 'http') === false) {
                Storage::disk('public')->delete($story->image);
            }
            $validated['image'] = $request->file('image')->store('stories', 'public');
        } elseif (!empty($validated['imageUrl'])) {
            // Handle image URL
            if ($story->image && strpos($story->image, 'http') === false) {
                Storage::disk('public')->delete($story->image);
            }
            $validated['image'] = $validated['imageUrl'];
            unset($validated['imageUrl']);
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

    /**
     * Like a story.
     */
    public function like($id)
    {
        $story = Story::findOrFail($id);
        $user = Auth::user();

        if ($user->likedStories()->where('story_id', $story->id)->exists()) {
            return response()->json([
                'message' => 'Story already liked.'
            ], 400);
        }

        $user->likedStories()->attach($story->id);

        return response()->json([
            'message' => 'Story liked successfully.',
            'likes_count' => $story->likedBy()->count()
        ], 201);
    }

    /**
     * Unlike a story.
     */
    public function unlike($id)
    {
        $story = Story::findOrFail($id);
        $user = Auth::user();

        $user->likedStories()->detach($story->id);

        return response()->json([
            'message' => 'Story unliked successfully.',
            'likes_count' => $story->likedBy()->count()
        ]);
    }

    /**
     * Save a story.
     */
    public function save($id)
    {
        $story = Story::findOrFail($id);
        $user = Auth::user();

        if ($user->savedStories()->where('story_id', $story->id)->exists()) {
            return response()->json([
                'message' => 'Story already saved.'
            ], 400);
        }

        $user->savedStories()->attach($story->id);

        return response()->json([
            'message' => 'Story saved successfully.',
            'saves_count' => $story->savedBy()->count()
        ], 201);
    }

    /**
     * Unsave a story.
     */
    public function unsave($id)
    {
        $story = Story::findOrFail($id);
        $user = Auth::user();

        $user->savedStories()->detach($story->id);

        return response()->json([
            'message' => 'Story unsaved successfully.',
            'saves_count' => $story->savedBy()->count()
        ]);
    }

    /**
     * Get user's liked stories.
     */
    public function likedStories()
    {
        $stories = Auth::user()->likedStories()
            ->with('user')
            ->latest('likes.created_at')
            ->paginate(10);

        return response()->json([
            'stories' => $stories,
            'message' => 'Liked stories retrieved successfully.'
        ]);
    }

    /**
     * Get user's saved stories.
     */
    public function savedStories()
    {
        $stories = Auth::user()->savedStories()
            ->with('user')
            ->latest('saves.created_at')
            ->paginate(10);

        return response()->json([
            'stories' => $stories,
            'message' => 'Saved stories retrieved successfully.'
        ]);
    }

    /**
     * Get the authenticated user's own stories.
     */
    public function userStories()
    {
        $stories = Auth::user()->stories()
            ->with(['user', 'likedBy', 'savedBy'])
            ->latest('created_at')
            ->get();

        return response()->json([
            'stories' => $stories,
            'message' => 'User stories retrieved successfully.'
        ]);
    }

    /**
     * Increment view count for a story.
     */
    public function incrementViews($id)
    {
        $story = Story::findOrFail($id);
        $story->increment('views');

        return response()->json([
            'views' => $story->views,
            'message' => 'View count updated successfully.'
        ]);
    }
}
