# Project Instructions

## Memory & Context
- ALWAYS use the `mempalace` skill to retrieve long-term context if a technical detail is missing from the current session.
- AT THE START OF A SESSION: Run `mempalace wake-up` to re-establish the project's high-level summary and room structure.
- After significant changes, run `mempalace mine .` to ensure the memory is updated.

## Recent Progress (April 2026)
- **UI/UX Overhaul:** 
    - Migrated room list to a modern **Card Grid** with hero images and hover effects.
    - Added **Dynamic Room Preview** in the booking modal to show capacity and description upon selection.
    - Implemented a **Full-screen Photo Carousel** with swipe/navigation support for room details.
- **Database & Schema:**
    - Integrated `email` column for users and automated registration flow.
    - Added Phase 5 columns: `check_in_time`, `check_out_time`, `rating`, and `feedback`.
- **Role-Based Access (RBAC):**
    - Refined `Approver` and `Staff` roles to allow room photo management without administrative rights.
    - Fixed data consistency bugs where non-standard master data values caused dropdown resets.

## Coding Principles
- Adhere to Andrej Karpathy coding principles: Simplicity First, Surgical Changes, Think Before Coding, Goal-Driven.
