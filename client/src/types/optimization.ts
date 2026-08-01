export interface OptimizationResult {
  atsScore: number;
  matchPercent: number;
  keywordDensity: number;
  missingSkills: string[];
  matchedSkills: string[];
  weakBullets: string[];
  grammarIssues: string[];
  formattingSuggestions: string[];
  keywordSuggestions: string[];
  summary: string;
}

export interface Optimization {
  _id: string;
  resumeId: string;
  jdId: string;
  resumeTitle: string;
  jdTitle: string;
  jdCompany: string;
  result: OptimizationResult;
  createdAt: string;
  updatedAt: string;
}
