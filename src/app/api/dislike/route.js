import pool from '@/lib/db';
import { parse } from 'url';

export async function PUT(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Quote ID required" }, { status: 400 });
    }
    await pool.query("UPDATE quotes SET dislikes = dislikes + 1, likes = GREATEST(likes - 1, 0) WHERE quote_id = $1", [id]);
    return Response.json({ message: "Quote disliked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/quotes/dislike:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
