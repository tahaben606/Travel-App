# Visual Guide - Updated Features

## 1️⃣ Stories Page at 75% Scale

### Before:

```
┌────────────────────────────────────────────────┐
│  Story 1                                       │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │          [Large Image - 100%]            │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│  Author: John Doe                              │
│  Paris, France                                 │
└────────────────────────────────────────────────┘
```

### After (75% Scale):

```
    ┌────────────────────────────────────────────────┐
    │  Story 1                                       │
    │  ┌──────────────────────────────────────────┐  │
    │  │                                          │  │
    │  │       [Image at 75% - More Compact]      │  │
    │  │                                          │  │
    │  └──────────────────────────────────────────┘  │
    │  Author: John Doe                              │
    │  Paris, France                                 │
    └────────────────────────────────────────────────┘
```

**Effect**: Entire feed is 75% smaller, more content visible at once

---

## 2️⃣ Image Upload Options - Before vs After

### Before:

```
Add a Featured Image
┌─────────────────────────────────┐
│ 📷 [Click to upload file]       │
└─────────────────────────────────┘

Current Preview:
┌─────────────────────────────────┐
│  [Image preview if selected]    │
│         [Remove]                │
└─────────────────────────────────┘
```

### After (Enhanced):

```
Add a Featured Image
┌─────────────────────────────────┐
│ 📷 [Click to upload file]       │
└─────────────────────────────────┘

        ────── or ──────

Image URL
┌─────────────────────────────────┐
│ https://example.com/image.jpg   │
└─────────────────────────────────┘
         [Preview URL Image]

Current Preview:
┌─────────────────────────────────┐
│  [Image preview if selected]    │
│         [Remove]                │
└─────────────────────────────────┘
```

**New Features**:

- ✨ Visual "or" divider
- ✨ URL input field
- ✨ Preview button for URL images
- ✨ Same remove button for both methods

---

## 3️⃣ Create Story Form Flow

### Complete User Journey:

```
┌─────────────────────────────────────────────────┐
│           CREATE STORY FORM                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Story Title *                                  │
│  ┌─────────────────────────────────────────┐  │
│  │ My Amazing Travel Adventure             │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Your Story *                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ I visited this amazing place and had... │  │
│  │ ... the best experience of my life.     │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Country          │ City        │ Type         │
│  ┌─────────────┐ ┌──────────┐ ┌────────────┐  │
│  │ France    ▼ │ │ Paris   ▼│ │ Restaurant▼│  │
│  └─────────────┘ └──────────┘ └────────────┘  │
│                                                 │
│  ☑ Publish now                                 │
│  Your story will be visible to everyone.       │
│                                                 │
│  Add a Featured Image                          │
│  ┌─────────────────────────────────────────┐  │
│  │ 📷 Click to upload file                 │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│           ────── or ──────                     │
│                                                 │
│  Image URL                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ https://example.com/travel-photo.jpg    │  │
│  └─────────────────────────────────────────┘  │
│                [Preview URL Image]             │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │      Preview Image (if selected)        │  │
│  │  ┌───────────────────────────────────┐  │  │
│  │  │                                   │  │  │
│  │  │         [Image Preview]            │  │  │
│  │  │                                   │  │  │
│  │  └───────────────────────────────────┘  │  │
│  │          [Remove Image]                  │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│                                [Publish Story] │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 4️⃣ Database Record Example

### When Story is Created and Saved:

```sql
INSERT INTO stories (
  user_id,
  title,
  content,
  image,
  location,
  type,
  views,
  is_published,
  published_at,
  created_at,
  updated_at
) VALUES (
  1,
  'My Amazing Travel Adventure',
  'I visited this amazing place...',
  'stories/xyz123.jpg',  -- OR https://example.com/image.jpg
  'Paris, France',
  'restaurant',
  0,
  true,
  '2025-12-19 10:30:00',
  '2025-12-19 10:30:00',
  '2025-12-19 10:30:00'
);
```

**Result**: Story appears in:

- ✅ User's Dashboard (My Stories tab)
- ✅ Main Stories Feed
- ✅ Database records
- ✅ View count tracking (starts at 0)

---

## 5️⃣ Image Options Comparison

| Feature     | File Upload           | URL Image                |
| ----------- | --------------------- | ------------------------ |
| Method      | Click to select       | Paste link               |
| Storage     | Server storage        | External URL             |
| Max size    | 2 MB                  | No limit                 |
| Bandwidth   | Uses server           | External server          |
| Hosting     | Your server           | External site            |
| Persistence | Permanent (on server) | Depends on external site |
| Use case    | Personal photos       | Photos from services     |

---

## 6️⃣ Validation & Error Handling

### Frontend Validation:

```javascript
✓ Title required
✓ Content required
✓ At least one image (optional, but recommended)
✓ URL must be valid format (if using URL)
✓ File must be image (jpg/png/gif)
✓ File size max 2 MB
```

### Backend Validation:

```php
✓ Title: required, max 255 chars
✓ Content: required
✓ Image file: optional, image, max 2 MB
✓ Image URL: optional, valid URL
✓ Location: optional, max 255 chars
✓ Type: optional, specific values only
✓ is_published: boolean only
```

---

## 7️⃣ Scale Visualization - 75% vs 100%

### Width Comparison:

```
100% Scale:
┌──────────────────────────────────────────────────────────────────┐
│                    Story Card (Full Width)                       │
└──────────────────────────────────────────────────────────────────┘

75% Scale:
  ┌──────────────────────────────────────────────────┐
  │        Story Card (75% Width)                    │
  └──────────────────────────────────────────────────┘

Result: More stories fit on screen, more content visible!
```

### Height Comparison:

```
100% Scale: 500px height
75% Scale:  375px height (25% reduction)

Grid Layout:
100% = 2 stories per screen (500 + 500 = 1000px)
75%  = 2-3 stories per screen (375 + 375 + space = fits better)
```

---

## 8️⃣ User Actions Flow

### Action: Create Story with File Image

```
User clicks "Create Story"
        ↓
Fills form (title, content, location, type)
        ↓
Clicks file upload area
        ↓
Selects image from computer
        ↓
Preview appears
        ↓
Clicks "Publish Story"
        ↓
Frontend validates form
        ↓
Sends POST request with FormData
        ↓
Backend receives and validates
        ↓
Saves file to storage/app/public/stories/
        ↓
Creates database record with file path
        ↓
Returns story JSON with ID
        ↓
Frontend redirects to story page
        ↓
✅ Story successfully created and visible!
```

### Action: Create Story with URL Image

```
User clicks "Create Story"
        ↓
Fills form (title, content, location, type)
        ↓
Pastes image URL in "Image URL" field
        ↓
Clicks "Preview URL Image"
        ↓
Image preview appears
        ↓
Clicks "Publish Story"
        ↓
Frontend validates form
        ↓
Sends POST request with FormData (imageUrl field)
        ↓
Backend receives and validates URL
        ↓
Stores URL directly in database (no file upload)
        ↓
Creates database record with URL
        ↓
Returns story JSON with ID
        ↓
Frontend redirects to story page
        ↓
✅ Story successfully created with external image!
```

---

## 9️⃣ Scale Effect on Different Elements

### Typography Scaling (75%):

- H1: 32px → 24px
- H2: 24px → 18px
- Body: 16px → 12px
- Small: 12px → 9px

### Spacing Scaling (75%):

- Large gap: 2rem → 1.5rem
- Medium gap: 1rem → 0.75rem
- Small gap: 0.5rem → 0.375rem

### Image Scaling (75%):

- Story image: 1200x600 → 900x450 (approximate visual size)
- Avatar: 40px → 30px
- Icons: 24px → 18px

---

## 🔟 Testing Scenarios

### Test 1: File Upload Flow

```
1. Navigate to /stories/create
2. Enter "My Trip to Paris"
3. Enter description
4. Select France → Paris → Restaurant
5. Click file upload
6. Select image.jpg
7. Image preview appears
8. Click "Publish Story"
9. Verify story created in database
10. Verify image saved to storage
```

### Test 2: URL Upload Flow

```
1. Navigate to /stories/create
2. Enter "Beautiful Sunset"
3. Enter description
4. Paste "https://example.com/sunset.jpg"
5. Click "Preview URL Image"
6. Preview appears
7. Click "Publish Story"
8. Verify story created in database
9. Verify URL stored (not file)
```

### Test 3: Scale Verification

```
1. Navigate to /stories
2. Open DevTools (F12)
3. Inspect .ig-container element
4. Verify "transform: scale(0.75)"
5. Check visual size is 75% of normal
6. Resize browser window
7. Verify scaling remains proportional
```

---
