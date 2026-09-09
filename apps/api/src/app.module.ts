import { Module } from "@nestjs/common";
import { AgentModule } from "./agent/agent.module";
import { ApprovalsModule } from "./approvals/approvals.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { JobsModule } from "./jobs/jobs.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { SessionsModule } from "./sessions/sessions.module";

@Module({
  imports: [
    AuthModule,
    SessionsModule,
    AgentModule,
    RepositoriesModule,
    ApprovalsModule,
    JobsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
