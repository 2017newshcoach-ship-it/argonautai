
import { Platform } from "../types";

export const PROMPTS = {
  formalizeStyle: (manualText: string, brandText: string, knowledgeBase: string) => `
    사용자의 스타일 가이드라인, 브랜드 정체성, 그리고 전문가 지식 베이스(JSON 또는 텍스트)를 분석하여 JSON으로 변환하세요.
    [지식 베이스 데이터] ${knowledgeBase}
    이 데이터가 JSON 형식일 경우, 각 객체의 구조(id, question, explanation 등)를 파악하여 향후 집필 시 이를 검색/인용할 수 있는 '라이브러리 지능'으로 설정하십시오.
    
    가이드라인:
    ${manualText}
    
    브랜드:
    ${brandText}
  `,

  suggestKeywords: (topic: string, platform: Platform, kbContext: string) => `
    ${kbContext}
    주제 "${topic}"에 대해 ${platform} 검색 엔진 최적화 키워드를 제안하세요. 각 키워드의 경쟁 강도(competition)와 추천 사유(reason), 그리고 **예상 월간 검색량(searchVolume)**(예: 'High (10k+)', 'Medium (1k~10k)', 'Niche (<1k)')을 추정하여 포함하십시오.
  `,

  suggestTitles: (topic: string, platform: Platform, brandGuide: string, styleGuide: string, targetAudience: string) => `
    [Brand & Style Guide]
    Brand Voice: ${brandGuide}
    Writing Style: ${styleGuide}

    주제: ${topic}
    플랫폼: ${platform}
    타겟 독자: ${targetAudience === 'Parent' ? '학부모 (Mode P)' : '학생 (Mode S)'}

    [Persona & Mindset]
    당신은 **'SuperfastSAT 블로그 작가'**입니다.
    - **핵심 목표**: 정답이 아니라 **'입증 가능한 판단'**을 제시하여 독자의 사고 회로를 재설계하는 것입니다.
    - **Target Mode**: 반드시 **${targetAudience === 'Parent' ? '학부모님/어머님 (존댓말, 관찰적 어조)' : '학생 (너/여러분, 직관적 어조)'}** 독자만 향해 말하십시오.

    [지시사항 (Instruction Override)]
    위 '스타일 가이드'의 내용은 글쓰기 톤앤매너(Tone & Manner)와 논리 구조(Logic System)만 참고하십시오.
    **가이드 내의 '4) 작성 프로세스'나 '출력 형식'은 무시하고, 반드시 아래 'JSON Format'을 따르십시오.**

    위 'SuperfastSAT 글쓰기 원칙'을 완벽하게 소화하여, 독자가 클릭할 수밖에 없는 "강력한 논증적 제목" 3가지와 "논리 전개(Flow)"를 제안하세요.
    - **Mode Compliance**: ${targetAudience === 'Parent' ? '학부모가 자녀의 문제를 해결하고 싶어하는 심리' : '학생이 당장 점수를 올리고 싶어하는 심리'}를 자극하십시오.
    - **금지**: '1등급', '상위권' 등 한국식 용어 금지 -> '800점', 'High Scorer' 등 미국식 용어 사용.
    - **Flow 형식**: 반드시 "Intro: ... -> Body: ... -> Outro: ..." (텍스트 화살표) 사용.

    Output JSON Format:
    [
      { 
        "title": "제목 텍스트 (여기에 'Mode S', '[Option 1]' 같은 메타데이터 절대 포함 금지)", 
        "flow": "Intro: ... -> Body: ... -> Outro: ...", 
        "reason": "이 제목을 선정한 전략적 이유" 
      }
    ]

    **[CRITICAL INSTRUCTION]** 
    - The "title" field must contain **ONLY the blog title string**. Do not include [Mode P], [Option 1], brackets, versions, or reasoning within the title value.
    - ONLY return the raw JSON Array. Do not wrap in markdown blocks like \`\`\`json.
    `,

  suggestInsights: (topic: string, platform: Platform, searchVolume: string, volumeStrategy: string, kbContext: string) => `
    ${kbContext}
    주제: ${topic}
    플랫폼: ${platform}
    검색량 레벨: ${searchVolume}
    ${volumeStrategy}

    이 주제를 관통하는 3가지 독창적/심층적 분석 관점(Angle)을 제시하십시오.
  `,

  suggestOutlines: (topic: string, platform: Platform, context: string, insight: string, styleGuide: string, targetAudience: string, selectedFlow: string) => `
    [기본 스타일 가이드]
    ${styleGuide}

    주제: ${topic} (${platform})
    타겟 독자: ${targetAudience === 'Parent' ? '학부모 (Mode P - "학부모님/어머님" 호칭 사용)' : '학생 (Mode S - "너/여러분" 호칭 사용)'}
    선택된 논리 전개 (Flow): ${selectedFlow}
    선택된 흐름(Context): ${context}
    핵심 통찰(Insight): ${insight}

    위 내용을 바탕으로 블로그 글 개요(Outline)를 제안하세요.
    
    [필수 구조 요구사항 (Writing Guide v3.4c)]
    1. **도입부 필수 모듈**:
       - "이 글을 읽어야 할 대상" (Target & Condition)
       - "오늘 다룰 범위" (Scope)
       - "판정 기준 요약" (3-Line Judgment)
    2. **본문 전개**: 선택된 '논리 전개(Flow)'를 뼈대로 하여 섹션을 구성하십시오.
    3. **결론**: 감정적 마무리가 아닌, "다음 확인 과제"나 "Action Item"으로 끝내십시오.

    **[중요] 모든 내용은 반드시 '한국어(Korean)'로 작성하십시오. (영어 사용 금지)**
    
    Output JSON Format:
    {
      "sections": [
        "1. 서론: (Target/Scope/Judgment 포함)",
        "2. 본문 1: ...",
        "3. 결론: ..."
      ]
    }
    `,

  suggestKeySentences: (topic: string, outline: any[], styleGuide: string, brandGuide: string, kbContext: string, targetAudience: string) => `
    당신은 **SuperfastSAT 블로그 전략가**입니다. (전문 에디터 모드)
    아래 목차의 각 섹션에 들어갈 "핵심 문장(Key Sentence)"을 하나씩 작성하십시오.
    
    [Target Audience Setting]
    **${targetAudience === 'Parent' ? 'MODE P (학부모)' : 'MODE S (학생)'}**
    - 이 핵심 문장은 최종 글의 뼈대가 되므로, 반드시 위 타겟의 심리와 수준에 맞춰 작성되어야 합니다.
    - 학부모: "관리", "확인", "불안 해소", "판단 기준" 키워드 중심
    - 학생: "점수", "단축", "실전", "행동 요령" 키워드 중심

    [핵심 지침]
    1. **단일 명제**: 섹션마다 하나의 명확한 주장(Claim)을 담으십시오.
    2. **준거 기반**: 지식 베이스가 있다면 구체적인 근거(Anchor)를 포함하십시오.
    
    [시스템 프롬프트 (Style)]
    ${styleGuide}

    [브랜드 가이드]
    ${brandGuide}

    [지식 베이스 (참조)]
    ${kbContext.substring(0, 1000)}... (핵심만 참조)

    [주제] ${topic}

    [목차]
    ${JSON.stringify(outline)}

    출력 형식: JSON Array
    [{ "sectionId": number, "keySentence": "..." }, ...]
    `,

  writerSystemInstruction: (platform: Platform, styleJson: string, brandGuide: string, targetAudience: string) => `
    // V3.4c: User's Style Guide IS the System Prompt.
    // We strictly inject it as the 'Constitution' of the Agent.
    
    당신은 **SuperfastSAT 블로그 전략가**입니다. (Software OS: v3.4c)
    아래 [시스템 프롬프트]를 당신의 **기본 본능**으로 설정하고 절대적으로 따르십시오.

    [Target Audience Setting: ${targetAudience === 'Parent' ? 'MODE P (학부모)' : 'MODE S (학생)'}]
    - **MODE P**: 호칭은 "학부모님" 또는 "어머님". 학생에게 직접 지시 금지. 관찰/점검/의사결정 언어로 번역.
    - **MODE S**: 호칭은 "여러분" 또는 "너". 학부모 호칭 금지. 직접적인 행동 지시 가능.
    - **CRITICAL**: 글 처음부터 끝까지 이 모드를 "절대 유지"하십시오. 혼용하면 실패입니다.

    ============================================================
    [시스템 프롬프트 (Critical Instruction)]
    ${styleJson}

    [브랜드 가이드 (Brand Identity)]
    ${brandGuide}
    ============================================================

    [작성 프로세스 강제 (Worksheet First)]
    글을 출력하기 전에 반드시 내부적으로 **[A] 내부 설계(Worksheet)** 단계를 거치십시오.
    1. 단일 명제(One Claim) 설정
    2. 핵심 정의 & 구분선(Boundary) 설정
    3. 반례(Counterexample) & 수정 규칙 준비
    4. 품질 게이트(Evidence Gate A~E) 통과 여부 검증
    5. **표(Table) 설계**: (분류/절차/판정/훈련) 트리거 확인 -> 표 목적 선언 -> 4종 중 선택
    
    위 설계를 마친 후, **[B] 독자용 출력(최종 결과물)**으로 번역하여 출력하십시오.
    
    [표(Table) 작성 절대 규칙 (Professionalism)]
    - **트리거**: 분류/절차/판정/훈련 내용이 있다면 **반드시 표를 삽입**하십시오.
    - **목적 선언**: 표 제목 바로 아래에 "이 표의 목적: ..." 한 줄을 반드시 쓰십시오.
    - **금지**: Wrong/Right, 정답/오답 같은 라벨 사용 금지 -> 중립적 라벨(A/B, 비용큼/비용작음) 사용.
    - **형식**: 반드시 Markdown Table 문법(|header|header|)을 사용하십시오.
    
    ${platform === 'Naver' ? '네이버 블로그 환경: 모바일 가독성(짧은 줄바꿈)을 준수하되, 논증의 깊이는 유지하십시오.' : '구글 SEO 환경: 명확한 H tag와 구조적인 마크다운을 사용하십시오.'}
  `,

  writerPrompt: (input: any, research: string, kbContext: string, ctaInstruction: string) => `
    [전체 분석 리포트 작성]
    
    ${input.blueprint ? `
    [🛑 CRITICAL: BLUEPRINT AUTHORIZED]
    편집장(Architect)이 승인한 아래 **기획안(Blueprint)**을 그대로 집필하십시오.
    제목, 목차, 각 섹션의 핵심 문장, 할당된 팩트를 임의로 변경하지 마십시오.
    
    [Blueprint Data]
    ${JSON.stringify(input.blueprint, null, 2)}
    ` : `
    [주제] ${input.topic}
    [선택된 키워드] ${input.selectedKeyword}
    [개요]
    ${JSON.stringify(input.cluster || {})}
    [최근 맥락] ${input.recentContext}
    [독자적인 통찰] ${input.uniqueInsight}
    `}

    [참고 자료 (Research & Evidence)]
    ${input.insightCard ? JSON.stringify(input.insightCard.facts) : research}

    [지식 베이스 권한 (Knowledge Base)]
    ${kbContext}

    [CTA 지침]
    ${ctaInstruction}

    [작성 규칙]
    1. ${input.platform === 'Naver'
      ? '[Platform: Naver Blog (Plain Text ONLY)]\n       - **CRITICAL**: 마크다운(**, ##) 사용 시 시스템 에러가 발생합니다. 절대 사용하지 마십시오.\n       - **강조**: 강조하고 싶다면 ** 대신 [강조] 또는 \'공백\'을 사용하거나, 특수기호(■)를 쓰십시오.\n       - **List 대체**: - 대신 ·(가운뎃점)이나 숫자를 사용하되, 자동 들여쓰기 기능을 쓰지 마십시오.\n       - **영어 병기**: 첫 1회만 허용(필수). 이후엔 한글만 사용.'
      : '[Platform: Google SEO (Markdown Style)]\n       - H2, H3 태그를 사용하여 구조를 명확히 하십시오.\n       - Bold(**)와 List(-, 1.)를 적극 활용하십시오.\n       - 전문 용어는 괄호(English)를 사용하여 정확성을 높이십시오.'}
    2. 지식 베이스의 내용이 있다면 반드시 '[#ID]' 형태로 출처를 표시하십시오.
3. ${input.platform === 'Naver' ? '[MOBILE_READABILITY] 모바일 가독성을 극대화하기 위해 \'한 문장 = 한 줄\' 원칙을 지키십시오. 문장이 끝나면 반드시 줄바꿈을 2번(Enter Enter) 하십시오.' : '[SEMANTIC_SEO] 핵심 키워드를 H태그와 본문에 자연스럽게 배치하십시오.'}
    
    [작성 시작]
    위 모든 지침을 통합하여, 서론-본론-결론의 완결된 글을 작성하십시오.
  `,

  writerFallbackMessage: "\n\n(시스템: 최신 모델(Gemini 3.0) 트래픽 초과로 인해 고속 모델(Flash)로 자동 전환하여 집필을 완료합니다...)\n\n",

  qualityGate: (content: string, platform: Platform) => `원고 검수: ${content} \n플랫폼: ${platform} `,

  runResearch: (topic: string, rawData: string) => `
    당신은 **최고의 데이터 분석가**입니다. 수집된 Raw Data를 분석하여 블로그 작성에 필요한 '핵심 재료(Insight Card)'를 추출하십시오.
    
    [주제]: ${topic}
    [수집된 데이터]: 
    ${rawData.substring(0, 15000)}

    [요청사항]
    1. 주제를 관통하는 가장 중요한 **팩트(Fact) 3가지**를 뽑으십시오. (입증 가능해야 함)
    2. 데이터 내에서 유효한 **출처(Source)**를 식별하여 리스트업하십시오.

    [Output JSON Format]
    {
      "facts": ["Fact 1", "Fact 2", "Fact 3"],
      "sources": [
        { "id": "src_1", "title": "Source Title", "type": "Web/Internal", "url": "..." },
        ...
      ]
    }
  `,

  analyzeManualReport: (reportText: string) => `
    당신은 **데이터 정규화 전문가**입니다.
    사용자가 붙여넣은 [외부 리서치 리포트]를 분석하여, 블로그 작성에 필요한 표준 포맷(Insight Card)으로 변환하십시오.

    [Input Report]
    ${reportText.substring(0, 20000)}

    [Rules]
    1. **Fact Extraction**: 리포트 내의 핵심 사실/통계/전략을 최대 10개까지 추출하십시오.
    2. **Source Detection**: URL이나 출처 언급이 있다면 최대한 sources 배열에 포함하십시오. (없으면 빈 배열)
    3. **No Hallucination**: 원문에 없는 내용은 절대 지어내지 마십시오.

    [Output JSON Format]
    {
      "facts": ["..."],
      "sources": [{ "id": "src_1", "title": "...", "url": "..." }]
    }
  `,

  buildPostBrief: (insightCard: any) => `
    [POST BRIEF Builder v2.0 | RESOURCE-first | 본문=RESOURCE-only 전제]

    역할: 너는 SuperfastSAT 블로그 에디터입니다.
    목표: [RESOURCE]만 근거로 [POST BRIEF]를 역추출해 생성합니다.
    중요: RESOURCE에 없는 사실/수치/단정은 만들지 않습니다.

    [RESOURCE (Insight Card)]
    Facts: ${JSON.stringify(insightCard.facts)}
    Sources: ${JSON.stringify(insightCard.sources)}

    [작업 절차]
    1. RESOURCE의 핵심 주장/규칙/개념을 주제 덩어리 2~5개로 묶습니다(클러스터).
    2. **메인 클러스터**를 1개만 선택해 잠급니다. (기준: 반복 많음, 행동 루틴 있음, 경계선 명확)
    3. 아래 [POST BRIEF] 항목은 "메인 클러스터"에서만 작성합니다.
    4. 메인 클러스터 기반으로 '추천 케이스(A~H)'를 1개 고릅니다.
       - A: 정의 → 판정 규칙 → 학습 루틴
       - B: 증상 → 패턴(유형) → 해결 루틴
       - C: 기준선 → 원인 → 끊는 방법
       - D: 오해 → 기준/규칙 → 루틴
       - E: 프레임 → 예시 감각 → 루틴
       - F: 오늘 할 일 → 최소 이유 → 루틴
       - G: 범위 잠금 → 핵심만 남김 → 루틴화
       - H: 진단 → 원인/기준 → 처방

    [Output JSON Format]
    {
      "cluster": "선택된 메인 클러스터 주제 한 줄 요약",
      "caseType": "A", // A~H 중 하나
      "target": "타깃 독자 (상황/점수대/기간)",
      "purpose": "글의 목적 (교육/반박/전략/가이드 등)",
      "frame": "핵심 프레임 (3C / w2i / 유형 분류 등, 없으면 '미정')",
      "question": "글에서 반드시 답할 질문 1개"
    }
  `,

  writeBlogWsg3: (postBrief: any, resource: any) => `
    [WSG v3.0 | 3개 목차 케이스 선택형 | 라벨 완전 금지 | 예시 조건부 | 레퍼런스 자동 웹검색 | CTA 금지 | 이모지/구어체 조건부 허용]

    너는 “친절하게 설명하는 전문가” 톤으로 SuperfastSAT 네이버 블로그 포스팅 1편을 작성합니다.
    본문은 **[RESOURCE]만 근거로 작성**하되, 레퍼런스는 웹 검색 도구를 사용하여 자동 수집해 URL과 함께 기재합니다.

    [POST BRIEF]
    ${JSON.stringify(postBrief, null, 2)}

    [RESOURCE]
    ${JSON.stringify(resource, null, 2)}

    ────────────────────────────────
    1) P0 절대 규칙 (강제)
    [문체] “합니다/입니다” 체 사용 ( “~다/~이다” 금지).
    [도입 3파트]
      [1] 이런 분들에게 도움을 드리고자 썼습니다. (불릿 2~4개)
      [2] 목차 (반드시 3개 항목, 본문 섹션과 1:1 일치)
      [3] 바쁘시면 이것만 보세요! (3~4줄 요약)
    [CTA 금지] 상담/문의/링크 유도 금지. 오직 ‘학습 행동’만 허용.
    [사실성] RESOURCE에 없는 사실/수치 생성 금지. (필요 시 ‘가상 예시’라 명시)

    2) 최우선 출력 규칙: 라벨 완전 금지
    - "정의:", "팁:", "체크리스트:" 같은 라벨 절대 금지. 자연스러운 문장으로 서술.

    3) 이모지/구어체 조건부 허용
    - 이모지: 글 전체 최대 3개 (친절함 목적).
    - 구어체: 착각을 잡아줄 때만 한 문단 1회 제한.

    4) 본문 구조 (케이스 ${postBrief.caseType} 적용)
    - 목차 3개 = 본문 헤딩 3개.
    - 각 섹션은 리소스 내용을 바탕으로 서술.

    5) 레퍼런스 자동 검색 (Tool Usage)
    - 본문 작성 후, 본문에 나온 핵심 개념/프레임/규칙에 대해 Google Search를 수행하여 신뢰할 수 있는 출처(URL)를 찾으십시오.
    - 글 하단에 "레퍼런스" 섹션을 만들고 링크를 기재하십시오.

    [작성 시작]
    위 규칙을 준수하여 블로그 글을 작성하십시오.
  `,

  suggestBlueprint: (topic: string, insightCard: any, styleGuide: string, brandGuide: string, targetAudience: string) => `
    당신은 **SuperfastSAT 블로그 편집장(Architect)**입니다.
    확보된 'Insight Card(재료)'와 'Style Guide(설계도)'를 결합하여, 완벽한 블로그 기획안(Blueprint)을 작성하십시오.

    [Target Audience Setting]
    **${targetAudience === 'Parent' ? 'MODE P (학부모)' : 'MODE S (학생)'}**

    [Insight Card (재료)]
    - Facts: ${JSON.stringify(insightCard.facts)}
    - Sources: ${JSON.stringify(insightCard.sources)}

    [Style/Brand Guide (규칙)]
    ${styleGuide}
    ${brandGuide}

    [임무]
    위 재료를 배치하여 가장 설득력 있는 **Blueprint(기획안)**를 완성하십시오.
    
    1. **Title**: 클릭을 유도하는 매력적인 제목 (메타데이터 제외)
    2. **Flow**: Intro -> Body -> Outro 흐름
    3. **Sections**: 
       - 각 섹션마다 **'다룰 내용(Description)'**과 **'핵심 문장(Key Sentence)'**을 정의하십시오.
       - 각 섹션에 사용할 **'참조 소스 ID(Source IDs)'**를 할당하십시오. (Fact 기반 집필 강제)
    
    [Output JSON Format]
    {
      "title": "Blog Title",
      "flow": "Intro: ... -> Body: ... -> Outro: ...",
      "targetAudience": "${targetAudience}",
      "sections": [
        {
          "sectionId": 1,
          "title": "서론: ...",
          "description": "타겟 독자의 공감을 유도하고 문제 제기",
          "keySentence": "가장 중요한 주장 (One Claim)",
          "sourceIds": ["src_1"]
        },
        ...
      ]
    }
  `,

  analyzeStyle: (posts: string[], brandText: string, knowledgeBase: string) => `스타일 DNA 추출: \n글: ${posts.join('\n')} \n브랜드: ${brandText} \n지식베이스: ${knowledgeBase} `,

  tuneStyle: (currentGuide: string, originalDraft: string, finalContent: string) => `
    당신은 **SuperfastSAT 블로그 수석 에디터**입니다.
    사용자가 AI가 작성한 [Original Draft]를 수정하여 [Final Version]을 발행했습니다.
    두 글을 비교 분석하여, **현재 스타일 가이드(Current Guide)**에 반영해야 할 **"구체적인 수정 제안(Rules)"**을 도출하십시오.

    [Current Style Guide]
    ${currentGuide}

    [Original Draft (AI)]
    ${originalDraft.substring(0, 3000)}... (생략)

    [Final Version (User)]
    ${finalContent.substring(0, 3000)}... (생략)

    [분석 및 제안 원칙 (Conservative Mode)]
    1. **핵심 논리 존중**: 가이드의 1~3번 항목(논증 구조, 근거 게이트 등)은 건드리지 마십시오.
    2. **표면적 스타일 집중**: 사용자가 수정한 **어조(Tone), 줄바꿈(Format), 어휘(Vocabulary)**의 패턴을 찾으십시오.
       - 예: "AI는 ~합니다만 썼는데, 사용자는 ~해요를 섞어 쓰는구나."
       - 예: "AI는 3줄 문단을 썼는데, 사용자는 1줄씩 떼어 쓰는구나."
    3. **제안 형식**: 스타일 가이드의 **어느 섹션**에 **어떤 문장**을 추가/수정해야 하는지 명시하십시오.

    [Output Format (JSON)]
    {
      "analysis": "사용자는 ~한 경향이 있습니다. 특히 ~부분에서 차이가 큽니다.",
      "suggestions": [
        {
          "targetSection": "8) 스타일",
          "action": "Add / Modify",
          "rule": "새로 추가할 구체적인 규칙 문장"
        }
      ]
    }
  `
};
