import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { PythonShell } from "python-shell";

const app = express();
const port = 8080;

console.log("Node server is starting...");
// // WebSocket server
// const wss = new WebSocketServer({ port: 8090 });

// wss.on("connection", (ws) => {
//   console.log("Client connected");
//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// Function to send a WebSocket notification
// function sendWebSocketNotification() {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(
//         JSON.stringify({
//           notification: `E. coli presence detected. Please take necessary actions.`,
//         })
//       );
//     }
//   });
// }

// Create an SQLite database instance
const db = new sqlite3.Database("src/db/sendor_data.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define an endpoint to fetch historical data
app.get("/api/historical_data", (req, res) => {
  const startDate = req.query.start_date;
  let input;
  let formatted_data;
  //   const endDate = req.query.end_date;

  if (!startDate) {
    return res.status(400).json({ error: "start_date is required" });
  }

  const query = `
    SELECT sensor_data FROM TestTable
    WHERE date = ?
  `;

  db.all(query, [startDate], (err, rows) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Failed to retrieve data" });
    }
    // Extract sensor_data from each row
    const sensorData = rows.map((row) => row.sensor_data);

    if (sensorData == null || sensorData == "") {
      input = JSON.stringify(sensorData);
      formatted_data = JSON.parse(input);
    } else {
      formatted_data = JSON.parse(sensorData).sensor_data;
    }
    res.json(formatted_data);
  });
});

// Define predict api
const python_exe_path = ".venv/bin/python3";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.post("/api/predict", (req, res, next) => {
  const features = req.body;

  const options = {
    mode: "text",
    pythonPath: python_exe_path,
    pythonOptions: ["-u"], // get print results in real-time
    // scriptPath: __dirname,
    args: [JSON.stringify(features)],
  };

  let pyshell = new PythonShell("./src/py/predict.py", options);
  pyshell.on("message", function (message) {
    try {
      const results = JSON.parse(message);
      const prediction = parseInt(results.prediction);
      // Send notification if prediction is positive (assuming 1 indicates presence of E. coli)
      // if (prediction === 1) {
      //   sendWebSocketNotification();
      // }
      res.json(results);
    } catch (err) {
      console.error("Error parsing prediction results:", err);
      res.status(500).json({ error: "Failed to parse prediction results" });
    }
  });
  pyshell.end(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Prediction closed...");
    }
  });
  // Don't put next in predict
  // PythonShell.run("src/py/predict.py", options, (err, results) => {
  //   if (err) throw err;
  //   // results: hold full json
  //   const prediction = parseInt(results["prediction"]);

  //   // Send notification if prediction is positive (assuming 1 indicates presence of E. coli)
  //   if (prediction === 1) {
  //     sendWebSocketNotification();
  //   }
  //   res.json(results);
  // });
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// try {
//     open({
//       filename: "src/db/sendor_data.db",
//       driver: sqlite3.Database,
//     }).then((db) => {
//         console.log('Connected to the SQLite database.');
//         app.get('/api/historical_data', (req, res) => {
//             const startDate = req.query.start_date;
//             // const endDate = req.query.end_date;
//             // if (!startDate || !endDate) {
//             //     return res.status(400).json({ error: 'start_date and end_date are required' });
//             //   }
//             if (!startDate) {
//               return res.status(400).json({ error: 'start_date is required' });
//             }

//             const query = `
//               SELECT sensor_data FROM TestTable
//               WHERE date = ?
//             `;
//             db.all(query, [startDate], (err, rows) => {
//                 if (err) {
//                   console.error('Error executing query:', err);
//                   return res.status(500).json({ error: 'Failed to retrieve data from sqlite' });
//                 }
//                 res.json(rows);
//               });
//             // db.all(query, [startDate, endDate], (err, rows) => {
//             //   if (err) {
//             //     console.error('Error executing query:', err);
//             //     return res.status(500).json({ error: 'Failed to retrieve data' });
//             //   }
//             //   res.json(rows);
//             // });
//           });

//     });
// }
// catch (err) {
//     console.error('Error opening database:', err);
// }finally {
//     app.listen(port, () => {
//         console.log(`Server is running on http://localhost:${port}`);
//       });
// }
