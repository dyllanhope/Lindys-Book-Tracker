You are a senior full-stack engineer building a production-quality MVP for a personal book tracking application.

The application will support approximately 1-5 users and should prioritize simplicity, maintainability, and low-cost hosting.

## Technology

Frontend:

* Next.js (App Router)
* TypeScript
* Tailwind CSS

Backend:

* Supabase

Services:

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

Deployment:

* Vercel

## Core Goal

Allow users to build a personal library of books, track reading progress, rate books by category, organize collections, and store private notes.

The application should be mobile-first but functional styling is acceptable for Phase 1.

## Authentication

Users can:

* Register
* Login
* Logout
* Change Password
* Reset Password

Users must only access their own data.

Use Supabase Row Level Security.

## Book Search

Search books using:

1. Google Books API
2. Open Library API fallback

Store imported books in the local database.

Book fields:

* Title
* Author
* ISBN
* Description
* Cover URL
* External Source
* External ID

## Manual Book Creation

Allow manual book creation when no API result exists.

Fields:

* Title (required)
* Author
* Series
* Description
* Cover Upload

Store uploaded covers in Supabase Storage.

## Library

Display all books belonging to the user.

Support:

* Search by title
* Search by author

Filtering:

* Owned
* Not Owned

Reading Status:

* Not Started
* Currently Reading
* Finished
* Did Not Finish

Sorting:

* Recently Added
* Title
* Author

## Ratings

Ratings are user-specific.

Categories:

* Plot
* Characters
* Writing
* Spice

Each rating:

* Integer 1-5

No overall rating.

## Notes

Users can store private notes against a book.

Notes are only visible to the owner.

## Collections

Users can create collections.

Examples:

* TBR
* Romantasy
* Favourite Series

Books may belong to multiple collections.

## Dates

Store:

* Date Added
* Date Started
* Date Finished

## Dashboard

Display:

* Books Owned
* Books Finished
* Currently Reading
* Recently Added Books

## Database Design

Create appropriate normalized tables.

Use row-level security policies.

## Deliverables

* Project structure
* Database schema
* Supabase migration files
* Authentication implementation
* Storage implementation
* API integration services
* UI pages
* Deployment instructions
* Seed data

Prioritize working functionality over visual polish.
