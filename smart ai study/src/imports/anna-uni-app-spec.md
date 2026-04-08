Build a premium mobile application called "Anna University Smart Student App".

Design an ultra-modern, visually stunning UI inspired by top apps like Notion, Linear, and Apple Education apps. Use gradient backgrounds, glassmorphism cards, rounded corners (16–24px), smooth micro-animations, floating action buttons, clean typography, soft shadows, and a minimal modern color palette. The interface must feel premium, futuristic, and highly intuitive for students.

APP STRUCTURE

Bottom Navigation:
Home
Materials
AI Study
News
Reminders
Profile

HOME PAGE
Show dynamic cards for:
Department
Year
Semester
Subjects

Each card should have animated icons, progress indicators, and gradient styling.

SUBJECT PAGE

Each subject contains 4 main sections:

Anna University Book
Fetch book details from database.

College Materials
Teachers upload PDFs, students view or download.

AI Study Assistant
Students upload PDFs and ask questions from the material.

YouTube Learning Videos
Fetch subject-related videos using YouTube API.

// YOUTUBE_API_KEY = "PASTE_YOUR_KEY_HERE"

BACKEND (SUPABASE)

Use Supabase for full backend services:

Authentication
Email/password login
Role based access (student / teacher)

Database Tables

users
id
name
email
role
department
year
semester

departments
id
name

subjects
id
department_id
year
semester
subject_name

materials
id
subject_id
title
file_url
uploaded_by
created_at

news
id
title
description
link
created_at

reminders
id
user_id
title
time

streaks
id
user_id
current_streak
last_active_date

gpa_records
id
user_id
semester
gpa

STORAGE

Use Supabase Storage for:
PDF materials
Student uploaded study PDFs

// SUPABASE_URL = "PASTE_SUPABASE_PROJECT_URL"
// SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY"

FEATURES

AI STUDY (RAG SYSTEM)

Students upload PDFs.
System extracts text and allows question answering.

// AI_API_KEY = "PASTE_AI_PROVIDER_KEY"

NEWS SECTION

Show Anna University announcements and exam updates.

REMINDER SYSTEM

Custom study reminders.
Hydration reminder every 45 minutes.

GPA CALCULATOR

Students calculate GPA and save results to database.

STUDENT STREAK SYSTEM

Track daily app usage.
Display streak counter and achievement badges.

TEACHER DASHBOARD

Teachers can:
Upload materials
Manage subjects
Delete or update files.

UI REQUIREMENTS

Ultra clean design
Smooth transitions
Card based layout
Fully responsive mobile layout
Modern icon set
Minimal loading screens with skeleton UI
Dark mode support

Ensure the UI feels like a premium modern education platform with high usability and smooth navigation.