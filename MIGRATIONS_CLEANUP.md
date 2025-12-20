# Database Migrations & Models Cleanup

## Summary

Cleaned up the database to keep only essential User and Story tables.

## Deleted Migrations ❌

- `0001_01_01_000001_create_cache_table.php` - Cache functionality not needed
- `0001_01_01_000002_create_jobs_table.php` - Job queue not needed
- `2025_12_09_125640_create_personal_access_tokens_table.php` - Using remember_token instead of Sanctum
- `2025_12_09_154239_create_stories_table.php` - Duplicate (v1)
- `2025_12_09_154512_create_stories_table.php` - Duplicate (v2)
- `2025_12_09_154517_create_stories_table_new.php` - Duplicate (v3)

## Remaining Migrations ✅

### 1. `0001_01_01_000000_create_users_table.php`
- **id** (primary key)
- **name** (string)
- **email** (unique)
- **password** (hashed)
- **remember_token** (for manual token-based auth)
- **created_at, updated_at** (timestamps)

### 2. `0001_01_01_000001_create_stories_table.php`
- **id** (primary key)
- **user_id** (foreign key → users)
- **title** (string)
- **content** (text)
- **image** (nullable string)
- **location** (nullable string)
- **published_at** (nullable timestamp)
- **is_published** (boolean)
- **created_at, updated_at** (timestamps)
- **deleted_at** (soft deletes)

## Models ✅

No changes needed - already has only:
- `User.php` - User model with stories relationship
- `Story.php` - Story model with user relationship

## Running Fresh Migrations

If you need to reset the database:

```bash
php artisan migrate:fresh
```

Or rollback and re-migrate:

```bash
php artisan migrate:rollback
php artisan migrate
```

## Notes

- Using `remember_token` for token-based authentication (custom implementation)
- No Sanctum tokens table needed
- Stories support soft deletes for data preservation
- Relationships properly configured with cascade deletes
