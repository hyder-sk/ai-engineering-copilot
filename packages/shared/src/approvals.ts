export type ApprovalDecision = "approve" | "reject" | "modify";

export interface ApprovalRequest {
  id: string;
  sessionId: string;
  path: string;
  diff: string;
  decision?: ApprovalDecision;
  modifiedDiff?: string;
}
