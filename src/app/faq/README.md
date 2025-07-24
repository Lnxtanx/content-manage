# FAQ Module

This module provides functionality for frequently asked questions. It allows:

1. Users to submit questions
2. Administrators to answer those questions
3. Everyone to view answered questions

## Structure

- `page.tsx` - The main FAQ page component that displays questions and the submission form
- `styles.module.css` - Styling for the FAQ page

## API Endpoints

- `GET /api/faq` - Retrieves all FAQ items
- `POST /api/faq` - Creates a new question
- `PUT /api/faq/[id]` - Updates a question with an answer
- `DELETE /api/faq/[id]` - Deletes a FAQ item

## Database Schema

The FAQ data is stored in the `faq` table with the following fields:
- `id` - Primary key
- `question` - The question text
- `answer` - The answer text (null if not yet answered)
- `created_at` - When the question was submitted
- `answered_at` - When the question was answered

## Usage

1. Visit the `/faq` page to view existing FAQs or submit a new question
2. Questions are displayed in two sections:
   - Answered Questions - visible to all users
   - Pending Questions - only visible to administrators
3. Administrators can click on pending questions to provide answers

## Styling

The FAQ module follows the application's white theme with orange accent style, featuring:
- Clean white background
- Orange buttons and accents
- Expandable question items for better readability
