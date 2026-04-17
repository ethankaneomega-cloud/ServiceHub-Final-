const db = require("../config/db");
const bcrypt = require("bcryptjs");

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log("Usage: node scripts/resetUserPassword.js email@example.com NewPassword123");
  process.exit(1);
}

async function resetPassword() {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
      (err, result) => {
        if (err) {
          console.error("Error resetting password:", err.message);
          process.exit(1);
        }

        if (result.affectedRows === 0) {
          console.error("No user found with that email.");
          process.exit(1);
        }

        console.log(`Password reset successful for ${email}`);
        process.exit(0);
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error.message);
    process.exit(1);
  }
}

resetPassword();