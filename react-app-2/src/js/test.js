// // var date = new Date();
// //       date.setDate(date.getDate() - 1)
// //     //   const currentDate = date.toLocaleString().split("T")[0];
// //       const currentDate = date.getFullYear() + "-" +(date.getMonth()+1) + "-" + date.getDate();
// const date = new Date();
// const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
// console.log(currentDate);

//     //   console.log(currentDate);


import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";


async function getJSON(selectedDate) {
  try {
    // Ensure the date is properly formatted and escaped
    const query = `SELECT sensor_data FROM TestTable WHERE date = ?`;
    const data = await db.get(query, [selectedDate]); // Use db.get for a single row

    console.log(`Data read successfully for date: ${selectedDate}`);
    return data;
  } catch (err) {
    console.error("Error reading data:", err.message);
  }
}

async function readData(selectedDate) {
  try {
    // Open the database
    const db = await open({
      filename: "src/db/sendor_data.db",
      driver: sqlite3.Database,
    });
    // Function to read JSON data from the SQLite table
    const query = `SELECT sensor_data FROM TestTable WHERE date = ?`;
    const data = await db.get(query, [selectedDate]); // Use db.get for a single row
    console.log(JSON.parse(data.sensor_data).sensor_data);
    // Close the database
    await db.close();
    console.log("Database closed successfully.");
  } catch (err) {
    console.error("Error running DB routine:", err);
  }
}


readData("2024-7-27");