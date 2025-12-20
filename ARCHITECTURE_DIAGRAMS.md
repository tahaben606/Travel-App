# Stories Feature - Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (localhost:3000)                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              React Frontend (Port 3000)              │ │
│  │                                                      │ │
│  │  StoriesList.jsx    StoryDetail.jsx  CreateStory.jsx│ │
│  │      (View)              (View)         (Create)    │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────┐    │ │
│  │  │        AuthContext.js (State Mgmt)        │    │ │
│  │  │  - user, token, login, logout, authFetch  │    │ │
│  │  │  - localStorage: auth_token, user_data    │    │ │
│  │  └────────────────────────────────────────────┘    │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────┐    │ │
│  │  │         Header.js (Navigation)             │    │ │
│  │  │  - Dashboard, Stories, New Story           │    │ │
│  │  │  - User menu, Logout                       │    │ │
│  │  └────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                 │
│                          │ HTTP/CORS                       │
│                          │ (Bearer Token in header)        │
│                          ▼                                 │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────────┐         ┌──────────────────────┐
│  Laravel Backend     │         │   PostgreSQL         │
│  (Port 8000)         │         │   Database           │
│                      │         │                      │
│ ┌──────────────────┐ │         │ ┌─────────────────┐ │
│ │ API Routes       │◄─┼────────┼─►│ stories table   │ │
│ │ /api/stories     │ │         │ │ /users table    │ │
│ │ /api/auth/*      │ │         │ └─────────────────┘ │
│ └──────────────────┘ │         └──────────────────────┘
│                      │
│ ┌──────────────────┐ │
│ │ StoryController  │ │
│ │ - index()        │ │
│ │ - store()        │ │
│ │ - show()         │ │
│ │ - update()       │ │
│ │ - destroy()      │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Story Model      │ │
│ │ - hasMany user   │ │
│ │ - published()    │ │
│ │ - soft deletes   │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ File Storage     │ │
│ │ storage/         │ │
│ │ app/public/      │ │
│ │ stories/         │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

## User Authentication & Story Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER STORY CREATION FLOW                │
└─────────────────────────────────────────────────────────────┘

1. LOGIN PHASE
   ┌──────────────────┐
   │  User @ /login   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ POST /api/auth/login                │
   │ Body: email, mot_de_passe           │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ AuthController@login()               │
   │ - Hash password validation           │
   │ - Generate token (Str::random)       │
   │ - Update remember_token in DB        │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Response: { token, user }            │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ AuthContext.login(userData, token)  │
   │ localStorage.setItem('auth_token')  │
   │ localStorage.setItem('token')       │
   │ setUser(userData)                   │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────┐
   │ Redirect /stories│
   └──────────────────┘

2. CREATE STORY PHASE
   ┌──────────────────────────────┐
   │  User @ /stories/create      │
   │  (Protected Route)           │
   └──────────┬───────────────────┘
              │
              ▼
   ┌────────────────────────────────────────────┐
   │ CreateStory.jsx renders form               │
   │ - Check currentUser via useAuth()          │
   │ - If null, redirect to /login              │
   └──────────┬─────────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────────┐
   │ User fills form:                        │
   │ - title (required)                      │
   │ - content (required)                    │
   │ - location (optional)                   │
   │ - image (optional)                      │
   │ - is_published (toggle)                 │
   └──────────┬────────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────────┐
   │ Form validation:                        │
   │ if (!title || !content) error           │
   └──────────┬────────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────────┐
   │ Create FormData object                  │
   │ append('title', value)                  │
   │ append('content', value)                │
   │ append('image', file) - if provided     │
   │ append('location', value)               │
   │ append('is_published', boolean)         │
   └──────────┬────────────────────────────────┘
              │
              ▼
   ┌────────────────────────────────────────────────┐
   │ POST /api/stories                             │
   │ Headers:                                       │
   │ - Authorization: Bearer {token}              │
   │ - Accept: application/json                   │
   │ Body: FormData                               │
   └────────┬───────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────┐
   │ StoryController@store()                       │
   │ 1. Validate input                             │
   │    - title: required, string, max 255         │
   │    - content: required, string                │
   │    - location: nullable, string               │
   │    - image: nullable, image file, max 2MB     │
   │                                               │
   │ 2. Store image if provided                    │
   │    - store('stories', 'public')               │
   │    - Save path to $imagePath                  │
   │                                               │
   │ 3. Create Story object                        │
   │    - New Story([...fields])                   │
   │    - user_id = Auth::user()->id              │
   │    - published_at = now() if is_published    │
   │                                               │
   │ 4. Save to database                           │
   │    - $story->save()                           │
   └────────┬───────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────┐
   │ Database: INSERT INTO stories                  │
   │ - id (auto-increment)                         │
   │ - user_id                                     │
   │ - title                                       │
   │ - content                                     │
   │ - image (path)                                │
   │ - location                                    │
   │ - is_published                                │
   │ - published_at (timestamp)                    │
   │ - created_at, updated_at                      │
   └────────┬───────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────┐
   │ Response: 201 Created                         │
   │ {                                             │
   │   "story": { id, title, content, ... },      │
   │   "message": "Story created successfully."    │
   │ }                                             │
   └────────┬───────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────┐
   │ Frontend receives response                    │
   │ - Show success toast notification             │
   │ - Navigate to /stories                        │
   └────────┬───────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────┐
   │ User sees story in list│
   └────────────────────────┘
```

---

## API Request/Response Cycles

### Get Stories List

```
REQUEST:
  GET /api/stories
  Headers:
    Content-Type: application/json
    Accept: application/json

PROCESSING:
  StoryController@index()
    ├─ Story::with('user')
    ├─ ->published()
    ├─ ->latest('published_at')
    └─ ->paginate(10)

RESPONSE (200 OK):
  {
    "stories": {
      "data": [
        {
          "id": 1,
          "user_id": 1,
          "title": "My Paris Adventure",
          "content": "Lorem ipsum...",
          "image": "stories/abc123.jpg",
          "location": "Paris",
          "published_at": "2025-12-11T10:30:00Z",
          "is_published": true,
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
          },
          "created_at": "2025-12-11T10:30:00Z",
          "updated_at": "2025-12-11T10:30:00Z"
        }
      ],
      "current_page": 1,
      "per_page": 10,
      "total": 1
    },
    "message": "Stories retrieved successfully."
  }
```

### Create Story

```
REQUEST:
  POST /api/stories
  Headers:
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
    Content-Type: multipart/form-data
    Accept: application/json

  Body (FormData):
    title=My Story
    content=Story content here
    location=Paris, France
    image=(binary file data)
    is_published=true

PROCESSING:
  Middleware: auth:sanctum
    └─ Verify Bearer token
       └─ Find user by token

  StoryController@store()
    ├─ Validate inputs
    ├─ Store image to storage/app/public/stories/
    ├─ Create Story model instance
    ├─ Set user_id = Auth::id()
    ├─ Set published_at = now()
    └─ Save to database

RESPONSE (201 Created):
  {
    "story": {
      "id": 1,
      "user_id": 1,
      "title": "My Story",
      "content": "Story content here",
      "image": "stories/[uuid].jpg",
      "location": "Paris, France",
      "is_published": true,
      "published_at": "2025-12-11T10:35:00Z",
      "created_at": "2025-12-11T10:35:00Z",
      "updated_at": "2025-12-11T10:35:00Z",
      "user": { ... }
    },
    "message": "Story created successfully."
  }
```

### Delete Story

```
REQUEST:
  DELETE /api/stories/1
  Headers:
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
    Accept: application/json

PROCESSING:
  Middleware: auth:sanctum
    └─ Verify user is authenticated

  StoryController@destroy()
    ├─ Find story by id
    ├─ Check if Auth::id() === story.user_id
    │  └─ If not: return 403 Forbidden
    ├─ Delete image from storage
    └─ Soft delete story ($story->delete())
       └─ Set deleted_at timestamp

DATABASE:
  UPDATE stories SET deleted_at = NOW()
  WHERE id = 1

RESPONSE (204 No Content):
  (empty body)
```

---

## State Management Flow

```
Browser LocalStorage
    │
    ├─ auth_token: "eyJ0eXAi..."
    ├─ token: "eyJ0eXAi..."
    └─ user_data: "{"id": 1, "name": "John"...}"
         │
         ▼
    AuthContext
         │
         ├─ user (state)
         ├─ token (state)
         │
         ├─ Methods:
         │  ├─ login(userData, token)
         │  ├─ logout()
         │  ├─ authFetch(url, options)
         │  └─ authHeader()
         │
         └─ Provider value:
            ├─ user
            ├─ currentUser (alias)
            ├─ token
            ├─ isAuthenticated
            └─ (passed to children)
                │
                ▼
            Components use useAuth()
                │
                ├─ Header.js
                ├─ StoriesList.jsx
                ├─ StoryDetail.jsx
                ├─ CreateStory.jsx
                ├─ ProtectedRoute.js
                └─ etc.
```

---

## Database Relationships

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ password            │
│ remember_token      │
│ created_at          │
│ updated_at          │
└─────────┬───────────┘
          │
          │ 1
          │
          │ (user_id FK)
          │
          │ N
          │
┌─────────▼───────────┐
│     stories         │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK) ─────┐ │
│ title              │ │
│ content           │ │
│ image              │ │
│ location           │ │
│ published_at       │ │
│ is_published       │ │
│ created_at         │ │
│ updated_at         │ │
│ deleted_at (soft)  │ │
└─────────────────────┘ │
         ▲              │
         └──────────────┘
    Relationship:
    - User has many Stories
    - Story belongs to User
    - Delete user → Delete stories (cascade)
    - Soft delete story (deleted_at set)
```

---

## Component Hierarchy

```
App
├── Header
│   ├── Navigation Links
│   ├── Mobile Menu
│   └── User Menu
│
├── Routes
│   ├── / (Landing)
│   ├── /login (Login)
│   ├── /signup (Signup)
│   ├── /dashboard (Protected)
│   ├── /about (About)
│   │
│   └── /stories (Public)
│       ├── StoriesList
│       │   ├── Story Card (mapped)
│       │   └── Create Story Button
│       │
│       ├── /stories/:id (Public)
│       │   └── StoryDetail
│       │       ├── Featured Image
│       │       ├── Story Content
│       │       ├── Author Info
│       │       └── Edit/Delete (auth required)
│       │
│       └── /stories/create (Protected)
│           └── CreateStory
│               ├── Title Input
│               ├── Content Textarea
│               ├── Location Input
│               ├── Image Upload
│               ├── Publish Toggle
│               └── Submit Button
│
├── ProtectedRoute (wrapper)
│   └─ Redirects to login if not authenticated
│
└── Providers
    ├── AuthProvider
    │   └── AuthContext
    └── StoriesProvider
        └── StoriesContext
```

---

## Error Handling Flow

```
Try to Create Story
    │
    ├─ Validation Error (400)
    │  └─ Display validation error message
    │     "Title and content are required"
    │
    ├─ Unauthorized (401)
    │  └─ Token missing/invalid
    │     └─ Redirect to /login
    │
    ├─ Forbidden (403)
    │  └─ User not owner (for update/delete)
    │     └─ "You cannot modify this story"
    │
    ├─ Not Found (404)
    │  └─ Story doesn't exist
    │     └─ "Story not found"
    │
    ├─ Server Error (500)
    │  └─ Database error
    │     └─ "Failed to create story"
    │
    └─ Network Error
       └─ No connection
          └─ "Failed to connect to server"

All errors:
  └─ Display toast notification
  └─ Log to console
  └─ Show in UI
```

---

## File Upload Flow

```
User selects image file
    │
    ▼
File validation (frontend)
├─ Check file size < 2MB
├─ Check file type (jpeg, png, jpg, gif)
└─ Generate preview (DataURL)
    │
    ▼
FormData.append('image', file)
    │
    ▼
POST /api/stories with multipart/form-data
    │
    ▼
Laravel validation (backend)
├─ nullable (optional)
├─ image (file type)
├─ mimes: jpeg, png, jpg, gif
└─ max: 2048 KB
    │
    ▼
Store image
├─ $file->store('stories', 'public')
├─ Returns path: stories/[uuid].extension
└─ Save path to database
    │
    ▼
File stored at:
├─ Path in DB: stories/abc123.jpg
├─ File location: storage/app/public/stories/abc123.jpg
├─ Public URL: /storage/stories/abc123.jpg
└─ Full URL: http://localhost:8000/storage/stories/abc123.jpg

On delete:
├─ Storage::disk('public')->delete($story->image)
└─ File removed from filesystem
```

---

## Authentication Token Flow

```
Login Request
    │
    ▼
AuthController@login()
    │
    ├─ Validate email exists in database
    ├─ Hash::check(password, hashed_password)
    └─ If valid:
        ├─ Generate token: Str::random(64)
        ├─ Update DB: users.remember_token = token
        └─ Return: { token, user }
            │
            ▼
        Frontend receives token
            │
            ├─ AuthContext.login(userData, token)
            ├─ localStorage.setItem('auth_token', token)
            ├─ localStorage.setItem('token', token)
            └─ setUser(userData)
                │
                ▼
            Protected requests include header:
            Authorization: Bearer {token}
                │
                ▼
            Backend auth:sanctum middleware
                │
                ├─ Extract Bearer token from header
                ├─ Query: users.remember_token = token
                ├─ If found: set Auth::user()
                └─ If not found: return 401 Unauthorized

Logout:
    │
    ├─ POST /api/auth/logout
    ├─ (Optional server-side cleanup)
    └─ Frontend:
        ├─ localStorage.removeItem('auth_token')
        ├─ localStorage.removeItem('token')
        ├─ setUser(null)
        ├─ setToken(null)
        └─ Redirect to /
```

---

This architecture ensures:

- ✓ Secure token-based authentication
- ✓ Separation of concerns (frontend/backend)
- ✓ CORS enabled for cross-origin requests
- ✓ Protected routes require authentication
- ✓ Authorization checks prevent unauthorized actions
- ✓ Proper error handling and user feedback
- ✓ File upload support with validation
- ✓ Persistent login across page refreshes
