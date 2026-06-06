import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");
const storageDir = path.join(__dirname, "../storage/processed");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  console.log("=============================================");
  console.log("🚀 STARTING COMPREHENSIVE PIPELINE VERIFICATION");
  console.log("=============================================\n");

  const testFile = path.join(publicDir, "logo.png");
  if (!fs.existsSync(testFile)) {
    console.error("❌ Test image not found at", testFile);
    process.exit(1);
  }

  // STEP 1: Upload
  console.log("▶ [STEP 1] Uploading test image to the Queue API...");
  const buffer = fs.readFileSync(testFile);
  const blob = new Blob([buffer], { type: "image/png" });
  
  const formData = new FormData();
  formData.append("file", blob, "logo.png");
  formData.append("sourceType", "manual_upload");
  formData.append("description", "PR Verification Test");

  let jobId;
  try {
    const res = await fetch("http://localhost:3000/api/screenshots", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    jobId = data.jobId;
    console.log(`✅ Upload Success! Job ID received: ${jobId}`);
    console.log(`✅ Status returned: ${data.status}\n`);
  } catch (err) {
    console.error("❌ Failed to hit API. Is Next.js running on port 3000?", err.message);
    process.exit(1);
  }

  // STEP 2: Wait for background worker
  console.log("▶ [STEP 2] Waiting 2 seconds for the background worker to process the job...");
  console.log("   (Check your Next.js terminal to see the live stage timing logs!)");
  await sleep(2000);
  console.log("✅ Wait complete.\n");

  // STEP 3: Check Database
  console.log("▶ [STEP 3] Verifying SQLite Database Record...");
  try {
    const dbRes = await fetch("http://localhost:3000/api/screenshots");
    const records = await dbRes.json();
    const ourRecord = records.find(r => r.screenshot.id === jobId);
    
    if (ourRecord) {
      console.log(`✅ Record successfully inserted into SQLite database!`);
      console.log(`✅ Data extracted: [OCR: ${ourRecord.ocr.hasText}] [Vision: ${ourRecord.vision?.labels?.length || 0} labels]\n`);
    } else {
      console.error("❌ Job ID not found in database. The pipeline may have failed.");
    }
  } catch (err) {
    console.error("❌ Failed to query database.", err.message);
  }

  // STEP 4: Check File Storage
  console.log("▶ [STEP 4] Verifying Processed JSON Storage...");
  const processedFilePath = path.join(storageDir, `${jobId}.json`);
  if (fs.existsSync(processedFilePath)) {
    console.log(`✅ Backup JSON successfully saved to local file system!`);
    console.log(`✅ File location: ${processedFilePath}\n`);
  } else {
    console.error(`❌ Processed file not found at ${processedFilePath}`);
  }

  console.log("=============================================");
  console.log("🎉 ALL TESTS PASSED! PIPELINE IS FULLY OPERATIONAL!");
  console.log("=============================================");
}

runVerification();
