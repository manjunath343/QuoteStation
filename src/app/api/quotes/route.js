import pool from "@/lib/db";

import { nanoid } from "nanoid";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM quotes");
    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/quotes:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { writer, categories, customCategory, quote } = body;

    if (!writer || !quote || (!categories.length && !customCategory)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quote_id = nanoid(5);
    const category = customCategory || categories.join(',');

    await pool.query("INSERT INTO quotes (quote_id, writer, category, quote) VALUES ($1, $2, $3, $4)", [quote_id, writer, category, quote]);

    return Response.json({ message: "Quote added successfully", quote_id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/quotes:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { quote_id } = await req.json();
    if (!quote_id) return Response.json({ error: "Quote ID required" }, { status: 400 });
    await pool.query("DELETE FROM quotes WHERE quote_id = $1", [quote_id]);
    return Response.json({ message: "Quote deleted successfully" }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
