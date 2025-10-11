import { Controller, Get, Render } from "@nestjs/common";

@Controller()
export class ViewsController {
  @Get()
  @Render("index")
  home() {
    return {};
  }
}
