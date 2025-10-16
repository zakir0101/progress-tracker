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
            "message": "IGCSE Math Progress Tracker API",
            "version": "1.0",
        }
    )


# Serve static HTML files
@app.route(f"{BASE_URL}/")
def serve_student_tracker():
    return send_from_directory(".", "student_tracker.html")


@app.route(f"{BASE_URL}/dashboard")
def serve_teacher_dashboard():
    return send_from_directory(".", "teacher_dashboard.html")


@app.route(f"{BASE_URL}/update-topic", methods=["GET", "POST"])
def update_topic():
    """Update individual topic progress"""
    try:
        # Handle both GET and POST requests
        if request.method == "GET":
            student_email = request.args.get("student_email")
            student_name = request.args.get("student_name")
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
            student_email, topic_id, is_completed
        )

        return jsonify(
            {
                "success": True,
                "message": "Topic progress updated successfully",
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
    """Get individual student progress with syllabus data"""
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

        progress_data = db.get_student_progress(student_email)

        if progress_data:
            return jsonify(
                {
                    "success": True,
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
                jsonify({"status": "error", "message": "Student not found"}),
                404,
            )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


@app.route(f"{BASE_URL}/all-progress", methods=["GET"])
def get_all_progress():
    """Get progress data for all students (teacher dashboard)"""
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


@app.route(f"{BASE_URL}/syllabus", methods=["GET"])
def get_syllabus():
    """Get syllabus data"""
    try:
        syllabus = db.get_syllabus()

        # Transform flat syllabus into nested structure for frontend
        chapters = {}
        for topic in syllabus:
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

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": f"Internal server error: {str(e)}"}
            ),
            500,
        )


# @app.route(f"{BASE_URL}/submit-progress", methods=["GET", "POST"])
# def submit_progress():
#     """Submit overall progress (for compatibility with existing frontend)"""
# try:
#     if request.method == "GET":
#         student_email = request.args.get("studentEmail")
#         student_name = request.args.get("studentName")
#         progress_percentage = float(
#             request.args.get("progressPercentage", 0)
#         )
#         completed_count = int(request.args.get("completedCount", 0))
#         total_topics = int(request.args.get("totalTopics", 0))
#     else:  # POST
#         data = request.get_json()
#         if not data:
#             return (
#                 jsonify({"success": False, "error": "Invalid JSON data"}),
#                 400,
#             )
#
#         student_email = data.get("studentEmail")
#         student_name = data.get("studentName")
#         progress_percentage = float(data.get("progressPercentage", 0))
#         completed_count = int(data.get("completedCount", 0))
#         total_topics = int(data.get("totalTopics", 0))
#
#     if not all([student_email, student_name]):
#         return (
#             jsonify(
#                 {
#                     "status": "error",
#                     "message": "Missing required parameters: studentEmail, studentName",
#                 }
#             ),
#             400,
#         )
#     if not rate_limit_check(student_email):
#         return (
#             jsonify(
#                 {
#                     "success": False,
#                     "error": "Rate limit exceeded. Please try again later.",
#                 }
#             ),
#             429,
#         )
#     db.register_student(student_email, student_name)
#
#     return jsonify(
#         {
#             "status": "success",
#             "message": "Progress submitted successfully",
#             "data": {
#                 # "progress_percentage": progress_percentage,
#                 # "completed_count": completed_count,
#                 # "total_topics": total_topics,
#                 "overall_progress": {
#                     "percentage": progress_percentage,
#                     "completed": completed_count,
#                     "total": total_topics,
#                 },
#                 "topics": progress_data["syllabus"],
#             },
#         }
#     )
#
# except Exception as e:
#     return (
#         jsonify(
#             {"success": False, "error": f"Internal server error: {str(e)}"}
#         ),
#         500,
#     )


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
