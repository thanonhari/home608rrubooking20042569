# Project: Room Booking System (RRU)
## Current Status: April 24, 2026
- **Source Control:** Successfully migrated to https://github.com/thanonhari/home608rrubooking20042569.git (Branch: `main`)
- **Database:** `room_booking.sql` and `sql/schema.sql` are up to date on GitHub.
- **Last Action:** Performed a force push to align local code with remote.

## Pending Tasks (Next Step at Work):
### 1. External Booking System (บุคคลภายนอก)
- **Database Update:** Need to add `user_type` (internal/external) and `organization` to `users` table.
- **Registration Logic:** Update `api/register.php` to handle external users.
- **UI/UX:** Add a selection for "User Type" in the registration form.
- **Security:** Ensure external users are always set to `status='pending'` for admin review.

## Instructions for Gemini at Work:
1. Run `git pull origin main` to get this update.
2. Review `sql/schema.sql` and `api/register.php`.
3. Start by creating a migration script to add `user_type` column to the `users` table.
