import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");

async function runVerification() {
  const testFile = path.join(publicDir, "logo.png");
  const buffer = fs.readFileSync(testFile);
  const blob = new Blob([buffer], { type: "image/png" });
  
  const formData = new FormData();
  formData.append("file", blob, "logo.png");
  formData.append("sourceType", "local");

  const res = await fetch("http://localhost:3000/api/screenshots", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  console.log("Job ID:", data.jobId);
}
runVerification();
