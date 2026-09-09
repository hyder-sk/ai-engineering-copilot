export interface RunAgentRequest {
  sessionId?: string;
  userRequest: string;
  repositoryPath?: string;
}

export interface RunAgentResponse {
  sessionId: string;
  status: string;
  message?: string;
}
