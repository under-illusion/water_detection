import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Load Data to DB
export default async function loadEndDayData() {
  try {
    open({
      filename: "src/db/sendor_data.db",
      driver: sqlite3.Database,
    }).then((db) => {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      console.log(currentDate);
      const location = "CN";
      const waterSource = "1";

      // Function to write JSON data to the SQLite table
      async function writeToDatabase(
        jsonFilePath,
        db,
        currentDate,
        location,
        waterSource
      ) {
        try {
          // Read JSON file
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          // Convert JSON data to a string
          const sensorData = JSON.stringify(jsonData);
          // Insert data into the table
          const insertQuery = `INSERT INTO TestTable (date, sensor_data, location, water_source) VALUES (?, ?, ?, ?)`;
          await db.run(insertQuery, [
            currentDate,
            sensorData,
            location,
            waterSource,
          ]);

          console.log(`Data inserted successfully for date: ${currentDate}`);
        } catch (err) {
          console.error("Error inserting data:", err.message);
        }
      }

      // Specify the path to the JSON file
      const jsonFilePath = path.join(
        "src/json",
        `sensor_data_${currentDate}.json`
      );
      // Write JSON data to the database
      writeToDatabase(jsonFilePath, db, currentDate, location, waterSource);

      // Close the database
      db.close();
      console.log("Database closed successfully.");
    });
  } catch (err) {
    console.error("Error running DB-Routine:", err);
  }
}

loadEndDayData();
// Read Data from DB

// async function getJSON(selectedDate) {
//   try {
//     // Ensure the date is properly formatted and escaped
//     const query = `SELECT sensor_data FROM TestTable WHERE date = ?`;
//     const data = await db.get(query, [selectedDate]); // Use db.get for a single row

//     console.log(`Data read successfully for date: ${selectedDate}`);
//     return data;
//   } catch (err) {
//     console.error("Error reading data:", err.message);
//   }
// }

// export async function readData(selectedDate) {
//   try {
//     // Open the database
//     const db = await open({
//       filename: "src/db/sendor_data.db",
//       driver: sqlite3.Database,
//     });
//     // Function to read JSON data from the SQLite table
//     const chart_data = await getJSON(selectedDate);
//     // Close the database
//     await db.close();
//     console.log("Database closed successfully.");

//     return chart_data;
//   } catch (err) {
//     console.error("Error running DB routine:", err);
//   }
// }
