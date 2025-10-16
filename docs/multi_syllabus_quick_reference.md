# Multi-Syllabus Quick Reference Guide

## Overview
The IGCSE Multi-Syllabus Progress Tracker now supports tracking student progress across multiple IGCSE subjects with flexible syllabus assignment and per-syllabus progress tracking.

## Key Features

### 🎯 Multi-Syllabus Support
- **7+ Syllabuses**: Mathematics 0580, Additional Mathematics 0606, Physics 0625, etc.
- **Contact Syllabus**: Special syllabus for new student onboarding
- **Flexible Assignment**: Teachers can assign different syllabuses to different students

### 👨‍🎓 Student Experience
1. **Initial Sign-up**: Automatically assigned to "Contact Syllabus"
2. **Contact Tasks**: Complete "Contact Administrator" and "Enroll in Course"
3. **Syllabus Access**: Only see assigned syllabuses
4. **Progress Tracking**: Track progress independently for each syllabus

### 👩‍🏫 Teacher Experience
1. **Student Management**: View all students and their assigned syllabuses
2. **Syllabus Assignment**: Assign/unassign syllabuses to students
3. **Progress Monitoring**: View progress across all syllabuses
4. **Filtering**: Filter by syllabus, progress range, or search terms

## Available Syllabuses

| ID | Name | Level | Topics |
|----|------|-------|--------|
| `0580` | Mathematics 0580 | IGCSE | 20+ |
| `0606` | Additional Mathematics 0606 | IGCSE | 15+ |
| `9231` | Further Mathematics 9231 | AS/A Level | 25+ |
| `9709` | Mathematics 9709 | AS/A Level | 20+ |
| `0625` | Physics 0625 | IGCSE | 30+ |
| `9702` | Physics 9702 | AS/A Level | 35+ |
| `contact` | Contact Syllabus | Onboarding | 2 |

## Database Schema

### Core Tables
- `students` - Student information
- `syllabuses` - Available syllabuses
- `syllabus_variants` - Syllabus variants (Core/Extended)
- `syllabus_topics` - Individual topics
- `student_syllabus_assignments` - Student-syllabus relationships
- `student_progress` - Per-syllabus progress tracking
- `topic_updates` - Progress change logs

### Key Relationships
- Students can be assigned to multiple syllabuses
- Progress tracked independently per syllabus
- Each syllabus has variants and topics
- Topics have weights for progress calculation

## API Quick Reference

### Student Endpoints
```
POST /update-topic          # Update topic progress
GET  /student-progress      # Get progress for syllabus
GET  /student-syllabuses    # Get assigned syllabuses
```

### Teacher Endpoints
```
GET  /all-progress          # All student progress
GET  /student-list          # All students
GET  /all-syllabuses        # Available syllabuses
GET  /syllabus/<id>         # Syllabus structure
POST /assign-syllabus       # Assign syllabus to student
```

### System Endpoints
```
GET  /initialize            # Initialize database
GET  /syllabus              # Backward compatibility
GET  /test                  # Health check
```

## Frontend Changes

### Student Interface (`student_tracker.html`)
- **Syllabus Selector**: Dropdown to switch between assigned syllabuses
- **Dynamic Content**: Syllabus content loads based on selection
- **Progress Tracking**: Per-syllabus progress calculation
- **Contact Syllabus**: Hidden when other syllabuses are assigned

### Teacher Dashboard (`teacher_dashboard.html`)
- **Syllabus Assignment**: Form to assign syllabuses to students
- **Syllabus Filtering**: Filter student view by syllabus
- **Multi-Syllabus Stats**: Statistics across all syllabuses
- **Enhanced Export**: CSV includes syllabus information

## Configuration

### Syllabus Files
- Location: `syllabuses/` directory
- Format: JSON files with syllabus structure
- Naming: `<syllabus_id>.json` (e.g., `0580.json`)

### Contact Syllabus
- Automatically created for new students
- Contains 2 topics: "Contact Administrator" and "Enroll in Course"
- Hidden when student has other syllabuses assigned

## Migration Notes

### From Single Syllabus
- Existing students automatically assigned to contact syllabus + 0580
- Progress data migrated to new per-syllabus structure
- Backward compatibility maintained for `/syllabus` endpoint

### Adding New Syllabuses
1. Add syllabus JSON file to `syllabuses/` directory
2. Restart application to auto-populate database
3. Assign to students via teacher dashboard

## Troubleshooting

### Common Issues

**Student can't see syllabuses**
- Check if student has syllabuses assigned
- Verify contact syllabus is not being hidden
- Check browser console for API errors

**Progress not updating**
- Verify syllabus_id is being sent in requests
- Check database connection
- Verify topic IDs exist in syllabus

**Teacher can't assign syllabus**
- Verify student email exists
- Check if syllabus is already assigned
- Verify API endpoint is accessible

### Debug Tips
- Check browser developer console for errors
- Verify API responses in Network tab
- Test with fresh database if needed
- Check Flask application logs

## Performance Notes

- Database optimized for multi-syllabus queries
- Rate limiting prevents abuse
- Progress calculation uses weighted topics
- Efficient syllabus structure loading

## Security Features

- Google OAuth authentication
- Per-user rate limiting
- Input validation and sanitization
- SQL injection protection
- Session timeout (1 hour)

## Support

For technical support:
1. Check browser console for errors
2. Verify API configuration
3. Test with different browsers
4. Check Flask application logs
5. Verify database initialization

---

**Version**: 2.0 (Multi-Syllabus)
**Last Updated**: 2025-01-16