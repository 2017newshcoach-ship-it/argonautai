# Implementation Plan: Deep Research First Architecture

## 🎯 Vision
Switch from "Structure-First" (picking titles/outlines blindly) to **"Content-First"** (gathering data -> organizing it -> writing).
This mimics the user's proven manual workflow: "Deep Research -> Apply Style Guide -> Output".

---

## 🏗️ New Workflow (3 Steps)

### Step 1: Deep Research (The Miner) ⛏️
**"재료를 모으는 단계"**
*   **Goal**: 주제에 대한 "입증 가능한 근거(Evidence)"와 "최신 맥락(Context)" 확보.
*   **Inputs**:
    *   `Topic`: 사용자가 입력 (예: Digital SAT Inference)
    *   `Search Mode`: **Web** (구글 검색) vs **Internal** (CollegeBoard DB) vs **Hybrid**
*   **Action (AI)**:
    *   **Web**: 구글 검색 툴을 사용하여 최신 트렌드/통계 수집.
    *   **Internal**: `DOCS/collegeboard study guide` (향후 Vector DB)에서 관련 문항/해설 인용.
*   **Output (UI)**: **"Insight Card"**
    *   "이 주제의 핵심 발견(Facts) 3가지"
    *   "수집된 참고자료(Sources) 리스트"
    *   사용자는 이 재료를 보고 "이거 써주세요" 승인.

### Step 2: The Architect (The Blueprint) 📐
**"재료를 배치하는 단계"**
*   **Inputs**: **[Step 1 Insight Card]** + **[Writing Style Guide]** + **[Brand Guide]**
*   **Action (AI)**:
    *   확보된 팩트를 가장 효과적으로 전달할 **제목**과 **목차**를 짭니다.
    *   가이드 규칙(표, 3-Line Judgment)을 강제 적용합니다.
*   **Output (UI)**: **"Blueprint (기획안)"**
    *   제목, 논리 흐름(Flow), 섹션별 핵심 문장(Key Sentence)이 한 판에 보임.
    *   사용자 수정 가능.

### Step 3: The Writer (The Builder) ✍️
**"건물을 올리는 단계"**
*   **Inputs**: **[Blueprint]** + **[Brand Guide]**
*   **Action**: 설계도대로 집필. (기존 로직 유지하되, 입력 프롬프트 강화)

---

## 🛠️ Technical Changes

### 1. Types (`types.ts`)
*   Add `ResearchSource` interface (Web vs Internal).
*   Add `InsightCard` interface (The output of Step 1).
*   Add `Blueprint` interface (The output of Step 2).

### 2. Service Layer (`geminiService.ts`)
*   **[NEW] `runDeepResearch(topic, mode)`**:
    *   Uses Gemini's `tools: [{ googleSearch: {} }]` for web.
    *   Uses RAG-lite (Text Search currently) for `knowledge_base.txt`.
    *   Synthesizes findings into `InsightCard`.
*   **[NEW] `suggestBlueprint(insightData, guides)`**:
    *   Prompt: "Based on these FACTS, structure a blog post following the GUIDE."

### 3. Vector DB Readiness
*   Current: using `DOCS/collegeboard study guide` (Text file) as a Mock DB.
*   Future path: The `runDeepResearch` function creates an abstraction layer. Later, we just swap the text search implementation with a Vector DB query (e.g., Pinecone/Chroma) without breaking the rest of the app.

---

## 📅 Execution Roadmap
1.  **Backend**: Implement `runDeepResearch` and `suggestBlueprint`.
2.  **Frontend Step 1**: Replace Strategy/Keyword UI with **"Research Console"**.
3.  **Frontend Step 2**: Create **"Blueprint Review"** UI.
4.  **Wiring**: Connect to Step 3 Writer.
