const express = require("express");
const path = require("path");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    express.json()
);


app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ========================================
// STUDENT REGISTRATION
// ========================================

app.post(
    "/api/register",
    (req, res) => {

        const {
            studentId,
            name,
            email,
            password,
            department
        } = req.body;


        if (
            !studentId ||
            !name ||
            !email ||
            !password ||
            !department
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all fields."

            });

        }


        const sql = `
            INSERT INTO students
            (
                student_id,
                name,
                email,
                password,
                department
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.run(
            sql,
            [
                studentId,
                name,
                email,
                password,
                department
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Registration error:",
                        err.message
                    );


                    if (
                        err.message.includes(
                            "UNIQUE constraint failed"
                        )
                    ) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "Student ID or Email already exists."

                        });

                    }


                    return res.status(500).json({

                        success: false,

                        message:
                            "Registration failed."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Registration successful!",

                    studentId:
                        this.lastID

                });

            }
        );

    }
);


// ========================================
// STUDENT LOGIN
// ========================================

app.post(
    "/api/login",
    (req, res) => {

        const {
            studentId,
            password
        } = req.body;


        if (
            !studentId ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Student ID and Password are required."

            });

        }


        const sql = `
            SELECT
                id,
                student_id,
                name,
                email,
                department
            FROM students
            WHERE student_id = ?
            AND password = ?
        `;


        db.get(
            sql,
            [
                studentId,
                password
            ],
            (err, student) => {

                if (err) {

                    console.error(
                        "Login error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Login failed."

                    });

                }


                if (!student) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Invalid Student ID or Password."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Login successful!",

                    student:
                        student

                });

            }
        );

    }
);


// ========================================
// APPLY FOR LEAVE
// ========================================

app.post(
    "/api/leave",
    (req, res) => {

        const {
            studentId,
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;


        if (
            !studentId ||
            !leaveType ||
            !startDate ||
            !endDate ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all leave fields."

            });

        }


        const sql = `
            INSERT INTO leave_applications
            (
                student_id,
                leave_type,
                start_date,
                end_date,
                reason
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.run(
            sql,
            [
                studentId,
                leaveType,
                startDate,
                endDate,
                reason
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Leave application error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to submit leave application."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Leave application submitted successfully!",

                    applicationId:
                        this.lastID

                });

            }
        );

    }
);


// ========================================
// GET STUDENT LEAVE HISTORY
// ========================================

app.get(
    "/api/leave-history/:studentId",
    (req, res) => {

        const studentId =
            req.params.studentId;


        const sql = `
            SELECT
                id,
                student_id,
                leave_type,
                start_date,
                end_date,
                reason,
                status,
                created_at
            FROM leave_applications
            WHERE student_id = ?
            ORDER BY created_at DESC
        `;


        db.all(
            sql,
            [studentId],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Leave history error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load leave history."

                    });

                }


                res.json({

                    success: true,

                    applications:
                        rows

                });

            }
        );

    }
);


// ========================================
// ADMIN - GET ALL LEAVE APPLICATIONS
// ========================================

app.get(
    "/api/admin/leave-applications",
    (req, res) => {

        const sql = `
            SELECT
                id,
                student_id,
                leave_type,
                start_date,
                end_date,
                reason,
                status,
                created_at
            FROM leave_applications
            ORDER BY created_at DESC
        `;


        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Admin leave applications error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load leave applications."

                    });

                }


                res.json({

                    success: true,

                    applications:
                        rows

                });

            }
        );

    }
);


// ========================================
// ADMIN - UPDATE LEAVE STATUS
// ========================================

app.put(
    "/api/admin/leave-applications/:id/status",
    (req, res) => {

        const applicationId =
            req.params.id;


        const {
            status
        } = req.body;


        if (
            status !== "Approved" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be Approved or Rejected."

            });

        }


        const sql = `
            UPDATE leave_applications
            SET status = ?
            WHERE id = ?
        `;


        db.run(
            sql,
            [
                status,
                applicationId
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Status update error:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to update leave status."

                    });

                }


                if (
                    this.changes === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Leave application not found."

                    });

                }


                res.json({

                    success: true,

                    message:
                        `Leave application ${status.toLowerCase()} successfully.`

                });

            }
        );

    }
);


// ========================================
// ADMIN - GET ALL REGISTERED STUDENTS
// ========================================
// NEW FEATURE
// Approximate lines: 260-315
// ========================================

app.get(
    "/api/admin/students",
    (req, res) => {

        const sql = `
            SELECT
                id,
                student_id,
                name,
                email,
                department,
                created_at
            FROM students
            ORDER BY created_at DESC
        `;


        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Error fetching students:",
                        err.message
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to load students."

                    });

                }


                res.json({

                    success: true,

                    students:
                        rows

                });

            }
        );

    }
);


// ========================================
// HOME PAGE
// ========================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);