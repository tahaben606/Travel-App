# Travel Stories Feature - Complete Setup

## Overview

The Stories feature allows authenticated users to create, read, update, and delete travel stories. Public users can view published stories without authentication.

## Database

### Table: stories

Location: `backend/database/migrations/0001_01_01_000001_create_stories_table.php`

**Columns:**

- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table (cascade on delete)
- `title` - String, required
- `content` - Text, required
- `image` - String, nullable (stored in `storage/app/public/stories/`)
- `location` - String, nullable
- `published_at` - Timestamp, nullable
- `is_published` - Boolean, default false
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `deleted_at` - Soft delete timestamp

## Backend

### Model: Story

Location: `backend/app/Models/Story.php`

**Relationships:**

- `user()` - BelongsTo User (story author)

**Scopes:**

- `published()` - Returns only published stories

**Fillable Fields:**

```php
['user_id', 'title', 'content', 'image', 'location', 'published_at', 'is_published']
```

### Controller: StoryController

Location: `backend/app/Http/Controllers/StoryController.php`

**Methods:**

1. **index()** - GET /api/stories

   - Returns: Paginated list of published stories with user info
   - Auth: Not required
   - Response:

   ```json
   {
     "stories": {
       "data": [...],
       "current_page": 1,
       "per_page": 10
     },
     "message": "Stories retrieved successfully."
   }
   ```

2. **store()** - POST /api/stories

   - Creates new story
   - Auth: Required (Bearer token)
   - Body:

   ```json
   {
     "title": "string",
     "content": "string",
     "location": "string (optional)",
     "image": "file (optional)",
     "is_published": "boolean"
   }
   ```

   - Response: 201 Created with story object

3. **show(id)** - GET /api/stories/{id}

   - Returns: Single published story with author info
   - Auth: Not required
   - Response: Story object with user

4. **update(id)** - PUT /api/stories/{id}

   - Updates story (author only)
   - Auth: Required
   - Authorization: User must be story owner
   - Body: Same as store (partial)
   - Response: Updated story object

5. **destroy(id)** - DELETE /api/stories/{id}
   - Deletes story (author only, soft delete)
   - Auth: Required
   - Authorization: User must be story owner
   - Response: 204 No Content

### API Routes

Location: `backend/routes/api.php`

```
GET     /api/stories           → StoryController@index
GET     /api/stories/{id}      → StoryController@show
POST    /api/stories           → StoryController@store (protected)
PUT     /api/stories/{id}      → StoryController@update (protected)
DELETE  /api/stories/{id}      → StoryController@destroy (protected)
```

### CORS Configuration

Location: `backend/config/cors.php`

**Allowed Origins:**

- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:8000
- http://127.0.0.1:8000

**Allowed Methods:** All (GET, POST, PUT, DELETE, OPTIONS, etc.)

**Credentials:** Supported

## Frontend

### Components

#### StoriesList.jsx

Location: `frontend/src/pages/StoriesList.jsx`

- Displays grid of published stories
- Public view (no authentication required)
- Features:
  - Story cards with image, title, location, date
  - "Share Your Story" button (logged-in users only)
  - Error handling and loading states
  - Responsive grid layout

#### StoryDetail.jsx

Location: `frontend/src/pages/StoryDetail.jsx`

- Full story view with author info
- Public view
- Features:
  - Full story content
  - Story metadata (author, location, date)
  - Edit/Delete buttons (author only)
  - Soft delete confirmation

#### CreateStory.jsx

Location: `frontend/src/pages/CreateStory.jsx`

- Form to create new story
- Protected route (authentication required)
- Features:
  - Title and content fields (required)
  - Location field (optional)
  - Image upload with preview
  - Publish toggle
  - Form validation
  - Loading and error states

### Navigation

#### Header.js

Location: `frontend/src/components/Header.js`

**Navigation Links (for authenticated users):**

- Dashboard → /dashboard
- Stories → /stories
- New Story → /stories/create (button)

### Context

#### AuthContext.js

Location: `frontend/src/context/AuthContext.js`

**Provides:**

- `user` / `currentUser` - Current logged-in user object
- `token` / `auth_token` - Authentication token
- `login(userData, token)` - Login user
- `logout()` - Logout user
- `isAuthenticated` - Boolean flag
- `authFetch(url, options)` - Helper for authenticated requests
- `authHeader()` - Returns Authorization header object

**Token Storage:**

- `localStorage.getItem('auth_token')` - Bearer token
- `localStorage.getItem('token')` - Backup reference
- `localStorage.getItem('user_data')` - User object (JSON string)

### Styling

Location: `frontend/src/styles/Stories.css`

**Classes:**

- `.stories-container` - Main container
- `.stories-header` - Header with title and create button
- `.stories-grid` - Responsive grid layout
- `.story-card` - Individual story card with hover effects
- `.story-detail-container` - Full story view
- `.error-message` - Error display
- `.no-stories` - Empty state message

### Routes

Location: `frontend/src/App.js`

```
GET     /stories           → StoriesList (public)
GET     /stories/:id       → StoryDetail (public)
GET     /stories/create    → CreateStory (protected)
```

## Workflow

### Creating a Story

1. Authenticated user clicks "New Story" button in header or "Share Your Story" in StoriesList
2. Navigates to `/stories/create`
3. CreateStory component checks authentication - redirects to login if needed
4. User fills form:
   - Title (required)
   - Content (required)
   - Location (optional)
   - Image (optional)
   - Publish toggle (optional)
5. Form submission:
   - Validates required fields
   - Sends POST request to `/api/stories` with Bearer token
   - Includes FormData for file upload
6. On success:
   - Story created in database
   - Redirects to `/stories`
   - Toast notification
7. On error:
   - Displays error message
   - Form remains populated

### Viewing Stories

1. User visits `/stories` (no authentication required)
2. Fetches published stories from `/api/stories`
3. Displays in grid with image, title, metadata
4. User clicks story card or "Read More"
5. Navigates to `/stories/{id}`
6. StoryDetail fetches story from `/api/stories/{id}`
7. Displays full content with author info
8. If user is author, shows Edit and Delete buttons

### Editing a Story

1. Author clicks Edit button on story detail
2. Navigates to edit page (route not yet implemented)
3. Pre-fills form with existing story data
4. Sends PUT request to `/api/stories/{id}`
5. On success, redirects to story detail view

### Deleting a Story

1. Author clicks Delete button
2. Confirmation dialog appears
3. Sends DELETE request to `/api/stories/{id}`
4. On success, soft deletes story (deleted_at is set)
5. Redirects to `/stories` list

## Security

### Authentication

- Token-based (Bearer token in Authorization header)
- Tokens stored in localStorage
- Verified by Sanctum middleware on protected routes

### Authorization

- Story authors can only edit/delete their own stories
- Controller checks: `Auth::id() !== $story->user_id`
- Returns 403 Forbidden if unauthorized

### File Upload

- Only images allowed: jpeg, png, jpg, gif
- Max 2MB
- Stored in `storage/app/public/stories/`
- Served via `/storage/` public path

### Soft Deletes

- Stories are soft-deleted (not permanently removed)
- `deleted_at` timestamp is set
- Can be recovered if needed
- Restored stories revert to previous published state

## Testing Workflow

1. Start backend: `php artisan serve` (runs on localhost:8000)
2. Start frontend: `npm start` (runs on localhost:3000)
3. Signup new account at `/signup`
4. Login at `/login`
5. View published stories at `/stories`
6. Create new story at `/stories/create`
7. View story detail at `/stories/{id}`
8. Edit/delete story if you're the author
9. Logout and verify public stories still visible

## Environment Variables Needed

Backend (`backend/.env`):

```
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=travel_app
DB_USERNAME=postgres
DB_PASSWORD=password

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

Frontend (`frontend/.env` or implicit):

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_UPLOAD_URL=http://localhost:8000/storage
```

## File Structure Summary

```
Backend:
├── app/Models/Story.php
├── app/Http/Controllers/StoryController.php
├── database/migrations/0001_01_01_000001_create_stories_table.php
├── routes/api.php
├── config/cors.php
└── bootstrap/app.php

Frontend:
├── src/pages/
│   ├── StoriesList.jsx
│   ├── StoryDetail.jsx
│   └── CreateStory.jsx
├── src/context/AuthContext.js
├── src/components/Header.js
├── src/styles/Stories.css
└── src/App.js
```

## Notes

- Stories must be explicitly published (`is_published: true`) to appear in listings
- `published_at` is automatically set when story is first published
- All API responses include a `message` field
- Image URLs are prefixed with `http://localhost:8000/storage/`
- Pagination is handled server-side (10 per page by default)
- CORS is enabled to allow frontend requests from port 3000

## Future Enhancements

- [ ] Edit story form and route
- [ ] Search and filter stories
- [ ] Story comments/reactions
- [ ] Story categories/tags
- [ ] Save stories as drafts
- [ ] Share stories feature
- [ ] Story view count
- [ ] Pagination in frontend
- [ ] Image optimization on upload
