import { Controller, Get } from "@nestjs/common";
import { ApiService } from "./api.service";
import type { HelloWorld } from "../generated/prisma";

@Controller("api")
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get("info")
  getInfo(): Promise<HelloWorld[]> {
    return this.apiService.listHelloWorld();
  }
}
