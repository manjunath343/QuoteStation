import pool from '@/lib/db';

export async function DELETE(req) {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const id = pathname.split('/').pop();
    if (!id) {
      return Response.json({ error: "Quote ID required" }, { status: 400 });
    }
    const result = await pool.query("DELETE FROM quotes WHERE quote_id = $1", [id]);
    if (result.rowCount === 0) {
      return Response.json({ error: "Quote not found" }, { status: 404 });
    }
    return Response.json({ message: "Quote deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/quotes/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
