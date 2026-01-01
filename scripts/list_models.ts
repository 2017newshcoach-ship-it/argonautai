
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

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models listed.", data);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
