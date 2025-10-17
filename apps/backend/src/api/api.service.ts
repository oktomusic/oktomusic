import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import type { HelloWorld } from "../generated/prisma";

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
}
