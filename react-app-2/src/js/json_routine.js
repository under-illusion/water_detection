import fs from "fs";
import path from "path";

const jsonDir = path.join("src/json", "");

export default async function rotateJsonFiles() {
  // const currentDate = new Date().toISOString().split("T")[0];
  var date = new Date();
  date.setDate(date.getDate() - 1);
  // const currentDate = date.toISOString().split("T")[0];
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  const currentJsonFile = path.join(jsonDir, "db.json");
  const newJsonFile = path.join(jsonDir, `sensor_data_${currentDate}.json`);
  const backupJsonFile = path.join(jsonDir, `db_backup_${currentDate}.json`);

  try {
    // Ensure the directory exists
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    // Backup the current db.json file
    if (fs.existsSync(currentJsonFile)) {
      fs.copyFileSync(currentJsonFile, backupJsonFile);
    }

    // Rename the current db.json to the new file with the date
    if (fs.existsSync(currentJsonFile)) {
      fs.renameSync(currentJsonFile, newJsonFile);
    }

    // Create a new empty db.json file
    fs.writeFileSync(currentJsonFile, JSON.stringify({ sensor_data: [] }));

    console.log("JSON files rotated successfully");
  } catch (err) {
    console.error("Error rotating JSON files:", err.message);
  }
}

// rotateJsonFiles();
