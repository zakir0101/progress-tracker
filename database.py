import sqlite3
import os
import json
from datetime import datetime


class DatabaseManager:
    def __init__(self, db_path="igcse_progress.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize database tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Students table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Student progress table - stores current progress state
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS student_progress (
                student_email TEXT PRIMARY KEY,
                completed_topics TEXT, -- JSON array of completed topic IDs
                progress_percentage REAL DEFAULT 0,
                completed_count INTEGER DEFAULT 0,
                total_topics INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_email) REFERENCES students (email)
            )
        """
        )

        # Topic updates log table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS topic_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_email TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                is_completed BOOLEAN NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_email) REFERENCES students (email)
            )
        """
        )

        conn.commit()
        conn.close()

    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def register_student(self, email, name):
        """Register a new student or update existing"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO students (email, name)
            VALUES (?, ?)
        """,
            (email, name),
        )

        # Initialize progress if doesn't exist
        # cursor.execute('''
        #     INSERT OR IGNORE INTO student_progress (student_email, completed_topics)
        #     VALUES (?, '[]')
        # ''', (email,))

        conn.commit()
        conn.close()

    def update_topic_progress(self, student_email, topic_id, is_completed):
        """Update individual topic progress and recalculate overall progress"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get current completed topics
        cursor.execute(
            "SELECT completed_topics FROM student_progress WHERE student_email = ?",
            (student_email,),
        )
        result = cursor.fetchone()

        if result:
            completed_topics = json.loads(result[0])
        else:
            completed_topics = []

        # Update completed topics list
        if is_completed:
            if topic_id not in completed_topics:
                completed_topics.append(topic_id)
        else:
            if topic_id in completed_topics:
                completed_topics.remove(topic_id)

        # Calculate new progress
        syllabus = self.load_syllabus()
        total_weight = sum(topic["weight"] for topic in syllabus)
        completed_weight = sum(
            topic["weight"]
            for topic in syllabus
            if topic["id"] in completed_topics
        )

        progress_percentage = (
            (completed_weight / total_weight * 100) if total_weight > 0 else 0
        )

        # Insert or update student progress
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_progress
            (student_email, completed_topics, progress_percentage, completed_count, total_topics, last_updated)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
            (
                student_email,
                json.dumps(completed_topics),
                progress_percentage,
                len(completed_topics),
                len(syllabus),
            ),
        )

        # Log the topic update
        cursor.execute(
            """
            INSERT INTO topic_updates (student_email, topic_id, is_completed)
            VALUES (?, ?, ?)
        """,
            (student_email, topic_id, is_completed),
        )

        conn.commit()
        conn.close()

        return {
            "progress_percentage": progress_percentage,
            "completed_count": len(completed_topics),
            "total_topics": len(syllabus),
        }

    def get_student_progress(self, student_email):
        """Get student's current progress"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT sp.progress_percentage, sp.completed_count, sp.total_topics, sp.completed_topics
            FROM student_progress sp
            WHERE sp.student_email = ?
        """,
            (student_email,),
        )

        result = cursor.fetchone()
        conn.close()

        if result:
            (
                progress_percentage,
                completed_count,
                total_topics,
                completed_topics_json,
            ) = result
            completed_topics = json.loads(completed_topics_json)

            # Get syllabus with completion status
            syllabus = self.load_syllabus()
            syllabus_with_status = []
            for topic in syllabus:
                syllabus_with_status.append(
                    {**topic, "completed": topic["id"] in completed_topics}
                )

            return {
                "progress_percentage": progress_percentage,
                "completed_count": completed_count,
                "total_topics": total_topics,
                "syllabus": syllabus_with_status,
            }

        return None

    def get_all_students_progress(self):
        """Get progress data for all students"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT s.email, s.name, sp.progress_percentage, sp.completed_count, sp.total_topics, sp.last_updated
            FROM students s
            JOIN student_progress sp ON s.email = sp.student_email
            ORDER BY sp.progress_percentage DESC
        """
        )

        students = []
        for row in cursor.fetchall():
            students.append(
                {
                    "email": row[0],
                    "name": row[1],
                    "progress_percentage": row[2],
                    "completed_count": row[3],
                    "total_topics": row[4],
                    "last_updated": row[5],
                }
            )

        conn.close()
        return students

    def get_student_list(self):
        """Get list of all students"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT email, name, created_at
            FROM students
            ORDER BY name
        """
        )

        students = []
        for row in cursor.fetchall():
            students.append(
                {"email": row[0], "name": row[1], "created_at": row[2]}
            )

        conn.close()
        return students

    def load_syllabus(self):
        """Load syllabus from text file and generate topic IDs"""
        syllabus = []
        topic_id_counter = 1

        with open("syllabus.txt", "r", encoding="utf-8") as f:
            current_chapter = ""
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue

                if "|" in line:
                    parts = line.split("|")
                    if len(parts) == 3:
                        chapter, subchapter, weight = parts
                        topic_id = f"topic_{topic_id_counter}"
                        syllabus.append(
                            {
                                "id": topic_id,
                                "chapter": chapter.strip(),
                                "subchapter": subchapter.strip(),
                                "weight": int(weight.strip()),
                            }
                        )
                        topic_id_counter += 1

        return syllabus

    def get_syllabus(self):
        """Get syllabus data for frontend"""
        return self.load_syllabus()


# Global database instance
db = DatabaseManager()

