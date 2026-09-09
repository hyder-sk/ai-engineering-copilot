/**
 * Agent shared state (Phase 6).
 * Placeholder until LangGraph Annotation / reducers are added.
 */
export interface AgentState {
  userRequest: string;
  repository?: string;
  status: "idle" | "planning" | "executing" | "review" | "completed";
  iteration: number;
}
