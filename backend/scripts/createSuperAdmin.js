const db = require("../config/db");
const bcrypt = require("bcryptjs");

const SUPER_ADMIN = {
  full_name: "Main Super Admin",
  email: "admin@servicehub.com",
  password: "Admin12345",
  role: "super_admin",
  approval_status: "approved",
};

async function createOrUpdateSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, 10);

    db.query(
      "SELECT id, email, role FROM users WHERE email = ?",
      [SUPER_ADMIN.email],
      (selectErr, results) => {
        if (selectErr) {
          console.error("Error checking existing super admin:", selectErr.message);
          process.exit(1);
        }

        if (results.length > 0) {
          const existingUser = results[0];

          const updateSql = `
            UPDATE users
            SET full_name = ?, password = ?, role = ?, approval_status = ?
            WHERE email = ?
          `;

          db.query(
            updateSql,
            [
              SUPER_ADMIN.full_name,
              hashedPassword,
              SUPER_ADMIN.role,
              SUPER_ADMIN.approval_status,
              SUPER_ADMIN.email,
            ],
            (updateErr) => {
              if (updateErr) {
                console.error("Error updating super admin:", updateErr.message);
                process.exit(1);
              }

              console.log("Existing account updated to super admin successfully.");
              console.log("Email:", SUPER_ADMIN.email);
              console.log("Password:", SUPER_ADMIN.password);
              console.log("User ID:", existingUser.id);
              process.exit(0);
            }
          );

          return;
        }

        const insertSql = `
          INSERT INTO users
          (full_name, email, password, role, approval_status)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            SUPER_ADMIN.full_name,
            SUPER_ADMIN.email,
            hashedPassword,
            SUPER_ADMIN.role,
            SUPER_ADMIN.approval_status,
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error("Error creating super admin:", insertErr.message);
              process.exit(1);
            }

            console.log("Super admin created successfully.");
            console.log("Email:", SUPER_ADMIN.email);
            console.log("Password:", SUPER_ADMIN.password);
            console.log("Inserted ID:", result.insertId);
            process.exit(0);
          }
        );
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error.message);
    process.exit(1);
  }
}

createOrUpdateSuperAdmin();