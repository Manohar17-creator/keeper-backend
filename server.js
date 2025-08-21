require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notesRouter = require("./routes/notes");
const pool = require("./db");
const fs = require("fs");
const path = require("path");

const app = express();



const allowedOrigins = [
  "http://localhost:3000", // ✅ for local dev
  "https://singular-valkyrie-96f820.netlify.app" // ✅ your deployed frontend
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE"], // ✅ allow only needed methods
    credentials: true
  })
);


app.use(express.json());

// ✅ Auto-create schema on startup
async function initDB() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql"); // ensure schema.sql is in backend root
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("✅ Schema applied successfully");
  } catch (err) {
    console.error("❌ Error applying schema:", err.message);
  }
}

initDB(); // run once at startup

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
  console.log("REQ BODY:", req.body);
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
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
