import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

import { Role } from "../../generated/client";

import { AuthGuard } from "./auth.guard";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, ensure user is authenticated
    await this.authGuard.canActivate(context);

    const request = context.switchToHttp().getRequest<Request>();

    if (request.user?.role !== Role.ADMIN) {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
