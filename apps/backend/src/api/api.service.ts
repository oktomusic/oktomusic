import { Injectable } from "@nestjs/common";

import { PrismaService } from "../db/prisma.service";
import type { HelloWorld } from "../generated/client";

@Injectable()
export class ApiService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return "Hello World!";
  }

  listHelloWorld(): Promise<HelloWorld[]> {
    return this.prisma.helloWorld.findMany({
      orderBy: { id: "asc" },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { id: "asc" },
    });
  }

  getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
