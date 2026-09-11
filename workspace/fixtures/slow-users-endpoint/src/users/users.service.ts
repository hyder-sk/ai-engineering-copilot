import { Injectable } from "@nestjs/common";

export type User = { id: number; email: string };
export type Profile = { userId: number; name: string };
export type Order = { id: number; userId: number; total: number };

@Injectable()
export class UsersService {
  async findAll(): Promise<User[]> {
    // Simulated DB: returns many users
    return [
      { id: 1, email: "a@example.com" },
      { id: 2, email: "b@example.com" },
      { id: 3, email: "c@example.com" },
    ];
  }

  async findProfileByUserId(userId: number): Promise<Profile> {
    // Simulated per-user DB round-trip
    return { userId, name: `User ${userId}` };
  }

  async findOrdersByUserId(userId: number): Promise<Order[]> {
    // Simulated per-user DB round-trip
    return [{ id: userId * 10, userId, total: 100 }];
  }
}
