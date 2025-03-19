import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    console.log(username, password);

    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1 AND password_hash = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      return Response.json({ success: true }, { status: 200 });
    } else {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return Response.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
