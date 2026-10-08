const sqlite3 = require("sqlite3").verbose();
const path = require("path");


// ========================================
// DATABASE PATH
// ========================================

const dbPath = path.join(
    __dirname,
    "database",
    "leave_management.db"
);


// ========================================
// CONNECT TO DATABASE
// ========================================

const db = new sqlite3.Database(
    dbPath,
    (err) => {

        if (err) {

            console.error(
                "Database connection failed:",
                err.message
            );

        } else {

            console.log(
                "SQLite database connected successfully!"
            );

        }

    }
);


// ========================================
// CREATE STUDENTS TABLE
// ========================================

db.run(`
    CREATE TABLE IF NOT EXISTS students (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        student_id TEXT UNIQUE NOT NULL,

        name TEXT NOT NULL,

        email TEXT UNIQUE NOT NULL,

        password TEXT NOT NULL,

        department TEXT,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`, (err) => {

    if (err) {

        console.error(
            "Error creating students table:",
            err.message
        );

    } else {

        console.log(
            "Students table is ready!"
        );

    }

});


// ========================================
// CREATE LEAVE APPLICATIONS TABLE
// ========================================

db.run(`
    CREATE TABLE IF NOT EXISTS leave_applications (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        student_id TEXT NOT NULL,

        leave_type TEXT NOT NULL,

        start_date TEXT NOT NULL,

        end_date TEXT NOT NULL,

        reason TEXT NOT NULL,

        status TEXT DEFAULT 'Pending',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`, (err) => {

    if (err) {

        console.error(
            "Error creating leave applications table:",
            err.message
        );

    } else {

        console.log(
            "Leave applications table is ready!"
        );

    }

});


// ========================================
// EXPORT DATABASE
// ========================================

module.exports = db;