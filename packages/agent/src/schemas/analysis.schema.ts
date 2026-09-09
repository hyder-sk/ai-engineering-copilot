/** Analysis structured output — Phase 1 / 2 */
export interface AnalysisSchema {
  language: string;
  framework?: string;
  issues: Array<{
    severity: "low" | "medium" | "high" | "critical";
    category: string;
    summary: string;
    evidence?: string;
  }>;
}
