require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notesRouter = require("./routes/notes");
const pool = require("./db");


const app = express();


// CORS
const allowed = (process.env.CORS_ORIGIN || "").split(",").filter(Boolean);
app.use(
cors({
origin: (origin, cb) => {
if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
return cb(new Error("Not allowed by CORS"));
},
credentials: false,
})
);


app.use(express.json());


// Health check
app.get("/healthz", async (req, res) => {
try {
await pool.query("SELECT 1");
res.json({ status: "ok" });
} catch (e) {
res.status(500).json({ status: "db_error" });
}
});


// Routes
app.use("/notes", notesRouter);


// Root
app.get("/", (req, res) => {
res.send("Notes API is running");
});

app.post("/notes", async (req, res) => {
  console.log("REQ BODY:", req.body);   // 👈 debug
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));