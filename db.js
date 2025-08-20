require("dotenv").config();
const { Pool } = require("pg");


const isProd = process.env.NODE_ENV === "production";


let poolConfig;


if (process.env.DATABASE_URL) {
poolConfig = {
connectionString: process.env.DATABASE_URL,
ssl: isProd || /sslmode=require/.test(process.env.DATABASE_URL)
? { rejectUnauthorized: false }
: false,
};
} else {
poolConfig = {
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASS,
port: parseInt(process.env.DB_PORT || "5432", 10),
ssl: isProd ? { rejectUnauthorized: false } : false,
};
}


const pool = new Pool(poolConfig);


pool.on("error", (err) => {
console.error("Unexpected PG client error", err);
process.exit(-1);
});


module.exports = pool;