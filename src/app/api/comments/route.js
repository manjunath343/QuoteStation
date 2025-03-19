import pool from '@/lib/db';
import { nanoid } from 'nanoid';
import { parse } from 'url';

export async function GET(req) {
  try {
    const { query } = parse(req.url, true);
    const { quote_id } = query;
    const result = await pool.query("SELECT * FROM comments WHERE quote_id = $1", [quote_id]);
    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { quote_id, comment } = body;

    if (!quote_id || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    const comment_id = nanoid(5);
    await pool.query("INSERT INTO comments (quote_id, comment_id, comment) VALUES ($1, $2, $3)", [quote_id, comment_id, comment]);

    return Response.json({ message: "Comment added successfully", comment_id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { comment_id } = body;
    if (!comment_id) return Response.json({ error: "Comment ID required" }, { status: 400 });
    await pool.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
    return Response.json({ message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/comments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
