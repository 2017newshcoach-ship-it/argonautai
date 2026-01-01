
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
let apiKey = process.env.GEMINI_API_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2 && parts[0].trim() === 'VITE_GEMINI_API_KEY') {
            apiKey = parts.slice(1).join('=').trim();
        }
    });
}

if (!apiKey) {
    console.error("No API Key found.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        console.log("Testing gemini-3-pro-preview...");
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
        const result = await model.generateContent("Hello Gemini 3.0!");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS: Gemini 3.0 is available.");
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

run();
