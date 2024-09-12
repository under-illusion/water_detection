// main.mjs
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import { PythonShell } from "python-shell";
import schedule from "node-schedule";
import loadEndDayData from "../react-app-2/src/js/db_routine.js";
import rotateJsonFiles from "../react-app-2/src/js/json_routine.js";

// Set up python terminal
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const python_exe_path = ".venv/bin/python3";
const py_shell_options = {
  mode: "text",
  pythonPath: python_exe_path,
  pythonOptions: ["-u"], // get print results in real-time
  scriptPath: __dirname,
  // args: ['value1', 'value2', 'value3']
};

// Runs simulator
let pyshell = new PythonShell("./src/py/simulator.py", py_shell_options);
pyshell.on("message", function (message) {
  console.log(message);
});
pyshell.end(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Simulator closed...");
  }
});

// Update at midnight
function scheduleTasks() {
  // Schedule rotateJsonFiles to run at midnight every day
  schedule.scheduleJob("0 0 * * *", async () => {
    await rotateJsonFiles();
  });

  // Schedule loadEndDayData to run at midnight every day
  schedule.scheduleJob("0 0 * * *", async () => {
    await loadEndDayData();
  });

  console.log("Tasks scheduled to run at midnight every day");
}

// Displays Window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "dist/index.html")}`
  );
}

// app.on("ready", createWindow);
app.on("ready", () => {
  createWindow();
  scheduleTasks();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
