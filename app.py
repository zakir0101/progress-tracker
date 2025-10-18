from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
from database import db

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Base URL for all API routes
BASE_URL = ""  # and not '/tracker' .. hence traefik stip this part away

# Rate limiting storage
request_counts = {}


def rate_limit_check(identifier):
    """Simple rate limiting: 60 requests per minute per user"""
    current_time = datetime.now().timestamp()
    minute_window = int(current_time // 60)

    key = f"{identifier}_{minute_window}"

    if key not in request_counts:
        request_counts[key] = 0

    request_counts[key] += 1

    # Clean up old entries (keep only last 2 minutes)
    for old_key in list(request_counts.keys()):
        old_minute = int(old_key.split("_")[-1])
        if minute_window - old_minute > 1:
            del request_counts[old_key]

    return request_counts[key] <= 60


@app.route("/test")
def home():
    return jsonify(
        {
            "status": "success",
            "message": "IGCSE Multi-Syllabus Progress Tracker API",
            "version": "2.0",
        }
    )


# Serve React applications
@app.route(f"{BASE_URL}/")
def serve_student_tracker():
    return send_from_directory("public/student", "index.html")


@app.route(f"{BASE_URL}/dashboard")
def serve_teacher_dashboard():
    return send_from_directory("public/teacher", "index.html")


# Serve static assets for React apps
@app.route(f"{BASE_URL}/assets/<path:filename>")
def serve_student_tracker_static(filename):
    # Try student app first, then teacher app
    if os.path.exists(os.path.join("public", "student", "assets", filename)):
        return send_from_directory("public/student/assets", filename)
    else:
        return send_from_directory("public/teacher/assets", filename)


@app.route(f"{BASE_URL}/vite.svg")
def serve_vite_svg():
    # Serve vite.svg from student app (both apps use the same icon)
    return send_from_directory(
        "public", "mamoun_logo.png"
    )  # public/student , vite.svg


# ========== STUDENT API ENDPOINTS ==========


@app.route(f"{BASE_URL}/update-topic", methods=["GET", "POST"])
def update_topic():
    """Update individual topic progress for a specific syllabus"""
    try:
        # Handle both GET and POST requests
        if request.method == "GET":
            student_email = request.args.get("student_email")
            student_name = request.args.get("student_name")
            syllabus_id = request.args.get(
                "syllabus_id", "0580"
            )  # Default to 0580 for backward compatibility
            topic_id = request.args.get("topic_id")
            is_completed = (
                request.args.get("is_completed", "").lower() == "true"
            )
        else:  # POST
            data = request.get_json()
            if not data:
                return (
                    jsonify({"success": False, "error": "Invalid JSON data"}),
                    400,
                )

            student_email = data.get("student_email")
            student_name = data.get("student_name")
            syllabus_id = data.get(
                "syllabus_id", "0580"
            )  # Default to 0580 for backward compatibility
            topic_id = data.get("topic_id")
            is_completed = data.get("is_completed", False)

        # Validate required parameters
        if not all([student_email, student_name, topic_id]):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing required parameters: studentEmail, studentName, topicId",
                    }
                ),
                400,
            )

        # Rate limiting
        if not rate_limit_check(student_email):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        # Register student if not exists
        db.register_student(student_email, student_name)

        # Update topic progress
        progress_data = db.update_topic_progress(
            student_email, syllabus_id, topic_id, is_completed
        )

        return jsonify(
            {
                "success": True,
                "message": "Topic progress updated successfully",
                "syllabus_id": syllabus_id,
                "topics": [{"id": topic_id, "completed": is_completed}],
                "overall_progress": {
                    "percentage": progress_data.get("progress_percentage"),
                    "completed": progress_data.get("completed_count"),
                    "total": progress_data.get("total_topics"),
                },
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/student-progress", methods=["GET", "POST"])
def get_student_progress():
    """Get individual student progress for a specific syllabus"""
    try:
        # Handle both GET and POST requests
        if request.method == "GET":
            student_email = request.args.get("student_email")
            syllabus_id = request.args.get(
                "syllabus_id", "0580"
            )  # Default to 0580 for backward compatibility
        else:  # POST
            data = request.get_json()
            if not data:
                return (
                    jsonify({"success": False, "error": "Invalid JSON data"}),
                    400,
                )
            student_email = data.get("studentEmail")
            syllabus_id = data.get(
                "syllabus_id", "0580"
            )  # Default to 0580 for backward compatibility

        if not student_email:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing required parameter: studentEmail",
                    }
                ),
                400,
            )

        # Rate limiting
        if not rate_limit_check(student_email):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        progress_data = db.get_student_progress(student_email, syllabus_id)

        if progress_data:
            return jsonify(
                {
                    "success": True,
                    "syllabus_id": syllabus_id,
                    "progress": {
                        "overall_progress": {
                            "percentage": progress_data["progress_percentage"],
                            "completed": progress_data["completed_count"],
                            "total": progress_data["total_topics"],
                        },
                        "topics": progress_data["syllabus"],
                    },
                }
            )
        else:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Student not found or no progress data",
                    }
                ),
                404,
            )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/student-syllabuses", methods=["GET", "POST"])
def get_student_syllabuses():
    """Get all syllabuses assigned to a student"""
    try:
        # Handle both GET and POST requests
        if request.method == "GET":
            student_email = request.args.get("student_email")
        else:  # POST
            data = request.get_json()
            if not data:
                return (
                    jsonify({"success": False, "error": "Invalid JSON data"}),
                    400,
                )
            student_email = data.get("studentEmail")

        if not student_email:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing required parameter: studentEmail",
                    }
                ),
                400,
            )

        # Rate limiting
        if not rate_limit_check(student_email):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        syllabuses = db.get_student_syllabuses(student_email)

        return jsonify({"success": True, "syllabuses": syllabuses})

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


# ========== TEACHER API ENDPOINTS ==========


@app.route(f"{BASE_URL}/all-progress", methods=["GET"])
def get_all_progress():
    """Get progress data for all students across all syllabuses (teacher dashboard)"""
    try:
        # Rate limiting for teacher dashboard
        if not rate_limit_check("teacher_dashboard"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        students_progress = db.get_all_students_progress()

        return jsonify({"status": "success", "data": students_progress})

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/student-list", methods=["GET"])
def get_student_list():
    """Get list of all students (teacher dashboard)"""
    try:
        # Rate limiting for teacher dashboard
        if not rate_limit_check("teacher_dashboard"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        students = db.get_student_list()

        return jsonify({"status": "success", "data": students})

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/all-syllabuses", methods=["GET"])
def get_all_syllabuses():
    """Get all available syllabuses"""
    try:
        # Rate limiting
        if not rate_limit_check("syllabus_list"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        syllabuses = db.get_all_syllabuses()

        return jsonify({"status": "success", "data": syllabuses})

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/syllabus/<syllabus_id>", methods=["GET"])
def get_syllabus_structure(syllabus_id):
    """Get syllabus structure with variants and topics"""
    try:
        # Rate limiting
        if not rate_limit_check(f"syllabus_{syllabus_id}"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        syllabus_data = db.get_syllabus_structure(syllabus_id)

        if syllabus_data:
            return jsonify({"status": "success", "data": syllabus_data})
        else:
            return (
                jsonify({"status": "error", "message": "Syllabus not found"}),
                404,
            )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/assign-syllabus", methods=["POST"])
def assign_syllabus():
    """Assign a syllabus to a student"""
    try:
        data = request.get_json()
        if not data:
            return (
                jsonify({"success": False, "error": "Invalid JSON data"}),
                400,
            )

        student_email = data.get("student_email")
        syllabus_id = data.get("syllabus_id")

        if not all([student_email, syllabus_id]):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing required parameters: student_email, syllabus_id",
                    }
                ),
                400,
            )

        # Rate limiting
        if not rate_limit_check("teacher_dashboard"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        db.assign_student_to_syllabus(student_email, syllabus_id)

        return jsonify(
            {
                "success": True,
                "message": f"Student {student_email} assigned to syllabus {syllabus_id}",
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/remove-syllabus", methods=["POST"])
def remove_syllabus():
    """Remove a syllabus from a student"""
    try:
        data = request.get_json()
        if not data:
            return (
                jsonify({"success": False, "error": "Invalid JSON data"}),
                400,
            )

        student_email = data.get("student_email")
        syllabus_id = data.get("syllabus_id")

        if not all([student_email, syllabus_id]):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing required parameters: student_email, syllabus_id",
                    }
                ),
                400,
            )

        # Rate limiting
        if not rate_limit_check("teacher_dashboard"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Rate limit exceeded. Please try again later.",
                    }
                ),
                429,
            )

        db.remove_student_from_syllabus(student_email, syllabus_id)

        return jsonify(
            {
                "success": True,
                "message": f"Syllabus {syllabus_id} removed from student {student_email}",
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


# ========== BACKWARD COMPATIBILITY ENDPOINTS ==========


@app.route(f"{BASE_URL}/syllabus", methods=["GET"])
def get_syllabus():
    """Get syllabus data (backward compatibility - defaults to 0580)"""
    try:
        syllabus_data = db.get_syllabus_structure("0580")

        if syllabus_data:
            # Transform to old format for backward compatibility
            topics = []
            for variant in syllabus_data.get("variants", []):
                for topic in variant.get("topics", []):
                    topics.append(
                        {
                            "id": topic["id"],
                            "chapter": topic["chapter_name"],
                            "subchapter": topic["topic_name"],
                            "weight": topic.get("weight", 1),
                        }
                    )

            # Transform flat syllabus into nested structure for frontend
            chapters = {}
            for topic in topics:
                chapter_name = topic["chapter"]
                if chapter_name not in chapters:
                    chapters[chapter_name] = {
                        "number": len(chapters) + 1,
                        "name": chapter_name,
                        "topics": [],
                    }

                chapters[chapter_name]["topics"].append(
                    {
                        "id": topic["id"],
                        "number": len(chapters[chapter_name]["topics"]) + 1,
                        "name": topic["subchapter"],
                        "weight": topic["weight"],
                    }
                )

            # Convert to list for frontend
            syllabus_data = list(chapters.values())

            return jsonify({"status": "success", "data": syllabus_data})
        else:
            return (
                jsonify({"status": "error", "message": "Syllabus not found"}),
                404,
            )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/initialize", methods=["GET"])
def initialize():
    """Initialize database (for testing)"""
    try:
        # This will trigger database initialization
        db.init_db()

        return jsonify(
            {
                "status": "success",
                "message": "Database initialized successfully",
            }
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": f"Database initialization failed: {str(e)}",
                }
            ),
            500,
        )


if __name__ == "__main__":
    # Initialize database on startup
    db.init_db()

    # Get port from environment or default to 5000
    port = int(os.environ.get("PORT", 5000))

    # Run the application
    app.run(host="0.0.0.0", port=port, debug=True)
