const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "ongc",
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
    });

    try {
        console.log("Dropping column 'software' from 'users' table...");
        await pool.query("ALTER TABLE users DROP COLUMN software;");
        console.log("Success! Column dropped.");
    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await pool.end();
    }
}

run();
