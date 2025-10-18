import sqlite3
import os
import json
from datetime import datetime
from template_converter import get_all_syllabus_data


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

        # Syllabuses table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS syllabuses (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Syllabus variants table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS syllabus_variants (
                id TEXT PRIMARY KEY,
                syllabus_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
            )
        """
        )

        # Syllabus topics table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS syllabus_topics (
                id TEXT PRIMARY KEY,
                variant_id TEXT NOT NULL,
                chapter_name TEXT NOT NULL,
                topic_name TEXT NOT NULL,
                topic_number INTEGER,
                weight INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES syllabus_variants(id)
            )
        """
        )

        # Student syllabus assignments table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS student_syllabus_assignments (
                student_email TEXT NOT NULL,
                syllabus_id TEXT NOT NULL,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_email, syllabus_id),
                FOREIGN KEY (student_email) REFERENCES students(email),
                FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
            )
        """
        )

        # Student progress table - MODIFIED to support multiple syllabuses
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS student_progress (
                student_email TEXT NOT NULL,
                syllabus_id TEXT NOT NULL,
                completed_topics TEXT, -- JSON array of completed topic IDs
                progress_percentage REAL DEFAULT 0,
                completed_count INTEGER DEFAULT 0,
                total_topics INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_email, syllabus_id),
                FOREIGN KEY (student_email) REFERENCES students(email),
                FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
            )
        """
        )

        # Topic updates log table - MODIFIED to support multiple syllabuses
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS topic_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_email TEXT NOT NULL,
                syllabus_id TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                is_completed BOOLEAN NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_email) REFERENCES students(email),
                FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id)
            )
        """
        )

        # Initialize syllabuses from template converter
        self.initialize_syllabuses(cursor)

        conn.commit()
        conn.close()

    def initialize_syllabuses(self, cursor):
        """Initialize syllabuses from template converter data"""
        syllabus_data = get_all_syllabus_data()

        for syllabus_id, syllabus in syllabus_data.items():
            # Insert syllabus
            cursor.execute(
                """
                INSERT OR REPLACE INTO syllabuses (id, name, description)
                VALUES (?, ?, ?)
                """,
                (syllabus_id, syllabus['name'], syllabus.get('description', ''))
            )

            # Insert variants and topics
            for variant_id, variant in syllabus['variants'].items():
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO syllabus_variants (id, syllabus_id, name, description)
                    VALUES (?, ?, ?, ?)
                    """,
                    (variant_id, syllabus_id, variant['name'], variant.get('description', ''))
                )

                # Insert topics
                for topic in variant['topics']:
                    cursor.execute(
                        """
                        INSERT OR REPLACE INTO syllabus_topics
                        (id, variant_id, chapter_name, topic_name, topic_number, weight)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (topic['id'], variant_id, topic['chapter_name'],
                         topic['topic_name'], topic['topic_number'], topic.get('weight', 1))
                    )

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

        # Automatically assign student to contact syllabus
        cursor.execute(
            """
            INSERT OR IGNORE INTO student_syllabus_assignments (student_email, syllabus_id)
            VALUES (?, 'contact')
            """,
            (email,)
        )

        conn.commit()
        conn.close()

    def assign_student_to_syllabus(self, student_email, syllabus_id):
        """Assign a student to a syllabus"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO student_syllabus_assignments (student_email, syllabus_id)
            VALUES (?, ?)
            """,
            (student_email, syllabus_id)
        )

        conn.commit()
        conn.close()

    def remove_student_from_syllabus(self, student_email, syllabus_id):
        """Remove a student from a syllabus"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Remove syllabus assignment
        cursor.execute(
            """
            DELETE FROM student_syllabus_assignments
            WHERE student_email = ? AND syllabus_id = ?
            """,
            (student_email, syllabus_id)
        )

        # Remove student progress for this syllabus
        cursor.execute(
            """
            DELETE FROM student_progress
            WHERE student_email = ? AND syllabus_id = ?
            """,
            (student_email, syllabus_id)
        )

        # Remove topic updates for this syllabus
        cursor.execute(
            """
            DELETE FROM topic_updates
            WHERE student_email = ? AND syllabus_id = ?
            """,
            (student_email, syllabus_id)
        )

        conn.commit()
        conn.close()

    def get_student_syllabuses(self, student_email):
        """Get all syllabuses assigned to a student"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT s.id, s.name, s.description
            FROM syllabuses s
            JOIN student_syllabus_assignments sa ON s.id = sa.syllabus_id
            WHERE sa.student_email = ?
            ORDER BY s.name
            """,
            (student_email,)
        )

        syllabuses = []
        for row in cursor.fetchall():
            syllabuses.append({
                "id": row[0],
                "name": row[1],
                "description": row[2]
            })

        conn.close()
        return syllabuses

    def update_topic_progress(self, student_email, syllabus_id, topic_id, is_completed):
        """Update individual topic progress for a specific syllabus"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get current completed topics for this syllabus
        cursor.execute(
            """
            SELECT completed_topics FROM student_progress
            WHERE student_email = ? AND syllabus_id = ?
            """,
            (student_email, syllabus_id)
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

        # Calculate new progress for this syllabus
        syllabus_topics = self.get_syllabus_topics(syllabus_id)
        total_weight = sum(topic["weight"] for topic in syllabus_topics)
        completed_weight = sum(
            topic["weight"]
            for topic in syllabus_topics
            if topic["id"] in completed_topics
        )

        progress_percentage = (
            (completed_weight / total_weight * 100) if total_weight > 0 else 0
        )

        # Insert or update student progress for this syllabus
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_progress
            (student_email, syllabus_id, completed_topics, progress_percentage, completed_count, total_topics, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (
                student_email,
                syllabus_id,
                json.dumps(completed_topics),
                progress_percentage,
                len(completed_topics),
                len(syllabus_topics),
            ),
        )

        # Log the topic update
        cursor.execute(
            """
            INSERT INTO topic_updates (student_email, syllabus_id, topic_id, is_completed)
            VALUES (?, ?, ?, ?)
            """,
            (student_email, syllabus_id, topic_id, is_completed),
        )

        conn.commit()
        conn.close()

        return {
            "progress_percentage": progress_percentage,
            "completed_count": len(completed_topics),
            "total_topics": len(syllabus_topics),
        }

    def get_student_progress(self, student_email, syllabus_id):
        """Get student's current progress for a specific syllabus"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT sp.progress_percentage, sp.completed_count, sp.total_topics, sp.completed_topics
            FROM student_progress sp
            WHERE sp.student_email = ? AND sp.syllabus_id = ?
            """,
            (student_email, syllabus_id),
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
            syllabus_topics = self.get_syllabus_topics(syllabus_id)
            syllabus_with_status = []
            for topic in syllabus_topics:
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
        """Get progress data for all students across all syllabuses"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT s.email, s.name, sy.name as syllabus_name,
                   sp.progress_percentage, sp.completed_count, sp.total_topics, sp.last_updated
            FROM students s
            JOIN student_syllabus_assignments sa ON s.email = sa.student_email
            JOIN syllabuses sy ON sa.syllabus_id = sy.id
            LEFT JOIN student_progress sp ON s.email = sp.student_email AND sy.id = sp.syllabus_id
            ORDER BY s.name, sy.name
            """
        )

        students = []
        for row in cursor.fetchall():
            students.append(
                {
                    "email": row[0],
                    "name": row[1],
                    "syllabus_name": row[2],
                    "progress_percentage": row[3] or 0,
                    "completed_count": row[4] or 0,
                    "total_topics": row[5] or 0,
                    "last_updated": row[6],
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

    def get_all_syllabuses(self):
        """Get all available syllabuses"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, name, description
            FROM syllabuses
            ORDER BY name
            """
        )

        syllabuses = []
        for row in cursor.fetchall():
            syllabuses.append({
                "id": row[0],
                "name": row[1],
                "description": row[2]
            })

        conn.close()
        return syllabuses

    def get_syllabus_topics(self, syllabus_id):
        """Get all topics for a syllabus (across all variants)"""
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT st.id, st.chapter_name, st.topic_name, st.topic_number, st.weight
            FROM syllabus_topics st
            JOIN syllabus_variants sv ON st.variant_id = sv.id
            WHERE sv.syllabus_id = ?
            ORDER BY st.chapter_name, st.topic_number
            """,
            (syllabus_id,)
        )

        topics = []
        for row in cursor.fetchall():
            topics.append({
                "id": row[0],
                "chapter": row[1],
                "subchapter": row[2],
                "weight": row[4]
            })

        conn.close()
        return topics

    def get_syllabus_structure(self, syllabus_id):
        """Get syllabus structure with variants and topics for frontend"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get syllabus info
        cursor.execute(
            """
            SELECT name, description FROM syllabuses WHERE id = ?
            """,
            (syllabus_id,)
        )
        syllabus_info = cursor.fetchone()
        if not syllabus_info:
            return None

        # Get variants
        cursor.execute(
            """
            SELECT id, name, description FROM syllabus_variants WHERE syllabus_id = ?
            """,
            (syllabus_id,)
        )

        variants = {}
        for row in cursor.fetchall():
            variant_id, variant_name, variant_desc = row
            variants[variant_id] = {
                "id": variant_id,
                "name": variant_name,
                "description": variant_desc,
                "topics": []
            }

        # Get topics for each variant
        for variant_id in variants.keys():
            cursor.execute(
                """
                SELECT id, chapter_name, topic_name, topic_number, weight
                FROM syllabus_topics
                WHERE variant_id = ?
                ORDER BY CAST(SUBSTR(id, INSTR(id, '_') + 1, INSTR(SUBSTR(id, INSTR(id, '_') + 1), '_') - 1) AS INTEGER),
                         topic_number
                """,
                (variant_id,)
            )

            for row in cursor.fetchall():
                topic_id, chapter_name, topic_name, topic_number, weight = row
                variants[variant_id]["topics"].append({
                    "id": topic_id,
                    "chapter_name": chapter_name,
                    "topic_name": topic_name,
                    "topic_number": topic_number,
                    "weight": weight
                })

        conn.close()

        return {
            "id": syllabus_id,
            "name": syllabus_info[0],
            "description": syllabus_info[1],
            "variants": list(variants.values())
        }


# Global database instance
db = DatabaseManager()