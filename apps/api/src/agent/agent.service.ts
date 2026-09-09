import { Injectable } from "@nestjs/common";
import type { RunAgentDto } from "./dto/run-agent.dto";
import type { HumanDecisionDto } from "./dto/human-decision.dto";

/**
 * Thin Nest wrapper — imports packages/agent graph later.
 * Keep graph logic out of Nest decorators (Studio compatibility).
 */
@Injectable()
export class AgentService {
  run(body: RunAgentDto) {
    return {
      sessionId: body.sessionId ?? "pending",
      status: "not_implemented",
      message: "Agent runtime comes in later phases",
    };
  }

  resume(_body: HumanDecisionDto) {
    return {
      status: "not_implemented",
      message: "HITL resume comes in Phase 7",
    };
  }
}
