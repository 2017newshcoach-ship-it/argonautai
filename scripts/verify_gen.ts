
import { runDeepResearch, suggestBlueprint, runWriterStream } from '../services/geminiService';
import { BlogInput, Platform } from '../types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEST_CONFIG = {
    TOPIC: 'Digital SAT Logical Reasoning Strategy',
    TARGET_AUDIENCE: 'Parent' as const,
    PLATFORM: 'Naver' as Platform
};

const DOCS_DIR = path.resolve(__dirname, '../public/docs');

// Mock Load Guides
const loadFile = (filename: string) => {
    try {
        return fs.readFileSync(path.join(DOCS_DIR, filename), 'utf-8');
    } catch (e) {
        return `[Mock Content for ${filename}]`;
    }
};

async function verifyDeepResearchFlow() {
    console.log("🚀 Starting Verification: Deep Research Flow (3-Step)");
    console.log(`Topic: ${TEST_CONFIG.TOPIC} | Audience: ${TEST_CONFIG.TARGET_AUDIENCE}`);

    // Base Input
    let input: BlogInput = {
        platform: TEST_CONFIG.PLATFORM,
        targetAudience: TEST_CONFIG.TARGET_AUDIENCE,
        topic: TEST_CONFIG.TOPIC,
        // Deprecated fields needed for TS until cleaned
        selectedKeyword: '', selectedTopic: '', selectedFlow: '', studyGuideFiles: [], libraryFiles: [],
        searchPeriod: 'month', customSearchPeriod: '', analysisFocus: 'micro', useKnowledgeBase: true,
    } as any;

    const styleGuide = loadFile('writing_style_guide.txt');
    const brandGuide = loadFile('brand_guide.txt');
    const knowledgeBase = loadFile('knowledge_base.txt');

    // Step 1: Deep Research
    console.log("\n[Step 1] Running Deep Research...");
    try {
        const insightCard = await runDeepResearch(TEST_CONFIG.TOPIC, true, knowledgeBase);
        console.log("✅ Insight Card Generated:");
        console.log("- Facts:", insightCard.facts.length);
        console.log("- Sources:", insightCard.sources.length);
        input.insightCard = insightCard;
    } catch (e: any) {
        console.error("❌ Step 1 Failed:", e.message);
        return;
    }

    // Step 2: Architect (Blueprint)
    console.log("\n[Step 2] Designing Blueprint...");
    try {
        const blueprint = await suggestBlueprint(
            TEST_CONFIG.TOPIC,
            input.insightCard!,
            styleGuide,
            brandGuide,
            TEST_CONFIG.TARGET_AUDIENCE
        );
        console.log("✅ Blueprint Generated:");
        console.log("- Title:", blueprint.title);
        console.log("- Flow:", blueprint.flow);
        console.log("- Sections:", blueprint.sections.length);
        input.blueprint = blueprint;
    } catch (e: any) {
        console.error("❌ Step 2 Failed:", e.message);
        return;
    }

    // Step 3: Writer
    console.log("\n[Step 3] Running Writer Stream...");
    try {
        const sources = input.insightCard!.sources.map(s => ({ title: s.title, uri: s.url || "" }));
        // Mock empty styleCard for now
        const stream = runWriterStream(input, {} as any, JSON.stringify(input.insightCard!.facts), sources, styleGuide, brandGuide);

        let fullText = "";
        process.stdout.write("Writing: ");
        for await (const chunk of stream) {
            fullText += chunk;
            process.stdout.write(".");
        }
        console.log("\n✅ Writer Completed. Length:", fullText.length);

        if (fullText.length > 500) {
            console.log("✨ SUCCESS: Workflow verification passed.");
        } else {
            console.warn("⚠️ Warning: Output seems too short.");
        }

    } catch (e: any) {
        console.error("❌ Step 3 Failed:", e.message);
    }
}

verifyDeepResearchFlow();
