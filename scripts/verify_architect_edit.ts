
import { runWriterStream } from '../services/geminiService';
import { BlogInput, Blueprint, InsightCard } from '../types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEST_BLUEPRINT: Blueprint = {
    title: "TEST TITLE: Manual Edit Verification",
    flow: "Manual Flow",
    targetAudience: "Parent",
    sections: [
        {
            sectionId: 1,
            title: "Manual Section 1",
            description: "This section was manually added by verification script.",
            keySentence: "Manual Key Sentence #1",
            sourceIds: []
        },
        {
            sectionId: 2,
            title: "Manual Section 2",
            description: "This is the second manually edited section.",
            keySentence: "Manual Key Sentence #2",
            sourceIds: []
        }
    ]
};

const MOCK_INSIGHT: InsightCard = {
    facts: ["Fact A", "Fact B"],
    sources: [],
    rawContext: ""
};

const DOCS_DIR = path.resolve(__dirname, '../public/docs');
const loadFile = (filename: string) => fs.readFileSync(path.join(DOCS_DIR, filename), 'utf-8');

async function verifyArchitectEdit() {
    console.log("🚀 Starting Verification: Manual Blueprint Editing");

    const manualGuide = loadFile('writing_style_guide.txt');
    const brandGuide = loadFile('brand_guide.txt');

    const input: BlogInput = {
        platform: 'Naver',
        targetAudience: 'Parent',
        topic: "Test Topic",
        selectedKeyword: "Test",
        selectedTopic: "Test",
        selectedFlow: "Test",
        libraryFiles: [],
        insightCard: MOCK_INSIGHT,
        blueprint: TEST_BLUEPRINT,
        useKnowledgeBase: true,
        searchPeriod: 'month',       // Added
        customSearchPeriod: '',      // Added
        analysisFocus: 'micro'       // Added
    };

    console.log("📝 Injecting Manually Edited Blueprint:", JSON.stringify(TEST_BLUEPRINT, null, 2));

    try {
        console.log("\n[Step 3] Running Writer with Manual Blueprint...");
        const mockStyleCard = {
            purpose: "Verification",
            structureTemplate: "Standard",
            toneRules: [],
            factRules: [],
            negativeConstraints: [],
            formattingRules: [],
            forbiddenList: [],
            formatRules: [],
            qaChecklist: [],
            knowledgeBase: ""
        };
        const generator = runWriterStream(input, mockStyleCard, "", [], manualGuide, brandGuide);

        let output = "";
        for await (const chunk of generator) {
            output += chunk;
            process.stdout.write(chunk);
        }

        console.log("\n\n✅ Writer Final Output Length:", output.length);

        // Validation: Check if the writer actually used the manual titles
        if (output.includes("Manual Section 1") || output.includes("Manual Key Sentence #1")) {
            console.log("✨ SUCCESS: Writer respected the manual blueprint.");
        } else {
            console.log("⚠️ WARNING: Writer might have ignored manual instructions. Check output.");
        }

    } catch (e: any) {
        console.error("❌ CRTICAL ERROR:", e.message);
    }
}

verifyArchitectEdit();
