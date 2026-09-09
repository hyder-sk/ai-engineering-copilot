export interface SharedAgentState {
  userRequest: string;
  repository?: string;
  status: "idle" | "planning" | "executing" | "review" | "completed";
  iteration: number;
}
