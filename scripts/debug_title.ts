
import { suggestTitles } from '../services/geminiService';
import { Platform } from '../types';
import fs from 'fs';
import path from 'path';

// Mock environment
const readDoc = (name: string) => {
    try {
        return fs.readFileSync(path.join(process.cwd(), 'DOCS', name), 'utf-8');
    } catch (e) {
        return "Mock Doc Content";
    }
};

async function main() {
    console.log("Starting Debug for suggestTitles...");

    const brandGuide = readDoc('brand guide');
    const styleGuide = readDoc('writing style guide');

    // Test Case: Parent Mode
    console.log("\n--- Testing Target Audience: Parent ---");
    try {
        const results = await suggestTitles(
            "SAT Reading Inference",
            "Google",
            brandGuide,
            styleGuide,
            "Parent"
        );
        console.log("Result (Parent):", JSON.stringify(results, null, 2));
    } catch (e) {
        console.error("Error (Parent):", e);
    }

    // Test Case: Student Mode
    console.log("\n--- Testing Target Audience: Student ---");
    try {
        const resultsS = await suggestTitles(
            "SAT Reading Inference",
            "Google",
            brandGuide,
            styleGuide,
            "Student"
        );
        console.log("Result (Student):", JSON.stringify(resultsS, null, 2));
    } catch (e) {
        console.error("Error (Student):", e);
    }
}

main();
