
export type Platform = 'Google' | 'Naver';
export type TargetAudience = 'Parent' | 'Student'; // 신규: 타겟 독자
export type SATCluster = "Core" | "ScoreStrategy" | "Subject" | "Class" | "Admission" | "SpecialTrack" | "Comparison";
export type SearchPeriod = 'all' | 'day' | 'week' | 'month' | '3months' | 'year' | 'custom';
export type AnalysisFocus = 'broad' | 'micro';

export interface BrandIdentity {
  mission: string;
  values: string[];
  targetAudience: string;
  keyTerminology: string[];
}

export interface StyleCard {
  purpose: string;
  structureTemplate: string;
  toneRules: string[];
  factRules: string[];
  forbiddenList: string[];
  formatRules: string[];
  qaChecklist: string[];
  brandIdentity?: BrandIdentity;
  knowledgeBase?: string;
}

export interface KeywordSuggestion {
  keyword: string;
  reason: string;
  competition: 'Low' | 'Medium' | 'High';
  searchVolume: string;
}

export interface TopicSuggestion {
  title: string;
  hook: string;
  type: string;
  isTimely: boolean;
}

export interface OutlineOption {
  id: string;
  label: string;
  structure: string;
  description: string;
  sections: string[];
}

export interface InsightOption {
  id: string;
  angle: string;
  description: string;
  context: string;
}

export interface KeySentence {
  sectionId: number;
  originalText: string;
  keySentence: string;
}


export interface ResearchSource {
  id: string;
  title: string;
  url?: string; // Web URL
  content?: string; // Internal Snippet
  type: 'Web' | 'Internal';
}

export interface InsightCard {
  facts: string[]; // "핵심 발견 3가지"
  sources: ResearchSource[];
  rawContext: string; // The full raw text for the Architect
}

export interface Blueprint {
  title: string;
  flow: string; // "Intro -> Body -> Outro"
  targetAudience: TargetAudience;
  sections: {
    sectionId: number;
    title: string;
    description: string; // "이 섹션에서 다룰 내용"
    keySentence: string; // "이 섹션의 핵심 명제"
    sourceIds: string[]; // "참조할 소스 ID"
  }[];
}

export interface BlogInput {
  platform: Platform;
  targetAudience: TargetAudience;
  topic: string;

  // -- New Workflow State --
  insightCard?: InsightCard;
  blueprint?: Blueprint;

  // -- Deprecated/Transitioning Fields (Keep for now to avoid breakages during refactor) --
  selectedKeyword: string;
  selectedTopic: string;
  selectedFlow: string;
  libraryFiles: any[];
  searchPeriod: SearchPeriod;
  customSearchPeriod: string;
  analysisFocus: AnalysisFocus;
  useKnowledgeBase: boolean;

  // Fully deprecated but kept for TS compatibility until cleanup
  cluster?: SATCluster;
  uniqueInsight?: string;
  recentContext?: string;
  selectedOutlineId?: string;
  customSections?: string[];
  keySentences?: KeySentence[];
}

export interface QualityReport {
  aiVisibilityScore: number;
  aiAnalysisInsight: string;
  fixSuggestions: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
