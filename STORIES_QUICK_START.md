# Stories Feature - Quick Start Guide

## What's Been Set Up

✅ **Backend (Laravel)**

- Story model with relationships
- StoryController with full CRUD operations
- Database migration with stories table
- API routes for stories endpoints
- CORS configuration for frontend communication
- Authentication middleware for protected routes

✅ **Frontend (React)**

- StoriesList page - view all published stories
- StoryDetail page - view individual story with metadata
- CreateStory page - form to create new stories
- Navigation integrated in Header
- Authentication checks and redirects
- Token management in AuthContext
- Responsive styling with Framer Motion animations

✅ **Database**

- Stories table with user_id foreign key
- Fields: title, content, image, location, published_at, is_published
- Soft deletes support
- Timestamps for created_at, updated_at

## Running the Application

### Terminal 1: Backend

```bash
cd backend
php artisan serve
```

Backend will run on `http://localhost:8000`

### Terminal 2: Frontend

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Quick Test

1. **View Stories (Public)**

   - Open browser: `http://localhost:3000/stories`
   - Should see empty list or any published stories

2. **Create Account**

   - Click "Sign up" in the app
   - Fill in: name, email, password
   - Submit

3. **Create First Story**

   - Click "New Story" button in header
   - Fill in:
     - Title: "My Adventure in Paris"
     - Content: "Today I visited the Eiffel Tower..."
     - Location: "Paris, France"
     - Image: Upload a photo (optional)
     - Check "Publish" checkbox
   - Submit
   - Should be added to stories list

4. **View Story**

   - Click on your story from the list
   - Should see full content with author info

5. **Logout & Test Public View**
   - Logout from header
   - Go to `/stories`
   - Should still see your published story
   - Can click to view details
   - Won't see Edit/Delete buttons

## API Endpoints Quick Reference

### Public Endpoints (No Auth Required)

```
GET  /api/stories           - List all published stories
GET  /api/stories/{id}      - Get single story
```

### Protected Endpoints (Bearer Token Required)

```
POST   /api/stories         - Create new story
PUT    /api/stories/{id}    - Update own story
DELETE /api/stories/{id}    - Delete own story
```

## Key Files to Know

**Backend:**

- `routes/api.php` - API routes
- `app/Http/Controllers/StoryController.php` - Business logic
- `app/Models/Story.php` - Database model
- `database/migrations/*_create_stories_table.php` - Schema

**Frontend:**

- `src/pages/StoriesList.jsx` - Story listing page
- `src/pages/StoryDetail.jsx` - Single story view
- `src/pages/CreateStory.jsx` - Create story form
- `src/context/AuthContext.js` - Auth state & tokens
- `src/styles/Stories.css` - Story styling

## Common Tasks

### Add a New Field to Stories

1. Create migration: `php artisan make:migration add_field_to_stories_table`
2. Update migration with `$table->newField()`
3. Update Story.php fillable array
4. Run: `php artisan migrate`
5. Update forms in frontend

### Change Validation Rules

- Edit `StoryController@store()` or `update()` method
- Modify `$request->validate()` array
- Frontend will show errors from backend

### Customize Styling

- Edit `src/styles/Stories.css`
- Change grid columns, colors, spacing
- Animations use Framer Motion library

### Change API Endpoints

- Update routes in `backend/routes/api.php`
- Update fetch URLs in frontend components
- Ensure token handling is correct

## Troubleshooting

### Stories Not Loading

- ✓ Backend running? (`php artisan serve`)
- ✓ Frontend running? (`npm start`)
- ✓ Check browser console for errors
- ✓ Check Network tab - see API responses?
- ✓ CORS error? Check config/cors.php

### Cannot Create Story

- ✓ Logged in? Go to login if redirected
- ✓ Token in localStorage? Check DevTools
- ✓ Form validation errors? Check error message
- ✓ Image upload issue? Try without image first

### Story Not Visible

- ✓ Is it published? Check `is_published` toggle
- ✓ Soft deleted? Check database for `deleted_at`
- ✓ User ID correct? Story must have valid user_id

### Authentication Issues

- ✓ Token expired? Login again
- ✓ Wrong endpoint? `/api/auth/login` not `/api/login`
- ✓ localStorage cleared? Will need to login again

## Next Steps

1. **Implement Edit Story**

   - Create `/stories/{id}/edit` route
   - Create EditStory.jsx component
   - Add PUT endpoint handling
   - Pre-fill form with existing data

2. **Add Search/Filter**

   - Add search input to StoriesList
   - Filter by title, location, author
   - Add API parameter handling

3. **Add Comments**

   - Create comments table
   - Build comment form and list
   - Add comment endpoints

4. **Enhance Images**

   - Add image compression
   - Generate thumbnails
   - Add image gallery view

5. **Social Features**
   - Like/favorite stories
   - Share functionality
   - Follow users

## Database Connection

Ensure your `.env` file has:

```
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=travel_app
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Run migration if not done:

```bash
php artisan migrate
```

## Testing with API Tools

Use **Postman**, **Thunder Client**, or **curl**:

```bash
# Get token (replace with real credentials)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","mot_de_passe":"password"}'

# Create story (replace TOKEN)
curl -X POST http://localhost:8000/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title":"Test",
    "content":"Test content",
    "is_published":true
  }'

# Get all stories
curl http://localhost:8000/api/stories
```

## Support

Check files for detailed info:

- `STORIES_FEATURE.md` - Complete technical documentation
- `TESTING_CHECKLIST.md` - Comprehensive test cases
- `README.md` - General project info

Happy testing! 🚀
