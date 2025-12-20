# Stories API - Request Examples & cURL Commands

## Base Configuration

**Base URL**: `http://localhost:8000/api`
**Frontend URL**: `http://localhost:3000`
**Authentication**: Bearer token in `Authorization` header

---

## Authentication Endpoints

### POST /auth/login

**Description**: Authenticate user and get token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com",
    "mot_de_passe": "password123"
  }'
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

**Response (200 OK)**:

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "created_at": "2025-12-11T10:00:00Z"
  },
  "message": "Login successful"
}
```

**Response (401 Unauthorized)**:

```json
{
  "message": "Invalid credentials"
}
```

---

### POST /auth/signup

**Description**: Register new user

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "John Doe",
    "email": "john@example.com",
    "mot_de_passe": "password123"
  }'
```

**Request Body**:

```json
{
  "nom": "John Doe",
  "email": "john@example.com",
  "mot_de_passe": "password123"
}
```

**Response (201 Created)**:

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-11T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

**Response (422 Unprocessable Entity)**:

```json
{
  "message": "Email already exists"
}
```

---

### POST /auth/logout

**Description**: Logout current user

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**Response (200 OK)**:

```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

**Description**: Get current authenticated user info

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**Response (200 OK)**:

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-11T10:00:00Z",
    "updated_at": "2025-12-11T10:00:00Z"
  },
  "message": "Current user retrieved"
}
```

**Response (401 Unauthorized)**:

```json
{
  "message": "Unauthenticated"
}
```

---

## Stories Endpoints

### GET /stories

**Description**: Get all published stories (paginated)

```bash
curl -X GET "http://localhost:8000/api/stories?page=1" \
  -H "Accept: application/json"
```

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- Pagination: 10 stories per page

**Response (200 OK)**:

```json
{
  "stories": {
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "title": "My Paris Adventure",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        "image": "stories/abc123def456.jpg",
        "location": "Paris, France",
        "published_at": "2025-12-11T10:30:00Z",
        "is_published": true,
        "created_at": "2025-12-11T10:30:00Z",
        "updated_at": "2025-12-11T10:30:00Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 10,
    "to": 1,
    "total": 1
  },
  "message": "Stories retrieved successfully."
}
```

---

### GET /stories/{id}

**Description**: Get a specific published story

```bash
curl -X GET http://localhost:8000/api/stories/1 \
  -H "Accept: application/json"
```

**URL Parameters**:

- `id` (required): Story ID

**Response (200 OK)**:

```json
{
  "story": {
    "id": 1,
    "user_id": 1,
    "title": "My Paris Adventure",
    "content": "Lorem ipsum dolor sit amet...",
    "image": "stories/abc123def456.jpg",
    "location": "Paris, France",
    "published_at": "2025-12-11T10:30:00Z",
    "is_published": true,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:30:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Story retrieved successfully."
}
```

**Response (404 Not Found)**:

```json
{
  "message": "Story not found"
}
```

---

### POST /stories

**Description**: Create a new story (requires authentication)

#### Without Image:

```bash
curl -X POST http://localhost:8000/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json" \
  -d '{
    "title": "My Tokyo Adventure",
    "content": "I just visited Tokyo and it was amazing!",
    "location": "Tokyo, Japan",
    "is_published": true
  }'
```

#### With Image (FormData):

```bash
curl -X POST http://localhost:8000/api/stories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json" \
  -F "title=My Tokyo Adventure" \
  -F "content=I just visited Tokyo and it was amazing!" \
  -F "location=Tokyo, Japan" \
  -F "is_published=true" \
  -F "image=@/path/to/image.jpg"
```

**Request Body (JSON)**:

```json
{
  "title": "My Tokyo Adventure",
  "content": "I just visited Tokyo and it was amazing!",
  "location": "Tokyo, Japan",
  "image": null,
  "is_published": true
}
```

**Request Body (FormData with Image)**:

```
title: "My Tokyo Adventure"
content: "I just visited Tokyo and it was amazing!"
location: "Tokyo, Japan"
is_published: true
image: [binary file data]
```

**Response (201 Created)**:

```json
{
  "story": {
    "id": 2,
    "user_id": 1,
    "title": "My Tokyo Adventure",
    "content": "I just visited Tokyo and it was amazing!",
    "image": "stories/xyz789abc123.jpg",
    "location": "Tokyo, Japan",
    "published_at": "2025-12-11T11:00:00Z",
    "is_published": true,
    "created_at": "2025-12-11T11:00:00Z",
    "updated_at": "2025-12-11T11:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Story created successfully."
}
```

**Response (422 Unprocessable Entity)**:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "content": ["The content field is required."]
  }
}
```

**Response (401 Unauthorized)**:

```json
{
  "message": "Unauthenticated"
}
```

---

### PUT /stories/{id}

**Description**: Update a story (requires authentication, owner only)

#### Update without image:

```bash
curl -X PUT http://localhost:8000/api/stories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json" \
  -d '{
    "title": "My Updated Paris Adventure",
    "location": "Paris, France"
  }'
```

#### Update with new image:

```bash
curl -X POST http://localhost:8000/api/stories/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json" \
  -H "X-HTTP-METHOD-OVERRIDE: PUT" \
  -F "title=My Updated Paris" \
  -F "content=Updated content" \
  -F "location=Paris" \
  -F "is_published=true" \
  -F "image=@/path/to/new_image.jpg"
```

**Request Body (JSON)**:

```json
{
  "title": "My Updated Paris Adventure",
  "content": "Updated content goes here",
  "location": "Paris, France",
  "is_published": true
}
```

**Response (200 OK)**:

```json
{
  "story": {
    "id": 1,
    "user_id": 1,
    "title": "My Updated Paris Adventure",
    "content": "Updated content goes here",
    "image": "stories/abc123def456.jpg",
    "location": "Paris, France",
    "published_at": "2025-12-11T10:30:00Z",
    "is_published": true,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T11:30:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Story updated successfully."
}
```

**Response (403 Forbidden)**:

```json
{
  "message": "Unauthorized action."
}
```

**Response (404 Not Found)**:

```json
{
  "message": "Story not found"
}
```

---

### DELETE /stories/{id}

**Description**: Delete a story (requires authentication, owner only)

```bash
curl -X DELETE http://localhost:8000/api/stories/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**URL Parameters**:

- `id` (required): Story ID

**Response (204 No Content)**:

```
(empty body)
```

**Response (403 Forbidden)**:

```json
{
  "message": "Unauthorized action."
}
```

**Response (404 Not Found)**:

```json
{
  "message": "Story not found"
}
```

---

## Complete Examples with JavaScript Fetch

### Login & Get Token

```javascript
// Step 1: Login
const loginResponse = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    mot_de_passe: "password123",
  }),
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Save token for future requests
localStorage.setItem("auth_token", token);
```

### Create Story with Image

```javascript
const formData = new FormData();
formData.append("title", "My Adventure");
formData.append("content", "Amazing experience!");
formData.append("location", "Paris");
formData.append("is_published", true);
formData.append("image", imageFile); // File object from input

const token = localStorage.getItem("auth_token");

const createResponse = await fetch("http://localhost:8000/api/stories", {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const story = await createResponse.json();
console.log("Story created:", story);
```

### Get All Stories

```javascript
const response = await fetch("http://localhost:8000/api/stories");
const data = await response.json();

console.log("Stories:", data.stories.data);
console.log("Total:", data.stories.total);
console.log("Current page:", data.stories.current_page);
```

### Get Single Story

```javascript
const storyId = 1;
const response = await fetch(`http://localhost:8000/api/stories/${storyId}`);
const data = await response.json();
const story = data.story;

console.log("Story:", story);
console.log("Author:", story.user.name);
console.log("Image URL:", `http://localhost:8000/storage/${story.image}`);
```

### Update Story

```javascript
const storyId = 1;
const token = localStorage.getItem("auth_token");

const updateResponse = await fetch(
  `http://localhost:8000/api/stories/${storyId}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "Updated Title",
      location: "Updated Location",
    }),
  }
);

const updatedStory = await updateResponse.json();
console.log("Updated:", updatedStory);
```

### Delete Story

```javascript
const storyId = 1;
const token = localStorage.getItem("auth_token");

const deleteResponse = await fetch(
  `http://localhost:8000/api/stories/${storyId}`,
  {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);

if (deleteResponse.status === 204) {
  console.log("Story deleted successfully");
}
```

---

## Using Postman/Thunder Client

### Setup

1. Create a new Postman Collection
2. Add environment variables:
   - `baseUrl`: `http://localhost:8000/api`
   - `token`: (set after login)

### Postman Collection JSON

```json
{
  "info": {
    "name": "Travel App - Stories API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"mot_de_passe\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Stories",
      "item": [
        {
          "name": "Get All Stories",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/stories",
              "host": ["{{baseUrl}}"],
              "path": ["stories"]
            }
          }
        },
        {
          "name": "Create Story",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"My Story\",\n  \"content\": \"Content here\",\n  \"location\": \"Location\",\n  \"is_published\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/stories",
              "host": ["{{baseUrl}}"],
              "path": ["stories"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Invalid request",
  "errors": {
    "field": ["Error message"]
  }
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden

```json
{
  "message": "Unauthorized action."
}
```

### 404 Not Found

```json
{
  "message": "Story not found"
}
```

### 422 Unprocessable Entity

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "image": ["The image must be an image."]
  }
}
```

### 500 Internal Server Error

```json
{
  "message": "Server error occurred"
}
```

---

## Response Headers

All successful responses include:

```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Token Usage Tips

1. **Save Token After Login**:

   ```javascript
   localStorage.setItem("auth_token", token);
   ```

2. **Include Token in All Protected Requests**:

   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. **Token Expiration**:

   - Tokens don't have server-side expiration in this setup
   - They're only valid if the token value in database matches

4. **Token Refresh**:
   - Login again to get a new token
   - No separate refresh token endpoint currently

---

This API documentation covers all available endpoints for the Stories feature. Use these examples to test locally or integrate with your frontend application.
