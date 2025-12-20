# Stories Feature - Testing Checklist

## Setup

- [x] Backend running on `http://localhost:8000`
- [x] Frontend running on `http://localhost:3000`
- [x] Database migrations applied
- [x] Story model and controller created
- [x] Routes configured
- [x] CORS configured
- [x] Frontend components created
- [x] Auth context updated

## Test Cases

### View Public Stories

- [ ] Open `http://localhost:3000/stories`
- [ ] Should see list of published stories (if any exist)
- [ ] Can click on a story to view details
- [ ] No authentication required
- [ ] "Share Your Story" button visible for logged-in users only

### Create Story (Authenticated User)

- [ ] Login with test account
- [ ] Click "New Story" or "Share Your Story" button
- [ ] Should redirect to `/stories/create`
- [ ] Fill in form:
  - [ ] Title: "My First Travel Story"
  - [ ] Content: "Lorem ipsum dolor sit amet..."
  - [ ] Location: "Paris, France"
  - [ ] Upload image (optional)
  - [ ] Toggle "Publish" checkbox
- [ ] Submit form
- [ ] Should see success message
- [ ] Should redirect to `/stories`
- [ ] New story should appear in list
- [ ] Story data should be in database

### View Story Details

- [ ] Click on a story card from list
- [ ] Should navigate to `/stories/{id}`
- [ ] Full story content displayed
- [ ] Author name visible
- [ ] Location (if provided) visible
- [ ] Published date visible
- [ ] Story image displayed (if uploaded)

### Edit Story (If Implemented)

- [ ] As story author, look for Edit button
- [ ] Click Edit
- [ ] Should show form with current data
- [ ] Modify one field
- [ ] Submit
- [ ] Should update in database
- [ ] Changes visible on detail page

### Delete Story

- [ ] As story author, click Delete button
- [ ] Should show confirmation dialog
- [ ] Click confirm
- [ ] Should redirect to `/stories` list
- [ ] Story should no longer appear in list
- [ ] Database: story should have `deleted_at` timestamp

### Authentication Flow

- [ ] Logout from header
- [ ] Go to `/stories/create`
- [ ] Should redirect to `/login`
- [ ] Login again
- [ ] Should redirect back to previous page (or dashboard)

### Authorization

- [ ] As user A, create a story
- [ ] Login as user B in different browser/incognito
- [ ] Go to user A's story
- [ ] Should NOT see Edit/Delete buttons
- [ ] Try to PUT/DELETE via API - should get 403 Forbidden

### Image Handling

- [ ] Upload story with image
- [ ] Image should be displayed
- [ ] Check `storage/app/public/stories/` folder
- [ ] Image file should exist
- [ ] Edit story with new image
- [ ] Old image should be deleted from storage

### Error Handling

- [ ] Try to create story without title
- [ ] Should show validation error
- [ ] Try to create story without content
- [ ] Should show validation error
- [ ] Go to `/stories/999999` (non-existent)
- [ ] Should show error message with link back to list

### Token Persistence

- [ ] Login to account
- [ ] Refresh page
- [ ] Should stay logged in
- [ ] Check localStorage for `auth_token` and `user_data`
- [ ] Logout
- [ ] Refresh page
- [ ] Should be logged out

### API Endpoints (Using Postman/Thunder Client)

#### GET /api/stories

```
Method: GET
URL: http://localhost:8000/api/stories
Headers: Content-Type: application/json
Expected Status: 200
Response should contain array of published stories
```

#### POST /api/stories

```
Method: POST
URL: http://localhost:8000/api/stories
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token}
Body:
{
  "title": "Test Story",
  "content": "Test content",
  "location": "Test Location",
  "is_published": true
}
Expected Status: 201
Response should contain created story with id
```

#### GET /api/stories/{id}

```
Method: GET
URL: http://localhost:8000/api/stories/1
Expected Status: 200
Response should contain story object with user
```

#### PUT /api/stories/{id}

```
Method: PUT
URL: http://localhost:8000/api/stories/1
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token}
Body:
{
  "title": "Updated Title"
}
Expected Status: 200 (if owner) or 403 (if not owner)
```

#### DELETE /api/stories/{id}

```
Method: DELETE
URL: http://localhost:8000/api/stories/1
Headers:
  - Authorization: Bearer {token}
Expected Status: 204 (if owner) or 403 (if not owner)
```

## Browser Console Checks

- [ ] No JavaScript errors
- [ ] No console warnings for missing images
- [ ] API calls visible in Network tab
- [ ] Correct CORS headers in response
- [ ] Authorization header present in requests

## Database Checks

```sql
-- Check users table
SELECT * FROM users;

-- Check stories table
SELECT * FROM stories;

-- Check published stories
SELECT * FROM stories WHERE is_published = true AND deleted_at IS NULL;

-- Check soft-deleted stories
SELECT * FROM stories WHERE deleted_at IS NOT NULL;

-- Check story with user
SELECT s.*, u.name as author_name FROM stories s
JOIN users u ON s.user_id = u.id
WHERE s.is_published = true;
```

## Performance Notes

- Frontend loads stories on mount
- No infinite scroll implemented yet
- Pagination handled server-side (10 per page)
- Images lazy-load on card view
- No caching implemented

## Known Limitations

- [ ] Edit story page/form not yet implemented
- [ ] Search/filter not implemented
- [ ] Comments/reactions not implemented
- [ ] Categories/tags not implemented
- [ ] Draft stories not yet supported
- [ ] Image optimization not implemented
- [ ] No pagination UI in frontend
