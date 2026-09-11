import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    const result = [];

    // Intentional N+1: profile + orders fetched per user inside the loop
    for (const user of users) {
      const profile = await this.usersService.findProfileByUserId(user.id);
      const orders = await this.usersService.findOrdersByUserId(user.id);
      result.push({ ...user, profile, orders });
    }

    return result;
  }
}
