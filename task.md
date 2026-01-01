# Task List: Deep Research Workflow Refactor

## Phase 1: Backend Foundation (Types & Service Logic)
- [x] **Define Types**: Update `types.ts` with `ResearchSource`, `InsightCard`, `Blueprint`.
- [x] **Research Service**: Implement `runDeepResearch` in `geminiService.ts` (Web + Internal Mock).
- [x] **Blueprint Service**: Implement `suggestBlueprint` in `geminiService.ts`.
- [x] **Prompt Engineering**: Create `PROMPTS.researcher` and `PROMPTS.blueprint` in `prompts.ts`.

## Phase 2: Frontend Components (The 3 Steps)
- [x] **Step 1: Research Console**: Create `Step1Research.tsx` (Topic Input + Insight Review).
- [x] **Step 2: The Architect**: Create `Step2Architect.tsx` (Blueprint Review & Edit).
- [x] **Step 3: The Writer**: Update `Step3Writer.tsx` to consume `Blueprint`.
- [x] **App Wiring**: Update `App.tsx` state machine to 3-step loop.

## Phase 3: Verification & Cleanup
- [x] **Verification**: Update `verify_gen.ts` to test the new pipeline.
- [x] **Cleanup**: Remove deprecated files (`Step2Keyword`, `Step3Title`, `Step5Outline`, etc.).

## Phase 4: Research Refinement UI (User Request)
- [x] **Step 1 Update**: Add Edit/Delete/Add buttons to `InsightCard` display in `Step1Research.tsx`.
- [x] **State Logic**: Ensure manual edits persist to `BlogInput`.
- [x] **Validation**: Verify that edited facts are correctly passed to Step 2.

## Phase 5: Architect Refinement UI (User Request)
- [x] **Step 2 Update**: Add Edit/Delete/Reorder features to `Step2Architect.tsx`.
- [x] **State Logic**: Manage `Blueprint` state updates locally.
- [x] **Validation**: Verify that the Writer receives the modified Blueprint.
