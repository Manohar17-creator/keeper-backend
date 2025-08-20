const express = require("express");
const router = express.Router();
const pool = require("../db");


// GET /notes -> list notes
router.get("/", async (req, res) => {
try {
const result = await pool.query(
"SELECT id, title, content, created_at FROM notes ORDER BY id DESC"
);
res.json(result.rows);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to fetch notes" });
}
});


// POST /notes -> create note
router.post("/", async (req, res) => {
try {
const { title, content } = req.body;
if (!title || !content) {
return res.status(400).json({ error: "title and content are required" });
}
const result = await pool.query(
"INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at",
[title, content]
);
res.status(201).json(result.rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to create note" });
}
});


// DELETE /notes/:id -> delete by id
router.delete("/:id", async (req, res) => {
try {
const id = Number(req.params.id);
if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
await pool.query("DELETE FROM notes WHERE id = $1", [id]);
res.json({ message: "Note deleted" });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to delete note" });
}
});


module.exports = router;