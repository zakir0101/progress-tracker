# Multi-Syllabus Database Schema Design

## ✅ IMPLEMENTED SCHEMA

This schema has been successfully implemented in the multi-syllabus refactoring.

## Tables

### 1. students
```sql
CREATE TABLE students (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. syllabuses
```sql
CREATE TABLE syllabuses (
    id TEXT PRIMARY KEY,           -- e.g., "0580", "0606", "0625"
    name TEXT NOT NULL,            -- e.g., "IGCSE Mathematics"
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. syllabus_variants
```sql
CREATE TABLE syllabus_variants (
    id TEXT PRIMARY KEY,           -- e.g., "0580_core", "0580_extended"
    syllabus_id TEXT NOT NULL,     -- references syllabuses(id)
    name TEXT NOT NULL,            -- e.g., "Core", "Extended"
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
);
```

### 3. syllabus_topics
```sql
CREATE TABLE syllabus_topics (
    id TEXT PRIMARY KEY,           -- e.g., "0580_core_1_1"
    variant_id TEXT NOT NULL,      -- references syllabus_variants(id)
    chapter_name TEXT NOT NULL,    -- e.g., "Number"
    topic_name TEXT NOT NULL,      -- e.g., "Types of number"
    topic_number INTEGER,          -- position within chapter
    weight INTEGER DEFAULT 1,      -- weighting for progress calculation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES syllabus_variants(id)
);
```

### 4. student_syllabus_assignments
```sql
CREATE TABLE student_syllabus_assignments (
    student_email TEXT NOT NULL,   -- references students(email)
    syllabus_id TEXT NOT NULL,     -- references syllabuses(id)
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_email, syllabus_id),
    FOREIGN KEY (student_email) REFERENCES students(email),
    FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
);
```

### 5. student_progress (MODIFIED)
```sql
CREATE TABLE student_progress (
    student_email TEXT NOT NULL,
    syllabus_id TEXT NOT NULL,     -- NEW: track progress per syllabus
    completed_topics TEXT,         -- JSON array of completed topic IDs
    progress_percentage REAL DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    total_topics INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_email, syllabus_id),
    FOREIGN KEY (student_email) REFERENCES students(email),
    FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
);
```

### 6. topic_updates (MODIFIED)
```sql
CREATE TABLE topic_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_email TEXT NOT NULL,
    syllabus_id TEXT NOT NULL,     -- NEW: track which syllabus
    topic_id TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES students(email),
    FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
);
```

## Special Syllabus: "contact-syllabus"

This will be a special syllabus for new students with only 2 topics:
1. "Contact Administrator"
2. "Enroll in Course"

This syllabus will be automatically assigned to all new students and will be the only one they see until the teacher assigns them to actual syllabuses.

## Key Changes from Current System

1. **Progress tracking per syllabus** instead of global
2. **Student-syllabus assignments** to control access
3. **Support for multiple variants** within each syllabus
4. **Contact syllabus** for initial student onboarding

## ✅ Implementation Status

### Successfully Implemented
1. ✅ All new tables created with proper relationships
2. ✅ Syllabus data migrated from JSON files in `syllabuses/` directory
3. ✅ Contact syllabus created with 2 topics
4. ✅ Automatic assignment of new students to contact syllabus
5. ✅ Per-syllabus progress tracking implemented
6. ✅ Backward compatibility maintained for existing endpoints

### Data Migration
- Existing students automatically assigned to contact syllabus + 0580
- Progress data migrated to new per-syllabus structure
- Syllabus structure parsed from JSON files
- Contact syllabus topics: "Contact Administrator" and "Enroll in Course"

### Database Initialization
- Automatic initialization on application startup
- Syllabus data populated from `template_converter.py`
- Contact syllabus programmatically generated
- All foreign key constraints enforced