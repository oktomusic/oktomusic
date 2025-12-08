import { Injectable } from "@nestjs/common";

import { PrismaService } from "../db/prisma.service";
import type { User } from "../generated/prisma/client";

@Injectable()
export class ApiService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { id: "asc" },
    });
  }

  getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
