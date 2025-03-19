
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { newPassword } = await req.json();

    if (!newPassword) {
      return Response.json({ success: false, message: "New password is required." }, { status: 400 });
    }

    // Update the password (store as plain text for now, but hashing is recommended)
    const result = await pool.query("UPDATE admins SET password_hash = $1 WHERE username = 'admin'", [newPassword]);

    if (result.rowCount > 0) {
      return Response.json({ success: true, message: "Password updated successfully." }, { status: 200 });
    } else {
      return Response.json({ success: false, message: "Admin not found or no change in password." }, { status: 404 });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return Response.json({ success: false, message: "An error occurred. Please try again." }, { status: 500 });
  }
}
