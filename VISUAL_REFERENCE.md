# 🎬 Stories Feature - Visual Quick Reference

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                   TRAVEL APP - STORIES FEATURE v1.0                      ║
║                       Complete & Ready to Use                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🏗️ Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│                      User's Browser                              │
│                    (localhost:3000)                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ React App                                              │    │
│  │ ├─ StoriesList (public)                               │    │
│  │ ├─ StoryDetail (public)                               │    │
│  │ ├─ CreateStory (protected)                            │    │
│  │ └─ AuthContext (token management)                     │    │
│  └──────────────────┬───────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                       │
        HTTP + CORS + Bearer Token
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Laravel API Server                            │
│                    (localhost:8000)                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ API Routes                                             │    │
│  │ ├─ GET  /api/stories       (public)                   │    │
│  │ ├─ GET  /api/stories/{id}  (public)                   │    │
│  │ ├─ POST /api/stories       (protected)                │    │
│  │ ├─ PUT  /api/stories/{id}  (protected)                │    │
│  │ └─ DELETE /api/stories/{id} (protected)               │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                             │
│  ┌──────────────▼──────────────────────────────────────┐    │
│  │ StoryController                                     │    │
│  │ ├─ index()   (all stories)                          │    │
│  │ ├─ store()   (create)                               │    │
│  │ ├─ show()    (view one)                             │    │
│  │ ├─ update()  (edit)                                 │    │
│  │ └─ destroy() (delete)                               │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                             │
│  ┌──────────────▼──────────────────────────────────────┐    │
│  │ Story Model (with relationships)                    │    │
│  └──────────────┬──────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                              │
│                                                                  │
│  ┌─────────────┐              ┌──────────────┐               │
│  │ users       │◄─ 1:N ────►  │ stories      │               │
│  │ ├─ id       │              │ ├─ id        │               │
│  │ ├─ name     │              │ ├─ user_id   │               │
│  │ ├─ email    │              │ ├─ title     │               │
│  │ └─ ...      │              │ ├─ content   │               │
│  └─────────────┘              │ ├─ image     │               │
│                               │ ├─ location  │               │
│                               │ ├─ published │               │
│                               │ └─ deleted   │               │
│                               └──────────────┘               │
│                                                                  │
│  File Storage: storage/app/public/stories/                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    USER STORY: Create Story                 │
└─────────────────────────────────────────────────────────────┘

Step 1: Browse Stories (No login needed)
   Browser: http://localhost:3000/stories
         │
         ▼
   Fetch GET /api/stories
         │
         ▼
   View published stories list

Step 2: Click "New Story" (Must be logged in)
   Browser: http://localhost:3000/stories/create
         │
         ├─ Check: currentUser from AuthContext?
         │    ✓ Yes → Show form
         │    ✗ No → Redirect to login
         │
         ▼
   Fill form:
   ├─ Title (required)
   ├─ Content (required)
   ├─ Location (optional)
   ├─ Image (optional)
   └─ Publish checkbox

Step 3: Submit Form
   Browser sends: POST /api/stories
   Headers: Authorization: Bearer {token}
   Body: FormData with all fields
         │
         ▼
   Laravel checks token → OK
         │
   Server validates form → OK
         │
   Server stores image → OK
         │
   Server saves to DB → OK
         │
   Returns 201 + story data
         │
         ▼
   Browser shows success message
   Redirects to /stories
         │
         ▼
   Your story appears in list!

Step 4: View Your Story
   Click story card → GET /api/stories/{id}
         │
         ▼
   Shows full content + author
   Shows Edit/Delete buttons (you're the author)

Step 5: Delete Your Story (Optional)
   Click Delete → Confirmation dialog
         │
         ▼
   Browser sends: DELETE /api/stories/{id}
   Headers: Authorization: Bearer {token}
         │
         ▼
   Server checks: Are you the author?
         │
   ✓ Yes → Soft delete (set deleted_at)
   ✗ No → Return 403 Forbidden
         │
         ▼
   Story removed from public list
```

---

## 🔐 Authentication Flow

```
LOGIN
   Email + Password
         │
         ▼
   POST /api/auth/login
         │
   ┌─────┴────────────┐
   │ Validate email   │
   │ Hash password    │
   │ Generate token   │
   └─────┬────────────┘
         │
         ▼
   Response: { token, user }
         │
         ▼
   Frontend:
   localStorage.setItem('auth_token', token)
   localStorage.setItem('token', token)
   localStorage.setItem('user_data', user)
         │
         ▼
   AuthContext: setUser(), setToken()
         │
         ▼
   LOGGED IN ✅

USAGE
   All API requests include:
   Authorization: Bearer {token}
         │
   Server verifies token matches users.remember_token
         │
   ✓ Valid → Continue, Auth::user() available
   ✗ Invalid → Return 401 Unauthorized

LOGOUT
   Clear localStorage
   Clear AuthContext
   Optional: POST /api/auth/logout
         │
         ▼
   LOGGED OUT ✅
```

---

## 📊 Database Relationships

```
   Users Table                    Stories Table
   ─────────────                 ──────────────
   ┌─────────────┐               ┌──────────────┐
   │ id (PK)     │◄──────1:N──── │ id (PK)      │
   │ name        │               │ user_id (FK) │
   │ email       │               │ title        │
   │ password    │               │ content      │
   │ remember_   │               │ image        │
   │ token       │               │ location     │
   │ created_at  │               │ published_at │
   └─────────────┘               │ is_published │
                                 │ created_at   │
                                 │ updated_at   │
                                 │ deleted_at   │
                                 └──────────────┘

   1 User can have N Stories
   1 Story belongs to 1 User
   Delete User → All Stories deleted (cascade)
   Delete Story → Soft delete (not permanent)
```

---

## 🛣️ Frontend Routes

```
/                    Landing Page
  │
  ├─ /login          Login Form
  │
  ├─ /signup         Signup Form
  │
  ├─ /dashboard      [Protected] User Dashboard
  │
  ├─ /stories        [Public] All Stories List
  │   │
  │   ├─ /stories/:id       [Public] Story Details
  │   │
  │   └─ /stories/create    [Protected] Create Story
  │
  ├─ /about          About Page
  │
  └─ /*              Not Found → Redirect to /
```

---

## 🔌 API Endpoints at a Glance

```
┌─ PUBLIC ENDPOINTS (No auth needed)
│  │
│  ├─ GET  /api/stories         → Returns paginated list
│  │        Response: { stories, message }
│  │
│  └─ GET  /api/stories/{id}    → Returns single story
│           Response: { story, message }
│
├─ PROTECTED ENDPOINTS (Bearer token required)
│  │
│  ├─ POST   /api/stories       → Create new story
│  │          Body: { title, content, location?, image?, is_published }
│  │          Response: { story, message } [201]
│  │
│  ├─ PUT    /api/stories/{id}  → Update own story
│  │          Body: { title?, content?, ... }
│  │          Response: { story, message } [200]
│  │          Error: 403 if not owner
│  │
│  └─ DELETE /api/stories/{id}  → Delete own story
│             Response: 204 No Content
│             Error: 403 if not owner
│
└─ AUTHENTICATION ENDPOINTS
   │
   ├─ POST /api/auth/signup     → Register new user
   │        Body: { nom, email, mot_de_passe }
   │
   ├─ POST /api/auth/login      → Login user
   │        Body: { email, mot_de_passe }
   │
   ├─ POST /api/auth/logout     → Logout (protected)
   │
   └─ GET  /api/auth/me         → Get current user (protected)
```

---

## 📁 Key File Locations

```
Backend Structure:
├── app/Http/Controllers/StoryController.php   ← Story operations
├── app/Models/Story.php                       ← Data model
├── database/migrations/*stories*               ← DB schema
├── routes/api.php                             ← API routes
└── config/cors.php                            ← CORS config

Frontend Structure:
├── src/pages/StoriesList.jsx                  ← List view
├── src/pages/StoryDetail.jsx                  ← Detail view
├── src/pages/CreateStory.jsx                  ← Create form
├── src/context/AuthContext.js                 ← Auth state
├── src/components/Header.js                   ← Navigation
└── src/styles/Stories.css                     ← Styling
```

---

## ⚡ Quick Commands

```bash
# Start Backend
cd backend && php artisan serve
# http://localhost:8000

# Start Frontend
cd frontend && npm start
# http://localhost:3000

# Check Database
cd backend && php artisan migrate:status

# View Logs
tail -f backend/storage/logs/laravel.log

# Test API
curl http://localhost:8000/api/stories
```

---

## ✅ Feature Checklist

```
Create Stories       ✅  Form + API working
View Stories         ✅  List + Detail pages
Delete Stories       ✅  Soft delete implemented
Upload Images        ✅  File handling done
Authentication       ✅  Token-based system
Authorization        ✅  Owner-only operations
CORS                 ✅  Frontend can reach backend
Form Validation      ✅  Client + Server validation
Error Handling       ✅  Proper error messages
Loading States       ✅  UX feedback included
Responsive Design    ✅  Mobile-friendly
Documentation        ✅  Comprehensive guides
```

---

## 🚀 Get Started in 3 Steps

```
Step 1️⃣  Start Backend
   Terminal: cd backend && php artisan serve

Step 2️⃣  Start Frontend
   Terminal: cd frontend && npm start

Step 3️⃣  Test in Browser
   Open: http://localhost:3000
   Create account → Create story → View → Done!
```

---

## 🧠 Core Concepts

```
┌──────────────────────────────────────────┐
│ TOKENS (Authentication)                  │
│ ├─ Stored in localStorage                │
│ ├─ Sent with every protected request     │
│ ├─ Format: Bearer {token}                │
│ └─ Never stored in cookies               │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ AUTHORIZATION (Access Control)           │
│ ├─ Check if user owns the resource       │
│ ├─ Return 403 Forbidden if not owner    │
│ ├─ Implemented in controller             │
│ └─ Example: Can only edit own stories    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ SOFT DELETES                             │
│ ├─ Set deleted_at timestamp              │
│ ├─ Story not removed from DB             │
│ ├─ Hidden from public queries             │
│ └─ Can be restored if needed             │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ CORS (Cross-Origin Requests)             │
│ ├─ Allows frontend (port 3000)           │
│ ├─ To reach backend (port 8000)          │
│ ├─ Configured in config/cors.php         │
│ └─ Credentials support enabled           │
└──────────────────────────────────────────┘
```

---

## 📈 Status Overview

```
╔════════════════════════════════════════════╗
║          STORIES FEATURE STATUS            ║
╠════════════════════════════════════════════╣
║                                            ║
║  Backend Implementation       ✅ Complete  ║
║  Frontend Implementation      ✅ Complete  ║
║  Database Schema              ✅ Complete  ║
║  Authentication               ✅ Complete  ║
║  Authorization                ✅ Complete  ║
║  File Upload                  ✅ Complete  ║
║  Error Handling               ✅ Complete  ║
║  Documentation                ✅ Complete  ║
║                                            ║
║  OVERALL: ✅ READY FOR PRODUCTION         ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 📚 Documentation Map

```
START HERE
    │
    ├─→ README_DOCS.md (this directory)
    │
    ├─→ SETUP_SUMMARY.md (overview)
    │
    ├─→ STORIES_QUICK_START.md (run it)
    │
    ├─→ ARCHITECTURE_DIAGRAMS.md (understand it)
    │
    ├─→ STORIES_FEATURE.md (technical details)
    │
    ├─→ API_EXAMPLES.md (test it)
    │
    └─→ TESTING_CHECKLIST.md (verify it)
```

---

## 🎯 Next Steps

1. **Read SETUP_SUMMARY.md** (10 min)
2. **Run the app** (5 min)
3. **Create a story** (2 min)
4. **Review TESTING_CHECKLIST.md** (25 min)
5. **Explore the code** (ongoing)

---

## 💡 Pro Tips

- Use Browser DevTools to watch API calls
- Check localStorage for token and user data
- Look at Laravel logs for server errors
- Use Postman to test API endpoints directly
- Read the code comments for implementation details

---

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Database**: PostgreSQL (localhost)
- **Storage**: storage/app/public/stories/

---

## ✨ You're All Set!

Everything is built, documented, and tested. Pick a doc above and dive in!

**Recommended**: Start with SETUP_SUMMARY.md →
