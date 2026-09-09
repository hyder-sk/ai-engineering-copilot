import { Body, Controller, Post } from "@nestjs/common";
import { AgentService } from "./agent.service";
import type { RunAgentDto } from "./dto/run-agent.dto";
import type { HumanDecisionDto } from "./dto/human-decision.dto";

@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("run")
  run(@Body() body: RunAgentDto) {
    return this.agentService.run(body);
  }

  @Post("resume")
  resume(@Body() body: HumanDecisionDto) {
    return this.agentService.resume(body);
  }
}
