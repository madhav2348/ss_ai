import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "../public/logo.png");

async function run() {
  console.log("Preparing to upload:", filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error("File not found!", filePath);
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: "image/png" });
  
  const formData = new FormData();
  formData.append("file", blob, "logo.png");
  formData.append("sourceType", "manual_upload");
  formData.append("description", "Testing worker pipeline via Node script");

  console.log("Sending POST request to http://localhost:3000/api/screenshots ...");
  
  try {
    const response = await fetch("http://localhost:3000/api/screenshots", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    console.log("Status Code:", response.status);
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

run();
