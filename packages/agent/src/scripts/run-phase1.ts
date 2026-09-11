import { analyzeChain } from "../chains/analyze.chain.js";
import { summarizeChain } from "../chains/summarize.chain.js";

/** Sample NestJS snippet with an obvious N+1 / performance smell */
const SAMPLE_CODE = `
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    const result = [];
    for (const user of users) {
      const profile = await this.usersService.findProfileByUserId(user.id);
      const orders = await this.usersService.findOrdersByUserId(user.id);
      result.push({ ...user, profile, orders });
    }
    return result;
  }
}
`.trim();

async function main() {
  console.log("=== Phase 1: summarize ===\n");
  const summary = await summarizeChain({ code: SAMPLE_CODE });
  console.log(summary);

  console.log("\n=== Phase 1: analyze (structured) ===\n");
  const analysis = await analyzeChain({ code: SAMPLE_CODE });
  console.log(JSON.stringify(analysis, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
