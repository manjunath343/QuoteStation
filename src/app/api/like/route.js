import pool from '@/lib/db';


export async function PUT(req) {
  try {
    
    const { id } = await req.json();
    console.log(id);
    if (!id) {
      return Response.json({ error: "Quote ID required" }, { status: 400 });
    }
    await pool.query("UPDATE quotes SET likes = likes + 1, dislikes = GREATEST(dislikes - 1, 0) WHERE quote_id = $1", [id]);
    return Response.json({ message: "Quote liked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/quotes/like:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
