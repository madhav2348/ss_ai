import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

async function testOCR() {
    // 1. Look for an image in the root named 'sample.png'
    const imagePath = path.join(process.cwd(), 'sample.png');

    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Error: Place a 'sample.png' file in the root folder (${process.cwd()})`);
        process.exit(1);
    }

    console.log(`📸 Reading: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);

    console.log('🧠 Running Tesseract.js... (First run downloads ~10MB WASM file, please wait)...');

    try {
        const result = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`   Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
        });

        console.log('✅ OCR Complete!');
        console.log('📝 Extracted Text:', result.data.text.trim() || '[NO TEXT FOUND]');
        console.log(`📊 Confidence: ${result.data.confidence}%`);
    } catch (error) {
        console.error('❌ OCR Failed:', error);
    }
}

testOCR();