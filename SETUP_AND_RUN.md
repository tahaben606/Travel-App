# 🚀 Running the Updated Travel App

## Prerequisites

- PHP 8.1+
- Laravel 11
- Node.js 18+
- npm or yarn
- MySQL/PostgreSQL

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file with your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=travel_app
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Start Laravel Server

```bash
php artisan serve
```

The backend will run on: `http://localhost:8000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint

The frontend is already configured to use `http://localhost:8000`

### 4. Start React Development Server

```bash
npm start
```

The frontend will run on: `http://localhost:3000`

---

## 🎯 First-Time Testing

### Create User Account

1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Enter email, name, and password
4. Click "Sign Up"

### Create Your First Story

1. Click "Dashboard" in navbar
2. Click "New Story" button
3. Fill in:
   - Title
   - Content
   - Select Country → City → Type
   - Upload Image (optional)
4. Click "Publish Story"

### View Statistics

1. Dashboard automatically shows:
   - Stories Published count
   - Total Views (increments when stories are viewed)
   - Total Likes
   - Saved by Others count

### Test Views Counter

1. From Dashboard, click "View Story"
2. Story detail page loads
3. Automatically increments view count (silent)
4. Go back to Dashboard
5. Check total views in stat card

### Test Profile Menu

1. Click your name in top-right navbar
2. Dropdown menu appears with:
   - "Go to Dashboard"
   - "Add Story"
   - "Logout"
3. Click "Logout" to sign out

---

## 📊 Database Tables

### stories table

```
id              INT (primary key)
user_id         INT (foreign key)
title           VARCHAR(255)
content         TEXT
image           VARCHAR(255)
location        VARCHAR(255)
type            VARCHAR(50)
views           INT (DEFAULT: 0) ← NEW
published_at    TIMESTAMP
is_published    BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Other related tables

- `users` - User accounts
- `likes` - Story likes (many-to-many)
- `saves` - Story saves (many-to-many)

---

## 🔧 API Endpoints

### Stories

```
GET    /api/stories                    - List published stories
GET    /api/stories/{id}               - Get single story
POST   /api/stories                    - Create story (AUTH)
PUT    /api/stories/{id}               - Update story (AUTH)
DELETE /api/stories/{id}               - Delete story (AUTH)
```

### Views (NEW)

```
POST   /api/stories/{id}/increment-views  - Increment view count
```

### User Stories (NEW)

```
GET    /api/user/stories               - Get user's own stories (AUTH)
```

### Profile

```
GET    /api/profile/liked-stories      - Get liked stories (AUTH)
GET    /api/profile/saved-stories      - Get saved stories (AUTH)
```

### Interactions

```
POST   /api/stories/{id}/like          - Like story (AUTH)
POST   /api/stories/{id}/unlike        - Unlike story (AUTH)
POST   /api/stories/{id}/save          - Save story (AUTH)
POST   /api/stories/{id}/unsave        - Unsave story (AUTH)
```

---

## 🐛 Troubleshooting

### CORS Issues

If frontend can't reach backend:

1. Check backend is running on `http://localhost:8000`
2. Check frontend is set to use correct API URL
3. Ensure CORS headers are set in Laravel

### Database Connection Error

```bash
# Make sure database exists
mysql -u root -p
CREATE DATABASE travel_app;
exit;

# Then run migrations
php artisan migrate
```

### Port Already in Use

- Backend (8000): `php artisan serve --port=8001`
- Frontend (3000): `PORT=3001 npm start`

### Clear Cache

```bash
# Backend
php artisan cache:clear
php artisan config:clear

# Frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📚 Key Files

### Backend

- `app/Models/Story.php` - Story model with views field
- `app/Http/Controllers/StoryController.php` - API logic
- `routes/api.php` - API endpoints
- `database/migrations/*` - Database schemas

### Frontend

- `src/pages/Dashboard.js` - Dashboard with stats and tabs
- `src/pages/StoryDetail.jsx` - Story view with auto-increment
- `src/components/PillNav.jsx` - Navigation with profile menu
- `src/styles/dashboard.css` - Dashboard styling

---

## 🎨 Customization

### Change API Base URL

Edit in frontend files:

```javascript
// Change from localhost:8000 to your server
const API_URL = "http://your-domain.com/api";
```

### Customize Colors

Edit `src/styles/dashboard.css`:

```css
/* Main gradient */
--primary-color: #667eea;
--secondary-color: #764ba2;
```

### Add More Stats

Edit `src/pages/Dashboard.js`:

```javascript
// Add new stat cards in stats-grid section
```

---

## 📈 Performance Tips

1. **Image Optimization**

   - Compress story images before uploading
   - Use WebP format where possible

2. **Caching**

   - Backend: Enable query caching
   - Frontend: Use React lazy loading

3. **Database**
   - Index frequently queried columns
   - Archive old stories separately

---

## 🔒 Security Notes

1. **Authentication**

   - Uses Sanctum tokens
   - Tokens stored in localStorage
   - Logout clears tokens

2. **Authorization**

   - Users can only edit their own stories
   - Backend validates ownership

3. **Input Validation**
   - All inputs validated on backend
   - HTML sanitized before display

---

## 📞 Support

For issues or questions:

1. Check console for error messages
2. Review network tab in DevTools
3. Check Laravel logs: `storage/logs/laravel.log`
4. Verify all dependencies installed correctly

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Database migrations applied
- [ ] Can create user account
- [ ] Can create story
- [ ] Dashboard shows statistics
- [ ] Views increment when viewing story
- [ ] Profile menu appears when clicking user name
- [ ] All three tabs (My/Liked/Saved) work
- [ ] Logout functionality works

---

**Status**: Ready to use! 🚀
