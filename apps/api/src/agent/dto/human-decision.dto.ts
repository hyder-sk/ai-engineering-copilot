export interface HumanDecisionDto {
  sessionId: string;
  decision: "approve" | "reject" | "modify";
  modifiedDiff?: string;
}
