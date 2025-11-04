import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("api/auth")
@ApiTags("Auth")
export class AuthController {
  @Get("login")
  check() {
    return "ok";
  }

  @Get("session")
  session() {
    return "ok";
  }

  @Get("refresh")
  refresh() {
    return "ok";
  }

  @Get("logout")
  logout() {
    return "ok";
  }
}
