import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Platform, KeywordSuggestion, TopicSuggestion, OutlineOption, BlogInput, StyleCard, QualityReport, GroundingSource, SearchPeriod, InsightOption, ResearchSource, InsightCard, Blueprint, PostBrief } from "../types";
import { PROMPTS } from "./prompts";

function cleanJson(text: string): string {
  try {
    // 1. Remove markdown code blocks if present
    let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    // 2. Find the outer-most JSON block
    const firstOpenBrace = cleaned.indexOf('{');
    const lastCloseBrace = cleaned.lastIndexOf('}');
    const firstOpenBracket = cleaned.indexOf('[');
    const lastCloseBracket = cleaned.lastIndexOf(']');

    // Determine if it looks like an Object or Array
    let start = -1;
    let end = -1;

    // Heuristic: Pick the one that appears first
    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
      start = firstOpenBrace;
      end = lastCloseBrace;
    } else if (firstOpenBracket !== -1) {
      start = firstOpenBracket;
      end = lastCloseBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      return cleaned.substring(start, end + 1);
    }

    return cleaned;
  } catch (e) {
    return text;
  }
}

const getApiKey = () => {
  const viteKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
  return viteKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
};

const getGenAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
  return new GoogleGenerativeAI(apiKey);
};


async function checkAvailableModels(apiKey: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || ["No models found"];
  } catch (e) {
    return ["Failed to list models"];
  }
}

export async function formalizeManualStyle(manualText: string, brandText: string = "", knowledgeBase: string = ""): Promise<StyleCard & { keywords: string[] }> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            purpose: { type: SchemaType.STRING },
            structureTemplate: { type: SchemaType.STRING },
            toneRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            factRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            forbiddenList: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            formatRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            qaChecklist: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            brandIdentity: {
              type: SchemaType.OBJECT,
              properties: {
                mission: { type: SchemaType.STRING },
                values: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                targetAudience: { type: SchemaType.STRING },
                keyTerminology: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              }
            }
          }
        }
      }
    });

    const prompt = PROMPTS.formalizeStyle(manualText, brandText, knowledgeBase);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();
    const parsed = JSON.parse(cleanJson(resultText || "{}"));
    return { ...parsed, knowledgeBase };
  } catch (e: any) {
    const apiKey = getApiKey();
    const models = await checkAvailableModels(apiKey || "");
    console.error("Gemini Error:", e);
    console.error("Available Models:", models);
    throw new Error(`AI 호출 실패: ${e.message}. \n(사용 가능한 모델: ${models.join(", ")})`);
  }
}

export async function suggestKeywords(topic: string, platform: Platform, knowledgeBase?: string): Promise<KeywordSuggestion[]> {
  const genAI = getGenAI();
  const kbContext = knowledgeBase ? `[전문가 지식 베이스 활용] 지식 베이스(4,000개 데이터) 내의 'category'나 'tag'를 참고하여 이 주제("${topic}")와 연관된 고득점 전략 키워드를 제안하세요.` : "";
  const prompt = PROMPTS.suggestKeywords(topic, platform, kbContext);

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          keyword: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
          competition: { type: SchemaType.STRING },
          searchVolume: { type: SchemaType.STRING }
        }
      }
    } as any // Bypass strict type check for SchemaType enum matching
  };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", generationConfig });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(cleanJson(response.text() || "[]"));
  } catch (e: any) {
    if (e.status === 429 || e.message?.includes("429") || e.message?.includes("Quota")) {
      console.warn("suggestKeywords 2.5-flash rate limited. Switching to 2.0-flash...");
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", generationConfig });
        const result = await fallbackModel.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(cleanJson(response.text() || "[]"));
      } catch (fallbackError: any) {
        console.error("Fallback failed:", fallbackError);
        throw new Error("모든 AI 모델이 Busy 상태입니다. 잠시 후 다시 시도해주세요.");
      }
    }
    const apiKey = getApiKey();
    const models = await checkAvailableModels(apiKey || "");
    console.error("Gemini Error in suggestKeywords:", e);
    throw new Error(`AI 키워드 제안 실패: ${e.message}. \n(사용 가능한 모델: ${models.join(", ")})`);
  }
}

export async function suggestTitles(keyword: string, platform: Platform, brandGuide: string, styleGuide: string, targetAudience: string): Promise<TopicSuggestion[]> {
  const genAI = getGenAI();
  const prompt = PROMPTS.suggestTitles(keyword, platform, brandGuide, styleGuide, targetAudience);

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          flow: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING }
        }
      }
    } as any
  };

  try {
    // 1. Try Gemini 3 Pro (Preview)
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview", generationConfig });
    const result = await model.generateContent(prompt);
    const options = JSON.parse(cleanJson(result.response.text() || "[]"));

    // Helper to remove AI meta-data hallucinations
    const cleanTitle = (t: any) => {
      if (!t || typeof t !== 'string') return "제목 생성 중...";
      const cleaned = t
        .replace(/\[Mode.*?\]/gi, '') // Remove [Mode P], [Mode S...]
        .replace(/\[Option.*?\]/gi, '') // Remove [Option 1]
        .replace(/\(ver.*?\)/gi, '') // Remove (ver 1.0)
        .replace(/\[.*?Guide.*?\]/gi, '') // Remove [Brand Guide...]
        .replace(/\[.*?Style.*?\]/gi, '') // Remove [SuperfastSAT Style...]
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/\*\*/g, '') // Remove bold markers
        .trim();
      return cleaned || t; // If cleaning removes everything, revert to original
    };

    return options.map((opt: any) => ({
      type: 'Title Proposal',
      title: cleanTitle(opt.title),
      hook: opt.flow || opt.reason || "Logic Flow 생성 실패",
      isTimely: true
    }));

  } catch (error: any) {
    console.warn("suggestTitles Pro failed. Switching to Flash...", error);

    try {
      // 2. Fallback to Stable Flash (2.0) if Preview 3.0 fails
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig });
      const result = await fallbackModel.generateContent(prompt);
      const options = JSON.parse(cleanJson(result.response.text() || "[]"));

      return options.map((opt: any) => ({
        type: 'Title Proposal',
        title: opt.title,
        hook: opt.flow || opt.reason,
        isTimely: true
      }));

    } catch (fallbackError) {
      console.error("All models failed for suggestTitles:", fallbackError);
      return [{ type: 'Error', title: '제목 생성 오류', hook: '잠시 후 다시 시도해주세요.', isTimely: false }];
    }
  }
}

export async function suggestBriefContent(topic: string, period: SearchPeriod, customText?: string) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    tools: [{ googleSearch: {} } as any]
  });

  const prompt = `주제 "${topic}"에 대해 최신 트렌드를 리서치하십시오.\n[INSIGHT] 독창적 통찰\n[CONTEXT] 배경 상황`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const sources: GroundingSource[] = [];
  // Use 'any' type casting to access groundingMetadata as it might not be strictly typed in all SDK versions yet
  const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata;
  const chunks = groundingMetadata?.groundingChunks || [];

  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    }
  });

  const insightMatch = text.match(/\[INSIGHT\]([\s\S]*?)(?=\[CONTEXT\]|$)/i);
  const contextMatch = text.match(/\[CONTEXT\]([\s\S]*?)$/i);

  return {
    suggestedInsight: insightMatch ? insightMatch[1].trim() : "데이터 기반 전문 분석입니다.",
    suggestedContext: contextMatch ? contextMatch[1].trim() : text.trim(),
    sources
  };
}

export async function suggestOutlines(input: BlogInput, styleGuide: string): Promise<OutlineOption[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          sections: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        }
      } as any
    }
  });

  const prompt = PROMPTS.suggestOutlines(input.selectedTopic, input.platform, input.recentContext, input.uniqueInsight, styleGuide, input.targetAudience, input.selectedFlow);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsed = JSON.parse(cleanJson(response.text() || "{}"));

    // Helper to sanitize section names
    const cleanSection = (s: string) => {
      return s.replace(/\[Mode.*?\]/gi, '')
        .replace(/\(ver.*?\)/gi, '')
        .replace(/\[.*?Guide.*?\]/gi, '')
        .trim();
    };

    const sections = parsed.sections?.map(cleanSection) || [];

    // For compat, wrap in OutlineOption
    return [{
      id: '1',
      label: '제안된 목차 (수정 가능)',
      sections: sections.length > 0 ? sections : ["목차 생성 실패 - 다시 시도해주세요"],
      structure: 'Logical Flow',
      description: 'Selected Title based outline'
    }];
  } catch (e) {
    console.error("Outline Suggestion Error:", e);
    return [{
      id: 'error',
      label: '목차 생성 오류',
      sections: ['다시 시도해주세요.'],
      structure: 'Error',
      description: 'AI Parsing Failed'
    }];
  }
}

export async function suggestKeySentences(topic: string, outline: any, styleGuide: string, brandGuide: string, kbContext: string, targetAudience: string): Promise<{ sectionId: number, keySentence: string }[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = PROMPTS.suggestKeySentences(topic, outline, styleGuide, brandGuide, kbContext, targetAudience);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(cleanJson(response.text() || "[]"));
}

export async function* runWriterStream(input: BlogInput, style: StyleCard, research: string, sources: GroundingSource[], manualGuide: string, brandGuide: string) {
  const genAI = getGenAI();
  // FORCE HIGH QUALITY MODEL: User has paid plan
  // System Instruction: Inject Style & Brand Guide as the "OS"
  const systemInstruction = PROMPTS.writerSystemInstruction(input.platform, manualGuide, brandGuide, input.targetAudience);

  let model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview", // User requested Gemini 3
    systemInstruction: systemInstruction
  });

  const kbContext = (input.useKnowledgeBase && style.knowledgeBase) ? `
  [구조화된 지식 라이브러리(4,000개 데이터) 활용]
  - 당신은 제공된 라이브러리 데이터를 '절대적 진실(Ground Truth)'로 간주합니다.
  - JSON 형식일 경우, 특정 문제의 'id', 'question', 'explanation'을 아주 구체적으로 인용하여 본문에 녹여내십시오.
  - "우리 라이브러리의 #ID 데이터 분석 결과..." 와 같은 표현을 사용하십시오.
  - 데이터 내용: ${style.knowledgeBase}
  ` : "";

  const ctaInstruction = input.platform === 'Naver'
    ? `[CTA 전략: Soft Sell]
       - 대놓고 홍보하지 마십시오. 독자가 자연스럽게 궁금증을 가지도록 유도하십시오.
       - 문구 예시: '더 구체적인 사례가 궁금하다면 비밀 댓글 남겨주세요', '이 문제에 대한 해설지는 아래에서 확인 가능합니다'`
    : `[CTA 전략: Authority Sell]
       - 권위를 바탕으로 행동을 명확히 지시하십시오.
       - 문구 예시: 'Download the Full SAT Guide', 'View Case Study #12', 'Schedule a Consultation'`;

  const prompt = PROMPTS.writerPrompt(input, research, kbContext, ctaInstruction);

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
      return; // Success
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota")) {
        attempt++;
        if (attempt >= maxRetries) {
          console.warn("Max retries reached for Pro model. Critically failing to Flash as last resort.");
          yield "\n\n(시스템: 고급 모델 사용량이 폭주하여, 부득이하게 고속 모델로 전환합니다...)\n\n";
          const flashModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
          const result = await flashModel.generateContentStream(prompt);
          for await (const chunk of result.stream) {
            yield chunk.text();
          }
          return;
        }
        console.warn(`Pro model rate limited. Retrying in 2 seconds... (Attempt ${attempt}/${maxRetries})`);
        yield `\n(시스템: 고품질 생성을 위해 잠시 대기 중... ${attempt}/${maxRetries})\n`;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoffish
      } else {
        throw error;
      }
    }
  }
}

export async function* runWriterWsg3(input: BlogInput) {
  const genAI = getGenAI();
  const prompt = PROMPTS.writeBlogWsg3(input.postBrief, input.insightCard);

  // Use Gemini 3 Pro for high adherence instructions + Web Search for references
  let model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    tools: [{ googleSearch: {} } as any]
  });

  try {
    const result = await model.generateContentStream(prompt);

    // Note: Streaming with tools might behave differently. 
    // If the tool is invoked, it might not stream text immediately until tool returns.
    // For this implementation, we assume the model handles "search then write" or "write then search" flow.
    // Given the prompt instruction "After writing body... search references", it might do text first then tool, or vice versa.

    for await (const chunk of result.stream) {
      // Chunk text might differ if tool use logic is active. 
      // Safely extracting text.
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error: any) {
    console.error("Writer WSG3 Error:", error);
    yield `\n\n(오류 발생: ${error.message})\n\n`;

    // Fallback to Flash without tools if Pro fails
    yield "\n\n(시스템: 검색 도구 연결 실패로 고속 작성 모드로 전환합니다...)\n\n";
    const flashModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await flashModel.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}


export async function runQualityGate(content: string, platform: Platform): Promise<QualityReport> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          aiVisibilityScore: { type: SchemaType.NUMBER },
          aiAnalysisInsight: { type: SchemaType.STRING },
          fixSuggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        }
      }
    }
  });

  const result = await model.generateContent(PROMPTS.qualityGate(content, platform));
  const response = await result.response;
  return JSON.parse(cleanJson(response.text() || "{}"));
}

export async function runResearcher(topic: string, period: SearchPeriod, customText?: string) {
  const genAI = getGenAI();
  // Standard search tool usage is advanced, for now fallback to text generation if tool config not available directly
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    tools: [{ googleSearch: {} } as any]
  });

  const result = await model.generateContent(`주제 "${topic}"에 대한 최신 통계를 조사하세요.`);
  const response = await result.response;

  // Mocking sources if tools aren't active in this standard SDK usage without deeper config
  return { content: response.text(), sources: [] };
}


// -- New Deep Research Logic --

export async function runDeepResearch(topic: string, useInternal: boolean, knowledgeBaseText: string = ""): Promise<InsightCard> {
  const genAI = getGenAI();
  const apiKey = getApiKey();

  // 1. Gather Raw Data
  let rawData = "";

  // A. Internal Search (Mock Vector DB)
  if (useInternal && knowledgeBaseText) {
    // Simple Keyword Match for now (Future: Vector Similarity Search)
    const keywords = topic.split(" ");
    const relevantLines = knowledgeBaseText.split("\n").filter(line =>
      keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))
    );
    rawData += `\n[Internal Database (CollegeBoard DB)]\n${relevantLines.slice(0, 20).join("\n")}\n...\n`;
  }

  // B. Web Search (Using Gemini Tool)
  try {
    const searchModel = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      tools: [{ googleSearch: {} } as any] // Cast as any to bypass type check
    });
    const searchResult = await searchModel.generateContent(`"${topic}"에 대한 최신 통계와 팩트를 검색해줘.`);
    const searchResponse = await searchResult.response;
    // Extract grounding chunks if available, or just use text
    rawData += `\n[Web Search Result]\n${searchResponse.text()}\n`;

    // groundingMetadata handling (Optional, for source tracking)
    // const grounding = (searchResponse.candidates?.[0] as any)?.groundingMetadata;
  } catch (e) {
    console.warn("Web Search Failed, falling back to internal only", e);
    rawData += `\n[Web Search Failed] ${e}\n`;
  }

  // 2. Synthesize Insight Card
  const synthesizerModel = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = PROMPTS.runResearch(topic, rawData);
  const result = await synthesizerModel.generateContent(prompt);
  const response = await result.response;
  const parsed = JSON.parse(cleanJson(response.text() || "{}"));

  return {
    facts: parsed.facts || ["데이터 분석 실패"],
    sources: parsed.sources || [],
    rawContext: rawData
  };
}

export async function runBriefBuilder(insightCard: InsightCard): Promise<PostBrief> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview", // Higher reasoning needed for clustering
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = PROMPTS.buildPostBrief(insightCard);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const brief = JSON.parse(cleanJson(response.text() || "{}"));
    return brief;
  } catch (e) {
    console.error("Brief Builder Error", e);
    throw new Error("브리핑 생성에 실패했습니다.");
  }
}


export async function analyzeManualReport(reportText: string): Promise<InsightCard> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = PROMPTS.analyzeManualReport(reportText);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsed = JSON.parse(cleanJson(response.text() || "{}"));

    return {
      facts: parsed.facts || ["수동 리포트 분석 실패"],
      sources: parsed.sources || [],
      rawContext: reportText // Keep original text as context
    };
  } catch (e) {
    console.error("Manual Report Analysis Error", e);
    throw new Error("수동 리포트 분석에 실패했습니다.");
  }
}


export async function suggestBlueprint(topic: string, insightCard: InsightCard, styleGuide: string, brandGuide: string, targetAudience: string): Promise<Blueprint> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview", // Architect needs intelligence
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = PROMPTS.suggestBlueprint(topic, insightCard, styleGuide, brandGuide, targetAudience);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const blueprint = JSON.parse(cleanJson(response.text() || "{}"));
    return blueprint;
  } catch (e) {
    console.error("Blueprint Generation Error", e);
    throw new Error("기획안(Blueprint) 생성에 실패했습니다.");
  }
}

export async function analyzeStyle(posts: string[], brandText: string = "", knowledgeBase: string = ""): Promise<StyleCard & { keywords: string[] }> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          purpose: { type: SchemaType.STRING },
          structureTemplate: { type: SchemaType.STRING },
          toneRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          factRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          forbiddenList: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          formatRules: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          qaChecklist: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          brandIdentity: {
            type: SchemaType.OBJECT,
            properties: {
              mission: { type: SchemaType.STRING },
              values: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              targetAudience: { type: SchemaType.STRING },
              keyTerminology: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
          }
        }
      } as any
    }
  });

  const result = await model.generateContent(PROMPTS.analyzeStyle(posts, brandText, knowledgeBase));
  const response = await result.response;
  const parsed = JSON.parse(cleanJson(response.text() || "{}"));
  return { ...parsed, knowledgeBase };
}

export async function tuneStyle(originalDraft: string, finalContent: string, currentGuide: string) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          analysis: { type: SchemaType.STRING },
          suggestions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                targetSection: { type: SchemaType.STRING },
                action: { type: SchemaType.STRING },
                rule: { type: SchemaType.STRING }
              }
            }
          }
        }
      } as any
    }
  });

  try {
    const result = await model.generateContent(PROMPTS.tuneStyle(currentGuide, originalDraft, finalContent));
    const response = await result.response;
    return JSON.parse(cleanJson(response.text() || "{}"));
  } catch (e) {
    console.error("Style Tuning Error:", e);
    return {
      analysis: "스타일 분석 중 오류가 발생했습니다.",
      suggestions: []
    };
  }
}
